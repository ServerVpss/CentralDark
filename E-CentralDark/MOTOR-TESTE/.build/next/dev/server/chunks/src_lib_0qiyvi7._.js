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
"[project]/src/lib/db/adapters/betterSqliteAdapter.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createBetterSqliteAdapter",
    ()=>createBetterSqliteAdapter
]);
function createBetterSqliteAdapter(db) {
    return {
        driver: "better-sqlite3",
        get open () {
            return db.open;
        },
        get name () {
            return db.name;
        },
        prepare (sql) {
            const stmt = db.prepare(sql);
            return {
                run: (...params)=>stmt.run(...params),
                get: (...params)=>stmt.get(...params),
                all: (...params)=>stmt.all(...params)
            };
        },
        exec (sql) {
            db.exec(sql);
        },
        pragma (pragmaStr, options) {
            return db.pragma(pragmaStr, options);
        },
        transaction (fn) {
            return db.transaction(fn);
        },
        immediate (fn) {
            db.transaction(fn).immediate();
        },
        async backup (destination) {
            await db.backup(destination);
        },
        checkpoint (mode = "TRUNCATE") {
            try {
                db.pragma(`wal_checkpoint(${mode})`);
            } catch  {}
        },
        close () {
            db.close();
        },
        get raw () {
            return db;
        }
    };
}
}),
"[project]/src/lib/db/adapters/bunSqliteAdapter.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createBunSqliteAdapter",
    ()=>createBunSqliteAdapter
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
;
function normalizeRunResult(result) {
    return {
        changes: Number(result.changes ?? 0),
        lastInsertRowid: Number(result.lastInsertRowid ?? 0)
    };
}
function normalizeParams(params) {
    if (params.length !== 1) return params;
    const [first] = params;
    if (first === null || typeof first !== "object" || Array.isArray(first) || first instanceof Uint8Array || typeof Buffer !== "undefined" && Buffer.isBuffer(first)) {
        return params;
    }
    // better-sqlite3 callers use bare object keys for @name, :name, and $name.
    // Bun requires the sigil to match the SQL placeholder, so provide all three
    // aliases just as the sql.js adapter does.
    const expanded = {};
    for (const [key, value] of Object.entries(first)){
        if (/^[:@$]/.test(key)) {
            expanded[key] = value;
        } else {
            expanded[`@${key}`] = value;
            expanded[`:${key}`] = value;
            expanded[`$${key}`] = value;
        }
    }
    return [
        expanded
    ];
}
function createBunSqliteAdapter(db, filePath) {
    let isOpen = true;
    return {
        driver: "bun:sqlite",
        get open () {
            return isOpen;
        },
        get name () {
            return filePath;
        },
        prepare (sql) {
            const statement = db.query(sql);
            return {
                run (...params) {
                    return normalizeRunResult(statement.run(...normalizeParams(params)));
                },
                get (...params) {
                    return statement.get(...normalizeParams(params));
                },
                all (...params) {
                    return statement.all(...normalizeParams(params));
                }
            };
        },
        exec (sql) {
            db.exec(sql);
        },
        pragma (pragmaStr, options) {
            const statement = db.query(`PRAGMA ${pragmaStr}`);
            if (options?.simple) {
                const row = statement.get();
                return row ? Object.values(row)[0] ?? null : null;
            }
            return statement.all();
        },
        transaction (fn) {
            return db.transaction(fn);
        },
        immediate (fn) {
            const transaction = db.transaction(fn);
            if (typeof transaction.immediate === "function") {
                transaction.immediate();
                return;
            }
            db.exec("BEGIN IMMEDIATE");
            try {
                fn();
                db.exec("COMMIT");
            } catch (error) {
                try {
                    db.exec("ROLLBACK");
                } catch  {}
                throw error;
            }
        },
        async backup (destination) {
            if (filePath === ":memory:") return;
            try {
                db.exec("PRAGMA wal_checkpoint(TRUNCATE)");
            } catch  {}
            __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].copyFileSync(filePath, destination);
        },
        checkpoint (mode = "TRUNCATE") {
            try {
                db.exec(`PRAGMA wal_checkpoint(${mode})`);
            } catch  {}
        },
        close () {
            if (!isOpen) return;
            db.close();
            isOpen = false;
        },
        get raw () {
            return db;
        }
    };
}
}),
"[project]/src/lib/db/adapters/nodeSqliteShared.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createNodeSqliteAdapterFromDatabase",
    ()=>createNodeSqliteAdapterFromDatabase
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
;
const MAX_STMT_CACHE_SIZE = 200;
function createNodeSqliteAdapterFromDatabase(db, filePath, onClose) {
    let _isOpen = true;
    let transactionDepth = 0;
    const stmtCache = new Map();
    function finalizeStatement(stmt) {
        if (stmt && "finalize" in stmt) {
            try {
                stmt.finalize();
            } catch  {}
        }
    }
    function getCached(sql) {
        let entry = stmtCache.get(sql);
        if (entry) {
            stmtCache.delete(sql);
            stmtCache.set(sql, entry);
        } else {
            const stmt = db.prepare(sql);
            if (stmtCache.size >= MAX_STMT_CACHE_SIZE) {
                const oldestKey = stmtCache.keys().next().value;
                if (oldestKey !== undefined) {
                    finalizeStatement(stmtCache.get(oldestKey)?.stmt);
                    stmtCache.delete(oldestKey);
                }
            }
            entry = {
                stmt
            };
            stmtCache.set(sql, entry);
        }
        return entry.stmt;
    }
    function runSavepoint(fn, ...args) {
        const sp = `sp_${Math.random().toString(36).slice(2)}`;
        db.exec(`SAVEPOINT "${sp}"`);
        try {
            const result = fn(...args);
            db.exec(`RELEASE "${sp}"`);
            return result;
        } catch (err) {
            try {
                db.exec(`ROLLBACK TO "${sp}"`);
                db.exec(`RELEASE "${sp}"`);
            } catch  {}
            throw err;
        }
    }
    function runImmediate(fn) {
        if (transactionDepth > 0) {
            runSavepoint(fn);
            return;
        }
        db.exec("BEGIN IMMEDIATE");
        transactionDepth += 1;
        try {
            fn();
            db.exec("COMMIT");
        } catch (error) {
            try {
                db.exec("ROLLBACK");
            } catch  {} // The failed transaction may already have released its write lock.
            throw error;
        } finally{
            transactionDepth -= 1;
        }
    }
    function close() {
        try {
            onClose?.();
        } catch  {}
        try {
            for (const entry of stmtCache.values()){
                finalizeStatement(entry.stmt);
            }
            stmtCache.clear();
        } catch  {}
        try {
            db.close();
        } catch  {}
        _isOpen = false;
    }
    return {
        driver: "node:sqlite",
        get open () {
            return _isOpen;
        },
        get name () {
            return filePath;
        },
        prepare (sql) {
            const stmt = getCached(sql);
            return {
                run (...params) {
                    const r = stmt.run(...params);
                    return {
                        changes: Number(r.changes ?? 0),
                        lastInsertRowid: Number(r.lastInsertRowid ?? 0)
                    };
                },
                get (...params) {
                    return stmt.get(...params);
                },
                all (...params) {
                    return stmt.all(...params);
                }
            };
        },
        exec (sql) {
            db.exec(sql);
        },
        pragma (pragmaStr, options) {
            const sql = `PRAGMA ${pragmaStr}`;
            if (options?.simple) {
                const row = db.prepare(sql).get();
                if (!row) return null;
                return Object.values(row)[0] ?? null;
            }
            return db.prepare(sql).all();
        },
        transaction (fn) {
            return (...args)=>{
                transactionDepth += 1;
                try {
                    return runSavepoint(fn, ...args);
                } finally{
                    transactionDepth -= 1;
                }
            };
        },
        immediate (fn) {
            runImmediate(fn);
        },
        async backup (destination) {
            const { backup } = await Promise.resolve().then(()=>__turbopack_context__.x("node:sqlite", ()=>require("node:sqlite"), true));
            if (typeof backup === "function") {
                await backup(db, destination);
                return;
            }
            try {
                db.exec("PRAGMA wal_checkpoint(TRUNCATE)");
            } catch  {}
            __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].copyFileSync(filePath, destination);
        },
        checkpoint (mode = "TRUNCATE") {
            try {
                db.exec(`PRAGMA wal_checkpoint(${mode})`);
            } catch  {}
        },
        close,
        get raw () {
            return db;
        }
    };
}
}),
"[project]/src/lib/db/adapters/driverFactory.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createSyncDriverFactory",
    ()=>createSyncDriverFactory,
    "getSqlJsAdapter",
    ()=>getSqlJsAdapter,
    "getSqlJsPreInitError",
    ()=>getSqlJsPreInitError,
    "isPackBootForcedSqlJsSmoke",
    ()=>isPackBootForcedSqlJsSmoke,
    "openDatabaseAsync",
    ()=>openDatabaseAsync,
    "preInitSqlJs",
    ()=>preInitSqlJs,
    "tryOpenSync",
    ()=>tryOpenSync
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$module__$5b$external$5d$__$28$node$3a$module$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:module [external] (node:module, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$adapters$2f$betterSqliteAdapter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/adapters/betterSqliteAdapter.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$adapters$2f$bunSqliteAdapter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/adapters/bunSqliteAdapter.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$adapters$2f$nodeSqliteShared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/adapters/nodeSqliteShared.ts [instrumentation] (ecmascript)");
const __TURBOPACK__import$2e$meta__ = {
    get url () {
        return `file://${__turbopack_context__.P("src/lib/db/adapters/driverFactory.ts")}`;
    },
    get turbopackHot () {
        return __turbopack_context__.m.hot;
    }
};
;
;
;
;
;
const _require = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$module__$5b$external$5d$__$28$node$3a$module$2c$__cjs$29$__["createRequire"])(__TURBOPACK__import$2e$meta__.url);
/**
 * The production loader for the sync driver cascade.
 *
 * WHY A SWITCH INSTEAD OF PASSING `_require` DIRECTLY
 * ---------------------------------------------------
 * `createSyncDriverFactory(load)` takes the loader as a parameter so the driver
 * branches stay testable. But webpack (the Next.js server build) only recognizes a
 * require when it can read the module id as a literal at the call site:
 *
 *   _require("better-sqlite3")   →  a real external: `module.exports = require("better-sqlite3")`
 *   load("better-sqlite3")       →  unanalyzable, so the loader ITSELF is replaced
 *
 * In the second case webpack cannot see what `load` is, so the value passed in is
 * replaced by its "missing module" stub — a function whose only behavior is
 * `throw Error("Cannot find module '" + id + "'")` with `code = "MODULE_NOT_FOUND"`.
 * Every driver in the cascade then reports itself as not installed even though the
 * addon is present on disk, the whole cascade falls through to the sql.js WASM last
 * resort, and startup dies there instead — pointing the blame at sql.js rather than at
 * the bundling. Observed in the packaged v3.8.49 server build, where the driver chunk
 * contains that stub and NO `require("better-sqlite3")` external, while the previous
 * release's chunk (before the loader became injectable) contains the external and no
 * stub. Not reproducible from source: `tsx`/`node --test` resolve the injected
 * `_require` normally, so the existing unit tests pass either way.
 *
 * Naming each module in a direct `_require("<literal>")` call restores the externals
 * webpack emitted before the loader became injectable, while keeping the seam intact.
 * Keep the literals literal: hoisting them into a constant or a map keyed by variable
 * re-breaks the analysis.
 */ function requireSqliteDriver(moduleName) {
    switch(moduleName){
        case "bun:sqlite":
            return __turbopack_context__.r("[externals]/bun:sqlite [external] (bun:sqlite, cjs)");
        case "better-sqlite3":
            return __turbopack_context__.r("[externals]/better-sqlite3 [external] (better-sqlite3, cjs, [project]/node_modules/better-sqlite3)");
        case "node:sqlite":
            return (()=>{
                const e = new Error("Cannot find module 'node:sqlite': Unsupported external type Url for commonjs reference");
                e.code = 'MODULE_NOT_FOUND';
                throw e;
            })();
        default:
            throw new Error(`Unsupported SQLite driver module: ${moduleName}`);
    }
}
function toNodeSqliteOptions(options) {
    if (options?.readonly !== true) return undefined;
    return {
        readOnly: true
    };
}
/**
 * Logs the underlying cause of a swallowed sync-driver failure (#7288
 * secondary finding). tryOpenSync() used to swallow both driver errors in
 * empty catch {} blocks, so an ABI mismatch or permission error never
 * reached the logs — only the generic "(falhou)"/"(indisponível)" strings
 * in core.ts's thrown message survived, making the failure undiagnosable.
 */ function logSwallowedDriverError(driver, err) {
    const message = err instanceof Error ? err.message : String(err);
    console.debug(`[DB] Sync driver '${driver}' failed to open, will try next driver: ${message}`);
}
function getSqlJsCache() {
    if (!globalThis.__omnirouteSqlJsAdapters) {
        globalThis.__omnirouteSqlJsAdapters = new Map();
    }
    return globalThis.__omnirouteSqlJsAdapters;
}
function getSqlJsPreInitErrorCache() {
    if (!globalThis.__omnirouteSqlJsPreInitErrors) {
        globalThis.__omnirouteSqlJsPreInitErrors = new Map();
    }
    return globalThis.__omnirouteSqlJsPreInitErrors;
}
function getSqlJsPreInitError(filePath) {
    return getSqlJsPreInitErrorCache().get(filePath);
}
/**
 * Cache das Promises de inicialização EM VOO (não resolvidas ainda), por filePath.
 * Separado de getSqlJsCache() (que só guarda o adapter já resolvido) para que
 * chamadores concorrentes (BATCH/STARTUP/HealthCheck/ProviderLimitsSync no boot)
 * compartilhem UMA única leitura+decode do arquivo em vez de cada um chamar
 * fs.readFileSync + WASM decode independentemente (#6628 — thundering herd).
 */ function getSqlJsPendingCache() {
    if (!globalThis.__omnirouteSqlJsInitPromises) {
        globalThis.__omnirouteSqlJsInitPromises = new Map();
    }
    return globalThis.__omnirouteSqlJsInitPromises;
}
function createSyncDriverFactory(load) {
    return function tryOpenSync(filePath, options) {
        // Bun ships a supported SQLite implementation. Prefer it over the native
        // Node addon, which Bun intentionally skips because its ABI is incompatible.
        if (process.versions.bun) {
            try {
                const { Database } = load("bun:sqlite");
                if (options?.fileMustExist === true && filePath !== ":memory:" && !(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(filePath)) {
                    throw new Error(`SQLite file does not exist: ${filePath}`);
                }
                const db = new Database(filePath, {
                    ...options?.readonly === true ? {
                        readonly: true
                    } : {
                        readwrite: true,
                        create: options?.fileMustExist !== true
                    }
                });
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$adapters$2f$bunSqliteAdapter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createBunSqliteAdapter"])(db, filePath);
            } catch (err) {
                logSwallowedDriverError("bun:sqlite", err);
            }
        }
        // better-sqlite3: rápido, nativo — skip em Bun
        if (!process.versions.bun) {
            try {
                const BetterSqlite = load("better-sqlite3");
                const db = new BetterSqlite(filePath, options);
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$adapters$2f$betterSqliteAdapter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createBetterSqliteAdapter"])(db);
            } catch (err) {
                // continua para próximo driver
                logSwallowedDriverError("better-sqlite3", err);
            }
        }
        // node:sqlite: built-in desde Node 22.5 — skip em Bun
        if (!process.versions.bun) {
            const [maj, min] = (process.versions.node ?? "0.0").split(".").map(Number);
            if (maj > 22 || maj === 22 && min >= 5) {
                try {
                    if (options?.fileMustExist === true && filePath !== ":memory:" && !(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(filePath)) {
                        throw new Error(`SQLite file does not exist: ${filePath}`);
                    }
                    const { DatabaseSync } = load("node:sqlite");
                    const nodeOptions = toNodeSqliteOptions(options);
                    const db = nodeOptions ? new DatabaseSync(filePath, nodeOptions) : new DatabaseSync(filePath);
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$adapters$2f$nodeSqliteShared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createNodeSqliteAdapterFromDatabase"])(db, filePath);
                } catch (err) {
                    // continua
                    logSwallowedDriverError("node:sqlite", err);
                }
            }
        }
        return null;
    };
}
const openSyncDriver = createSyncDriverFactory(requireSqliteDriver);
function isPackBootForcedSqlJsSmoke(env) {
    return env.OMNIROUTE_PACK_BOOT_SMOKE === "1" && env.OMNIROUTE_PACK_BOOT_FORCE_SQLJS === "1";
}
function tryOpenSync(filePath, options) {
    if (isPackBootForcedSqlJsSmoke(process.env)) return null;
    return openSyncDriver(filePath, options);
}
async function preInitSqlJs(filePath) {
    const cache = getSqlJsCache();
    const existing = cache.get(filePath);
    if (existing) {
        if (existing.open) return existing;
        // Stale handle left over by a prior close/reload (e.g. gracefulShutdown or
        // resetDbInstance closed the underlying WASM db but this globalThis-backed
        // cache — deliberately shared across re-invocations for idempotency — still
        // holds the reference). Reusing it would make every subsequent query throw
        // the raw string "Database closed" straight from sql.js (#6560). Evict and
        // recreate instead of returning a dead connection.
        cache.delete(filePath);
    }
    // Share one in-flight load across concurrent callers for the same filePath
    // (#6628): without this, each of BATCH/STARTUP/HealthCheck/ProviderLimitsSync
    // independently fs.readFileSync + WASM-decode the same (possibly 300+MB) file
    // at boot, multiplying peak memory pressure by the number of racing callers.
    const pending = getSqlJsPendingCache();
    const inflight = pending.get(filePath);
    if (inflight !== undefined) return inflight;
    const initPromise = (async ()=>{
        const { createSqlJsAdapter } = await __turbopack_context__.A("[project]/src/lib/db/adapters/sqljsAdapter.ts [instrumentation] (ecmascript, async loader)");
        const adapter = await createSqlJsAdapter(filePath);
        cache.set(filePath, adapter);
        getSqlJsPreInitErrorCache().delete(filePath);
        return adapter;
    })();
    pending.set(filePath, initPromise);
    try {
        return await initPromise;
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        getSqlJsPreInitErrorCache().set(filePath, message);
        throw err;
    } finally{
        pending.delete(filePath);
    }
}
function getSqlJsAdapter(filePath) {
    return getSqlJsCache().get(filePath) ?? null;
}
async function openDatabaseAsync(filePath, options) {
    const sync = tryOpenSync(filePath, options);
    if (sync) {
        console.log(`[DB] Driver: ${sync.driver} | file: ${filePath}`);
        return sync;
    }
    console.warn("[DB] Synchronous drivers unavailable — falling back to sql.js (WASM)");
    const adapter = await preInitSqlJs(filePath);
    console.log(`[DB] Driver: sql.js | file: ${filePath}`);
    return adapter;
}
}),
"[project]/src/lib/db/probeUtils.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Probe-retry utilities for the SQLite corruption-probe path in getDbInstance().
 *
 * Transient probe errors (SQLITE_BUSY, ENOENT, SQLITE_PROTOCOL, SQLITE_IOERR)
 * should be retried with backoff instead of immediately renaming the DB away
 * and creating an empty one (data loss under concurrent load, #9541).
 */ __turbopack_context__.s([
    "isTransientProbeError",
    ()=>isTransientProbeError,
    "retryProbeIfTransient",
    ()=>retryProbeIfTransient
]);
function isTransientProbeError(error) {
    const message = error instanceof Error ? error.message : String(error);
    return /SQLITE_BUSY|SQLITE_PROTOCOL|SQLITE_IOERR|ENOENT/i.test(message);
}
/**
 * Synchronous sleep that blocks the event loop for `ms` milliseconds.
 * Only used in the transient-probe-error retry path where we are already in
 * a synchronous context (better-sqlite3). Uses `Atomics.wait` which yields to
 * the OS scheduler during the wait, falling back to a busy-wait on runtimes
 * where Atomics.wait is restricted.
 */ function syncSleep(ms) {
    if (typeof SharedArrayBuffer !== "undefined" && typeof Atomics !== "undefined") {
        try {
            Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
            return;
        } catch  {
        // Atomics.wait may throw on restricted runtimes — fall through to busy-wait
        }
    }
    const deadline = Date.now() + ms;
    while(Date.now() < deadline){
    /* busy-wait */ }
}
function retryProbeIfTransient(sqliteFile, probeError, openDb, closeDb) {
    if (!isTransientProbeError(probeError)) return false;
    const retryDelays = [
        500,
        1000,
        2000
    ];
    for(let i = 0; i < retryDelays.length; i++){
        syncSleep(retryDelays[i]);
        try {
            const retryAdapter = openDb(sqliteFile, {
                readonly: true
            });
            closeDb(retryAdapter);
            return true;
        } catch  {
        // Retry failed, try next delay
        }
    }
    console.warn(`[DB] All ${retryDelays.length} transient probe retries exhausted — declaring corruption`);
    return false;
}
}),
"[project]/src/lib/db/migrationRunner/constants.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * db/migrationRunner/constants.ts — Static migration-compatibility data tables.
 *
 * Pure data (no imports, no DB, no behaviour) extracted verbatim from
 * migrationRunner.ts: the renamed/legacy/superseded migration maps and the
 * physical/initial schema sentinels used by the reconciliation, dedup, and
 * already-applied detection paths. Kept separate so the orchestrator host
 * file holds logic, not data tables.
 */ __turbopack_context__.s([
    "INITIAL_SCHEMA_SENTINELS",
    ()=>INITIAL_SCHEMA_SENTINELS,
    "LEGACY_VERSION_SLOT_MIGRATIONS",
    ()=>LEGACY_VERSION_SLOT_MIGRATIONS,
    "OPTIONAL_FTS5_MIGRATION_VERSIONS",
    ()=>OPTIONAL_FTS5_MIGRATION_VERSIONS,
    "PHYSICAL_SCHEMA_SENTINELS",
    ()=>PHYSICAL_SCHEMA_SENTINELS,
    "RENAMED_MIGRATION_COMPATIBILITY",
    ()=>RENAMED_MIGRATION_COMPATIBILITY,
    "SUPERSEDED_DUPLICATE_MIGRATIONS",
    ()=>SUPERSEDED_DUPLICATE_MIGRATIONS
]);
const RENAMED_MIGRATION_COMPATIBILITY = [
    {
        fromVersion: "022",
        fromName: "call_logs_summary_storage",
        toVersion: "025",
        toName: "call_logs_summary_storage"
    },
    {
        fromVersion: "028",
        fromName: "provider_connection_max_concurrent",
        toVersion: "029",
        toName: "provider_connection_max_concurrent"
    },
    {
        fromVersion: "028",
        fromName: "compression_settings",
        toVersion: "034",
        toName: "compression_settings"
    },
    {
        fromVersion: "032",
        fromName: "create_reasoning_cache",
        toVersion: "033",
        toName: "create_reasoning_cache"
    },
    {
        fromVersion: "032",
        fromName: "compression_analytics",
        toVersion: "038",
        toName: "compression_analytics"
    },
    {
        fromVersion: "033",
        fromName: "compression_cache_stats",
        toVersion: "039",
        toName: "compression_cache_stats"
    },
    {
        fromVersion: "041",
        fromName: "session_account_affinity",
        toVersion: "050",
        toName: "session_account_affinity"
    },
    {
        fromVersion: "051",
        fromName: "usage_history_service_tier",
        toVersion: "054",
        toName: "usage_history_service_tier"
    },
    {
        fromVersion: "052",
        fromName: "manifest_routing",
        toVersion: "059",
        toName: "manifest_routing"
    },
    {
        fromVersion: "056",
        fromName: "manifest_routing",
        toVersion: "059",
        toName: "manifest_routing"
    }
];
const LEGACY_VERSION_SLOT_MIGRATIONS = [
    {
        version: "028",
        name: "evals_tables"
    },
    {
        version: "029",
        name: "webhooks_templates"
    },
    {
        version: "030",
        name: "mcp_scopes_api_keys"
    },
    {
        version: "031",
        name: "api_keys_expires"
    },
    {
        version: "032",
        name: "detailed_logs_warnings"
    },
    {
        version: "033",
        name: "provider_connections_block_extra_usage"
    },
    {
        version: "033",
        name: "add_batch_id_to_call_logs"
    },
    {
        version: "046",
        name: "remove_status_from_files"
    },
    {
        version: "051",
        name: "remove_status_from_files"
    }
];
const SUPERSEDED_DUPLICATE_MIGRATIONS = [
    {
        version: "041",
        name: "session_account_affinity",
        supersededByVersion: "050",
        supersededByName: "session_account_affinity"
    }
];
const PHYSICAL_SCHEMA_SENTINELS = [
    {
        version: "028",
        tableName: "batches",
        description: "batches table"
    },
    {
        version: "024",
        tableName: "sync_tokens",
        description: "sync_tokens table"
    },
    {
        version: "022",
        tableName: "memory_fts",
        description: "memory_fts virtual table"
    },
    {
        version: "019",
        tableName: "context_handoffs",
        description: "context_handoffs table"
    },
    {
        version: "064",
        tableName: "session_model_history",
        description: "session_model_history table"
    },
    {
        version: "017",
        tableName: "version_manager",
        description: "version_manager table"
    },
    {
        version: "016",
        tableName: "skill_executions",
        description: "skill_executions table"
    },
    {
        version: "015",
        tableName: "memories",
        description: "memories table"
    },
    {
        version: "013",
        tableName: "quota_snapshots",
        description: "quota_snapshots table"
    },
    {
        version: "011",
        tableName: "webhooks",
        description: "webhooks table"
    },
    {
        version: "010",
        tableName: "model_combo_mappings",
        description: "model_combo_mappings table"
    },
    {
        version: "008",
        tableName: "registered_keys",
        description: "registered_keys table"
    },
    {
        version: "006",
        tableName: "request_detail_logs",
        description: "request_detail_logs table"
    },
    {
        version: "004",
        tableName: "proxy_registry",
        description: "proxy_registry table"
    },
    {
        version: "002",
        tableName: "mcp_tool_audit",
        description: "mcp_tool_audit table"
    }
];
const INITIAL_SCHEMA_SENTINELS = [
    "provider_connections",
    "combos",
    "call_logs"
];
const OPTIONAL_FTS5_MIGRATION_VERSIONS = new Set([
    "022",
    "023"
]);
}),
"[project]/src/lib/db/migrationRunner/extraDirs.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EXTRA_MIGRATIONS_DIRS_ENV",
    ()=>EXTRA_MIGRATIONS_DIRS_ENV,
    "getExtraMigrationFiles",
    ()=>getExtraMigrationFiles,
    "parseExtraMigrationDirs",
    ()=>parseExtraMigrationDirs,
    "readNamespacedMigrationFiles",
    ()=>readNamespacedMigrationFiles
]);
/**
 * extraDirs.ts — additional migration directories with a namespaced version space.
 *
 * The runner's own directory (`MIGRATIONS_DIR`) owns the bare numeric version
 * space: `NNN_name.sql` is recorded in `_omniroute_migrations` as `NNN`. That
 * single namespace is fine while one party appends to it, and breaks as soon as a
 * distribution ships its own migrations next to the upstream set — both sides draw
 * from the same numbers, and when they pick the same one the runner records a
 * single name for it and treats the other as already applied. The migration then
 * never runs, silently, on every already-provisioned database.
 *
 * This module lets an operator register extra directories, each under its own
 * namespace:
 *
 *   OMNIROUTE_EXTRA_MIGRATIONS_DIRS="ee=/opt/app/enterprise/db/migrations"
 *
 * Entries are separated by `path.delimiter` (`:` on POSIX, `;` on Windows) and a
 * file `NNN_name.sql` found there is recorded as `<namespace>-NNN`, so it can
 * never collide with an upstream slot. Unset — the default, and always the case
 * for a plain install — nothing changes.
 *
 * Misconfiguration throws instead of being skipped: a typo'd namespace or a moved
 * directory would otherwise reproduce the exact silent-missing-schema failure this
 * mechanism exists to prevent. A directory listed here is a declaration that its
 * schema is required.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
const EXTRA_MIGRATIONS_DIRS_ENV = "OMNIROUTE_EXTRA_MIGRATIONS_DIRS";
/**
 * Namespaces become a version prefix (`ee-134`), so they stay lowercase,
 * alphanumeric and hyphen-free — the hyphen is the separator, and a numeric first
 * character would make `1-001` ambiguous against a bare numeric version.
 */ const NAMESPACE_PATTERN = /^[a-z][a-z0-9]*$/;
const MAX_NAMESPACE_LENGTH = 16;
/** Same shape the runner's own directory listing produces. */ const MIGRATION_FILE_PATTERN = /^(\d+)_(.+)\.sql$/;
function parseExtraMigrationDirs(raw) {
    if (typeof raw !== "string" || raw.trim().length === 0) return [];
    const seen = new Set();
    const out = [];
    for (const entry of raw.split(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].delimiter)){
        const spec = entry.trim();
        if (spec.length === 0) continue;
        const separator = spec.indexOf("=");
        if (separator <= 0) {
            throw new Error(`[Migration] Invalid ${EXTRA_MIGRATIONS_DIRS_ENV} entry "${spec}": ` + `expected "namespace=directory" (entries separated by "${__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].delimiter}").`);
        }
        const namespace = spec.slice(0, separator).trim();
        const rawDir = spec.slice(separator + 1).trim();
        if (!NAMESPACE_PATTERN.test(namespace) || namespace.length > MAX_NAMESPACE_LENGTH) {
            throw new Error(`[Migration] Invalid namespace "${namespace}" in ${EXTRA_MIGRATIONS_DIRS_ENV}: ` + `must match ${NAMESPACE_PATTERN} and be at most ${MAX_NAMESPACE_LENGTH} characters ` + `(it becomes the recorded version prefix, e.g. "${namespace || "ee"}-134").`);
        }
        if (seen.has(namespace)) {
            throw new Error(`[Migration] Duplicate namespace "${namespace}" in ${EXTRA_MIGRATIONS_DIRS_ENV}: ` + `each namespace maps to exactly one directory.`);
        }
        if (rawDir.length === 0) {
            throw new Error(`[Migration] Empty directory for namespace "${namespace}" in ${EXTRA_MIGRATIONS_DIRS_ENV}.`);
        }
        const dir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(rawDir);
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(dir)) {
            throw new Error(`[Migration] Directory for namespace "${namespace}" does not exist: ${dir}. ` + `A directory listed in ${EXTRA_MIGRATIONS_DIRS_ENV} is required schema — ` + `remove the entry if it is no longer shipped.`);
        }
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].statSync(dir).isDirectory()) {
            throw new Error(`[Migration] Path for namespace "${namespace}" is not a directory: ${dir}.`);
        }
        seen.add(namespace);
        out.push({
            namespace,
            dir
        });
    }
    return out;
}
function readNamespacedMigrationFiles(entry) {
    const parsed = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readdirSync(entry.dir).filter((f)=>f.endsWith(".sql")).map((filename)=>{
        const match = filename.match(MIGRATION_FILE_PATTERN);
        if (!match) return null;
        return {
            number: match[1],
            name: match[2],
            filename
        };
    }).filter(Boolean);
    const byNumber = new Map();
    for (const f of parsed){
        if (!byNumber.has(f.number)) byNumber.set(f.number, []);
        byNumber.get(f.number).push(f.name);
    }
    const collisions = [
        ...byNumber.entries()
    ].filter(([, names])=>names.length > 1);
    if (collisions.length > 0) {
        const summary = collisions.map(([number, names])=>`${entry.namespace}-${number} → [${names.join(", ")}]`).join("; ");
        throw new Error(`[Migration] Migration version collision detected in ${entry.dir}: ${summary}. ` + `Each migration file must have a unique numeric prefix within its namespace.`);
    }
    return parsed.sort((a, b)=>Number.parseInt(a.number, 10) - Number.parseInt(b.number, 10)).map((f)=>({
            version: `${entry.namespace}-${f.number}`,
            name: f.name,
            path: __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(entry.dir, f.filename)
        }));
}
function getExtraMigrationFiles() {
    const entries = parseExtraMigrationDirs(process.env[EXTRA_MIGRATIONS_DIRS_ENV]);
    if (entries.length === 0) return [];
    return entries.flatMap((entry)=>readNamespacedMigrationFiles(entry));
}
}),
"[project]/src/lib/db/migrationRunner.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MigrationSafetyAbortError",
    ()=>MigrationSafetyAbortError,
    "getMigrationStatus",
    ()=>getMigrationStatus,
    "runMigrations",
    ()=>runMigrations
]);
/**
 * Migration Runner — Versioned SQL Migrations for SQLite
 *
 * Reads numbered `.sql` files from the migrations directory and applies
 * them sequentially, tracking applied versions in a `schema_migrations` table.
 *
 * Naming convention: `NNN_description.sql` (e.g., `001_initial_schema.sql`)
 *
 * All migrations run within a single transaction — all-or-nothing per file.
 *
 * Safety features:
 * - Pre-migration backup before applying any pending migrations
 * - Mass-migration detection (abort if too many pending on existing DB)
 * - Migration name mismatch warning (detects renumbering issues)
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/url [external] (url, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/databaseSettings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/testProcess.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$migrationRunner$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/migrationRunner/constants.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$migrationRunner$2f$extraDirs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/migrationRunner/extraDirs.ts [instrumentation] (ecmascript)");
const __TURBOPACK__import$2e$meta__ = {
    get url () {
        return `file://${__turbopack_context__.P("src/lib/db/migrationRunner.ts")}`;
    },
    get turbopackHot () {
        return __turbopack_context__.m.hot;
    }
};
;
;
;
;
;
;
;
const isNodeTestRunnerChild = typeof process.env.NODE_TEST_CONTEXT === "string";
const console = {
    log: (...args)=>{
        if (!isNodeTestRunnerChild) globalThis.console.log(...args);
    },
    warn: (...args)=>{
        if (!isNodeTestRunnerChild) globalThis.console.warn(...args);
    },
    error: (...args)=>{
        globalThis.console.error(...args);
    }
};
/**
 * Resolve the migrations directory path safely across platforms.
 * On Windows with global npm installs, `import.meta.url` may not be a valid
 * `file://` URL, causing `fileURLToPath` to throw `ERR_INVALID_FILE_URL_PATH`.
 */ function resolveMigrationsDir() {
    const configuredDir = process.env.OMNIROUTE_MIGRATIONS_DIR;
    if (typeof configuredDir === "string" && configuredDir.trim().length > 0) {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(configuredDir);
    }
    const checkLocations = (basePath)=>{
        const locations = [
            __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(basePath, "migrations"),
            __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(basePath, "src", "lib", "db", "migrations"),
            __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(basePath, "app", "src", "lib", "db", "migrations")
        ];
        for (const loc of locations){
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(loc)) return loc;
        }
        return null;
    };
    try {
        let currentDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].dirname((0, __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__["fileURLToPath"])(__TURBOPACK__import$2e$meta__.url));
        while(currentDir !== __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].dirname(currentDir)){
            const found = checkLocations(currentDir);
            if (found) return found;
            currentDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].dirname(currentDir);
        }
    } catch  {
    // Fall through to more defensive URL parsing below.
    }
    // Fix #1704: On Windows with global npm installs, import.meta.url may contain
    // CI build-time paths (e.g., /home/runner/work/...) that are not valid file://
    // URLs on Windows. Extract the path portion directly and normalize it.
    const metaUrl = __TURBOPACK__import$2e$meta__.url;
    if (typeof metaUrl === "string" && metaUrl.startsWith("file://")) {
        try {
            // Strip the file:// prefix and decode, then normalize for the platform
            const rawPath = decodeURIComponent(metaUrl.replace(/^file:\/\/\//, "/").replace(/^file:\/\//, ""));
            let currentDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].dirname(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(rawPath));
            while(currentDir !== __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].dirname(currentDir)){
                const found = checkLocations(currentDir);
                if (found) return found;
                currentDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].dirname(currentDir);
            }
        } catch  {
        // Fall through to process.cwd fallback
        }
    }
    // Last resort: use process.cwd to find migrations relative to the app root
    const fromCwd = checkLocations(process.cwd());
    if (fromCwd) return fromCwd;
    throw new Error("[Migration] Could not resolve migrations directory. Set OMNIROUTE_MIGRATIONS_DIR.");
}
const MIGRATIONS_DIR = resolveMigrationsDir();
/**
 * Default maximum number of migrations allowed to run in a single startup on an
 * existing database. If more migrations are pending than this threshold,
 * it likely means the migration tracking table was accidentally wiped,
 * and running all migrations from scratch could cause data loss.
 *
 * Set the threshold to 0 (via `OMNIROUTE_MAX_PENDING_MIGRATIONS`) to disable
 * this safety check.
 */ const DEFAULT_MAX_PENDING_MIGRATIONS_ON_EXISTING_DB = 50;
/**
 * Resolve the mass-migration safety threshold, allowing an operator to override
 * the default via the `OMNIROUTE_MAX_PENDING_MIGRATIONS` env var (#3416). This
 * is read at CALL TIME inside runMigrations() so a backup restore can raise the
 * limit (or `0` to disable the check) without a code change. Mirrors the
 * `OMNIROUTE_MIGRATIONS_DIR` convention used in resolveMigrationsDir(). Falls
 * back to the default on missing or invalid (non-numeric / negative) input.
 */ function resolveMaxPendingMigrations() {
    const raw = process.env.OMNIROUTE_MAX_PENDING_MIGRATIONS;
    if (typeof raw === "string" && raw.trim().length > 0) {
        const parsed = Number.parseInt(raw.trim(), 10);
        if (Number.isFinite(parsed) && parsed >= 0) {
            return parsed;
        }
    }
    return DEFAULT_MAX_PENDING_MIGRATIONS_ON_EXISTING_DB;
}
class MigrationSafetyAbortError extends Error {
    constructor(message){
        super(message);
        this.name = "MigrationSafetyAbortError";
    }
}
/**
 * Memoized mass-migration abort (#6260). After a backup restore wipes the
 * migration tracking table, EVERY downstream `ensureDbInitialized()` re-opens
 * the DB and re-calls `runMigrations()`, which used to recompute the abort and
 * re-`console.error` the full banner 11+ times. Caching the thrown instance
 * (keyed by the exact message it would compute) lets repeated calls in the same
 * process throw the SAME instance and log a single concise line instead.
 */ let memoizedSafetyAbort = null;
const fts5SupportCache = new WeakMap();
/**
 * Ensure the schema_migrations tracking table exists.
 */ function ensureMigrationsTable(db) {
    db.exec(`
    CREATE TABLE IF NOT EXISTS _omniroute_migrations (
      version TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
function isOptionalFts5Migration(migration) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$migrationRunner$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["OPTIONAL_FTS5_MIGRATION_VERSIONS"].has(migration.version);
}
function supportsFts5(db) {
    const cached = fts5SupportCache.get(db);
    if (cached !== undefined) {
        return cached;
    }
    try {
        const probeTable = `__omniroute_fts5_probe_${crypto.randomUUID().replace(/-/g, "_")}`;
        db.transaction(()=>{
            db.exec(`CREATE VIRTUAL TABLE "${probeTable}" USING fts5(content);`);
            db.exec(`DROP TABLE "${probeTable}";`);
        })();
        fts5SupportCache.set(db, true);
        return true;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (/no such module:\s*fts5/i.test(message)) {
            fts5SupportCache.set(db, false);
            return false;
        }
        throw error;
    }
}
function isDeferredUnsupportedMigration(db, migration) {
    return isOptionalFts5Migration(migration) && !supportsFts5(db);
}
/**
 * Get all migration files sorted by version number.
 */ function getMigrationFiles() {
    // The extra directories are an independent set: a missing core directory must not
    // make them vanish silently.
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(MIGRATIONS_DIR)) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$migrationRunner$2f$extraDirs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getExtraMigrationFiles"])();
    const files = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readdirSync(MIGRATIONS_DIR).filter((f)=>f.endsWith(".sql")).sort().map((filename)=>{
        const match = filename.match(/^(\d+)_(.+)\.sql$/);
        if (!match) return null;
        return {
            version: match[1],
            name: match[2],
            path: __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(MIGRATIONS_DIR, filename)
        };
    }).filter(Boolean);
    // Detect version collisions early: two files sharing the same numeric prefix
    // would otherwise be silently skipped by the runner (only the first applied
    // would record version=NNN in _omniroute_migrations; the rest would never run).
    // SUPERSEDED_DUPLICATE_MIGRATIONS lists legitimate "renamed" pairs and is OK.
    const byVersion = new Map();
    for (const f of files){
        if (!byVersion.has(f.version)) byVersion.set(f.version, []);
        byVersion.get(f.version).push(f.name);
    }
    const realCollisions = [];
    for (const [version, names] of byVersion.entries()){
        if (names.length <= 1) continue;
        const liveNames = names.filter((name)=>!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$migrationRunner$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SUPERSEDED_DUPLICATE_MIGRATIONS"].some((sup)=>sup.version === version && sup.name === name));
        if (liveNames.length > 1) {
            realCollisions.push({
                version,
                names: liveNames
            });
        }
    }
    if (realCollisions.length > 0) {
        const summary = realCollisions.map((c)=>`version=${c.version} → [${c.names.join(", ")}]`).join("; ");
        throw new Error(`Migration version collision detected: ${summary}. ` + `Each migration file must have a unique numeric prefix. Rename one of the ` + `colliding files (and add a retroactive guard in isSchemaAlreadyApplied for ` + `DBs that already applied the old number). See _tasks/features-v3.8.4/9route/POST-MERGE-AUDIT.md.`);
    }
    // Extra directories registered via OMNIROUTE_EXTRA_MIGRATIONS_DIRS, appended
    // AFTER the numeric set so a distribution's own schema always lands on top of
    // the upstream one. Their versions are namespaced (`ee-134`), so they cannot
    // collide with a numeric slot, and every downstream consumer here — the applied
    // set, the gap reconciliation, the name-mismatch check — keys on the version
    // string and needs no further change. Empty and filesystem-free when unset.
    return [
        ...files,
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$migrationRunner$2f$extraDirs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getExtraMigrationFiles"])()
    ];
}
function filterSupersededDuplicateMigrations(files) {
    return files.filter((file)=>{
        const superseded = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$migrationRunner$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SUPERSEDED_DUPLICATE_MIGRATIONS"].find((migration)=>migration.version === file.version && migration.name === file.name);
        if (!superseded) {
            return true;
        }
        const hasReplacement = files.some((candidate)=>candidate.version === superseded.supersededByVersion && candidate.name === superseded.supersededByName);
        if (!hasReplacement) {
            return true;
        }
        console.warn(`[Migration] Ignoring superseded duplicate migration ${file.version}_${file.name}; ` + `${superseded.supersededByVersion}_${superseded.supersededByName} is the canonical slot.`);
        return false;
    });
}
/**
 * Get list of already-applied migration versions.
 */ function getAppliedVersions(db) {
    const rows = db.prepare("SELECT version FROM _omniroute_migrations").all();
    return new Set(rows.map((r)=>r.version));
}
/**
 * Get applied migration records (version + name) for mismatch detection.
 */ function getAppliedRecords(db) {
    return db.prepare("SELECT version, name FROM _omniroute_migrations ORDER BY version").all();
}
function hasTable(db, tableName) {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type IN ('table', 'view') AND name = ?").get(tableName);
    return Boolean(row?.name);
}
function hasColumn(db, tableName, columnName) {
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    return columns.some((column)=>column.name === columnName);
}
function ensureColumn(db, tableName, columnName, ddl) {
    if (!hasColumn(db, tableName, columnName)) {
        db.exec(ddl);
    }
}
function isSchemaAlreadyApplied(db, migration) {
    switch(migration.version){
        case "003":
            return hasColumn(db, "provider_nodes", "chat_path");
        case "095":
            return hasColumn(db, "provider_nodes", "custom_headers_json");
        case "005":
            return hasColumn(db, "combos", "system_message");
        case "007":
            return hasColumn(db, "call_logs", "request_type");
        case "009":
            return hasColumn(db, "call_logs", "requested_model");
        case "018":
            return hasColumn(db, "call_logs", "tokens_cache_read") && hasColumn(db, "call_logs", "tokens_cache_creation") && hasColumn(db, "call_logs", "tokens_reasoning");
        case "020":
            return hasColumn(db, "combos", "sort_order");
        case "021":
            return hasColumn(db, "call_logs", "combo_step_id") && hasColumn(db, "call_logs", "combo_execution_key");
        case "023":
            return hasColumn(db, "memories", "memory_id");
        case "025":
            return hasColumn(db, "call_logs", "detail_state") && hasColumn(db, "call_logs", "request_summary");
        case "026":
            return hasColumn(db, "call_logs", "cache_source");
        case "027":
            return hasColumn(db, "skills", "mode");
        case "028":
            return hasTable(db, "batches") && hasTable(db, "files");
        case "029":
            return hasColumn(db, "provider_connections", "max_concurrent");
        case "040":
            return hasColumn(db, "proxy_registry", "source");
        case "041":
            if (migration.name === "session_account_affinity") {
                return hasTable(db, "session_account_affinity");
            }
            return hasColumn(db, "compression_analytics", "actual_prompt_tokens") && hasColumn(db, "compression_analytics", "actual_completion_tokens") && hasColumn(db, "compression_analytics", "actual_total_tokens") && hasColumn(db, "compression_analytics", "receipt_source") && hasColumn(db, "compression_analytics", "validation_fallback") && hasColumn(db, "compression_analytics", "output_mode");
        case "042":
            return hasTable(db, "compression_combos") && hasTable(db, "compression_combo_assignments") && hasColumn(db, "compression_analytics", "compression_combo_id") && hasColumn(db, "compression_analytics", "engine");
        case "045":
            return hasColumn(db, "call_logs", "tokens_compressed");
        case "053":
            return !hasColumn(db, "files", "status");
        case "054":
            return hasColumn(db, "usage_history", "service_tier");
        case "062":
            return hasColumn(db, "usage_history", "combo_strategy");
        case "070":
            // Retroactive guard for webhooks-kind-metadata migration renumbered from 068
            // (collided with 068_free_proxies + 068_services). DBs that already applied
            // 068_webhooks_kind_metadata should not re-run as 070.
            return hasColumn(db, "webhooks", "kind") && hasColumn(db, "webhooks", "metadata_encrypted");
        case "071":
            // Retroactive guard for embedded-services migration renumbered from 068
            // (originally collided with 068_free_proxies and 068_webhooks_kind_metadata).
            // DBs that already applied 068_services should not re-run as 071.
            return hasColumn(db, "version_manager", "logs_buffer_path") && hasColumn(db, "version_manager", "provider_expose") && hasColumn(db, "version_manager", "last_sync_at");
        case "073":
            // Plan 21 D27 fix: guard memory_vec migration. Without this case, an
            // unmarked re-run of 073_memory_vec.sql would have its ALTER TABLE fail
            // mid-file and skip the CREATE INDEX that follows, leaving the index
            // missing on DBs that re-execute the script after a partial first run.
            return hasColumn(db, "memories", "needs_reindex");
        case "085":
            // Retroactive guard for quota_pools migration renumbered from 077 → 085
            // (077 collided with 077_api_key_stream_default_mode). DBs that already
            // applied quota_pools under the old 077 number should not re-run as 085.
            return hasTable(db, "quota_pools") && hasTable(db, "quota_allocations");
        case "088":
            // Quota groups migration (renumbered 087 → 088 on merge into v3.8.8).
            // The table + column are already present when group_id exists on
            // quota_pools (ensures the backfill UPDATE also ran).
            return hasTable(db, "quota_groups") && hasColumn(db, "quota_pools", "group_id");
        case "089":
            // disable_non_public_models column (PR #3017, renumbered 077 → 089 to avoid
            // collision with 077_api_key_stream_default_mode on merge into v3.8.8).
            return hasColumn(db, "api_keys", "disable_non_public_models");
        case "090":
            // plugin_metrics table (PR #2913, renumbered 077 → 090 to avoid
            // collision with 077_api_key_stream_default_mode on merge into v3.8.8).
            return hasTable(db, "plugin_metrics");
        case "091":
            // plugin_analytics table (PR #2913). The PR's stray db/migrations version
            // was dropped on integration; this canonical migration creates the table
            // that recordPluginExecution()/getPluginAnalytics() rely on.
            return hasTable(db, "plugin_analytics");
        case "117":
            // Proxy-pool rotation (#6365): the assignments table was rebuilt to add a
            // `position` column and drop UNIQUE(scope, scope_id). If `position` already
            // exists the rebuild ran — skip re-executing the rename/copy/drop, which
            // would fail on the missing proxy_assignments_pre117 table.
            return hasColumn(db, "proxy_assignments", "position");
        // Retroactive guard for the 135/136 renumber (#8523 landed onto slots already taken
        // by #8908/#9515): a DB that ran these under the old numbers already has the column,
        // and a bare ALTER TABLE ADD COLUMN would throw on the re-run under the new number.
        case "137":
            return hasColumn(db, "version_manager", "auto_restart_adopted");
        case "138":
            return hasColumn(db, "upstream_proxy_config", "fallback_backend");
        default:
            return false;
    }
}
function applyApiKeyLifecycleMigration(db) {
    ensureColumn(db, "api_keys", "revoked_at", "ALTER TABLE api_keys ADD COLUMN revoked_at TEXT");
    ensureColumn(db, "api_keys", "expires_at", "ALTER TABLE api_keys ADD COLUMN expires_at TEXT");
    ensureColumn(db, "api_keys", "last_used_at", "ALTER TABLE api_keys ADD COLUMN last_used_at TEXT");
    ensureColumn(db, "api_keys", "key_prefix", "ALTER TABLE api_keys ADD COLUMN key_prefix TEXT");
    ensureColumn(db, "api_keys", "ip_allowlist", "ALTER TABLE api_keys ADD COLUMN ip_allowlist TEXT");
    ensureColumn(db, "api_keys", "scopes", "ALTER TABLE api_keys ADD COLUMN scopes TEXT");
    db.exec(`
    CREATE INDEX IF NOT EXISTS idx_api_keys_revoked_at ON api_keys(revoked_at);
    CREATE INDEX IF NOT EXISTS idx_api_keys_expires_at ON api_keys(expires_at);
  `);
}
function isSearchRequestTypeMigration(migration) {
    return migration.version === "007";
}
function applySearchRequestTypeMigration(db) {
    ensureColumn(db, "call_logs", "request_type", "ALTER TABLE call_logs ADD COLUMN request_type TEXT DEFAULT NULL");
    db.exec("CREATE INDEX IF NOT EXISTS idx_call_logs_request_type ON call_logs(request_type);");
}
function applyCompressionReceiptsMigration(db) {
    ensureColumn(db, "compression_analytics", "actual_prompt_tokens", "ALTER TABLE compression_analytics ADD COLUMN actual_prompt_tokens INTEGER");
    ensureColumn(db, "compression_analytics", "actual_completion_tokens", "ALTER TABLE compression_analytics ADD COLUMN actual_completion_tokens INTEGER");
    ensureColumn(db, "compression_analytics", "actual_total_tokens", "ALTER TABLE compression_analytics ADD COLUMN actual_total_tokens INTEGER");
    ensureColumn(db, "compression_analytics", "actual_cache_read_tokens", "ALTER TABLE compression_analytics ADD COLUMN actual_cache_read_tokens INTEGER");
    ensureColumn(db, "compression_analytics", "actual_cache_write_tokens", "ALTER TABLE compression_analytics ADD COLUMN actual_cache_write_tokens INTEGER");
    ensureColumn(db, "compression_analytics", "estimated_usd_saved", "ALTER TABLE compression_analytics ADD COLUMN estimated_usd_saved REAL");
    ensureColumn(db, "compression_analytics", "mcp_description_tokens_saved", "ALTER TABLE compression_analytics ADD COLUMN mcp_description_tokens_saved INTEGER DEFAULT 0");
    ensureColumn(db, "compression_analytics", "multimodal_skip_count", "ALTER TABLE compression_analytics ADD COLUMN multimodal_skip_count INTEGER DEFAULT 0");
    ensureColumn(db, "compression_analytics", "receipt_source", "ALTER TABLE compression_analytics ADD COLUMN receipt_source TEXT");
    ensureColumn(db, "compression_analytics", "validation_fallback", "ALTER TABLE compression_analytics ADD COLUMN validation_fallback INTEGER DEFAULT 0");
    ensureColumn(db, "compression_analytics", "output_mode", "ALTER TABLE compression_analytics ADD COLUMN output_mode TEXT");
    db.exec(`
    CREATE INDEX IF NOT EXISTS idx_compression_analytics_request_id
      ON compression_analytics(request_id);
    CREATE INDEX IF NOT EXISTS idx_compression_analytics_receipt_source
      ON compression_analytics(receipt_source);
  `);
}
function applyCompressionCombosMigration(db, migrationPath) {
    const sql = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(migrationPath, "utf-8");
    db.exec(sql);
    ensureColumn(db, "compression_analytics", "compression_combo_id", "ALTER TABLE compression_analytics ADD COLUMN compression_combo_id TEXT");
    ensureColumn(db, "compression_analytics", "engine", "ALTER TABLE compression_analytics ADD COLUMN engine TEXT");
    db.exec(`
    CREATE INDEX IF NOT EXISTS idx_compression_analytics_combo_engine
      ON compression_analytics(compression_combo_id, engine);
  `);
}
function inferPhysicalSchemaBaseline(db) {
    for (const sentinel of __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$migrationRunner$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PHYSICAL_SCHEMA_SENTINELS"]){
        if (hasTable(db, sentinel.tableName)) {
            return {
                version: sentinel.version,
                description: sentinel.description
            };
        }
    }
    const hasInitialSchema = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$migrationRunner$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["INITIAL_SCHEMA_SENTINELS"].every((tableName)=>hasTable(db, tableName));
    if (hasInitialSchema) {
        return {
            version: "001",
            description: "initial schema tables"
        };
    }
    return null;
}
function getPlausiblePendingCount(files, baselineVersion) {
    const baseline = Number.parseInt(baselineVersion, 10);
    return files.filter((file)=>Number.parseInt(file.version, 10) > baseline).length;
}
/**
 * Detect migration name mismatches — when a migration version number
 * has been reused/renumbered with a different name. This is a strong signal
 * that the migration tracking is corrupted or migrations were renumbered.
 */ function detectNameMismatches(appliedRecords, files) {
    const appliedByName = new Map(appliedRecords.map((r)=>[
            r.version,
            r.name
        ]));
    const mismatches = [];
    for (const file of files){
        const appliedName = appliedByName.get(file.version);
        if (appliedName && appliedName !== file.name) {
            mismatches.push({
                version: file.version,
                appliedName,
                diskName: file.name
            });
        }
    }
    return mismatches;
}
function reconcileRenumberedMigrations(db, files) {
    let repaired = false;
    for (const compatibility of __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$migrationRunner$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["RENAMED_MIGRATION_COMPATIBILITY"]){
        const hasTargetFile = files.some((file)=>file.version === compatibility.toVersion && file.name === compatibility.toName);
        const hasSourceFile = files.some((file)=>file.version === compatibility.fromVersion && file.name !== compatibility.fromName);
        if (!hasTargetFile || !hasSourceFile) {
            continue;
        }
        const legacyRow = db.prepare("SELECT version, name FROM _omniroute_migrations WHERE version = ? AND name = ?").get(compatibility.fromVersion, compatibility.fromName);
        if (!legacyRow) {
            continue;
        }
        const targetRow = db.prepare("SELECT version FROM _omniroute_migrations WHERE version = ?").get(compatibility.toVersion);
        const applyRepair = db.transaction(()=>{
            if (targetRow) {
                db.prepare("DELETE FROM _omniroute_migrations WHERE version = ? AND name = ?").run(compatibility.fromVersion, compatibility.fromName);
            } else {
                db.prepare("UPDATE _omniroute_migrations SET version = ?, name = ? WHERE version = ? AND name = ?").run(compatibility.toVersion, compatibility.toName, compatibility.fromVersion, compatibility.fromName);
            }
        });
        applyRepair();
        repaired = true;
        console.warn(`[Migration] Reconciled renamed migration ${compatibility.fromVersion}_${compatibility.fromName} ` + `to ${compatibility.toVersion}_${compatibility.toName} to preserve pending migrations.`);
        // After the compat rewrite, verify the old version slot is now free.
        // A residual row (from a failed prior run, manual intervention, or edge-case
        // UPDATE conflict) at the old version would shadow a NEW migration file
        // placed at that version number — e.g. 028_create_files_and_batches.sql
        // would be skipped because getAppliedVersions() still sees version "028".
        const residualRow = db.prepare("SELECT version, name FROM _omniroute_migrations WHERE version = ?").get(compatibility.fromVersion);
        if (residualRow) {
            console.warn(`[Migration] ⚠️  Residual row at version ${compatibility.fromVersion} ` + `(name: "${residualRow.name}") still present after compat rewrite — ` + `removing to unblock new migration at this version slot.`);
            db.prepare("DELETE FROM _omniroute_migrations WHERE version = ?").run(compatibility.fromVersion);
        }
    }
    return repaired;
}
function rehomeLegacyVersionSlotMigrations(db, files) {
    let repaired = false;
    const diskNamesByVersion = new Map(files.map((file)=>[
            file.version,
            file.name
        ]));
    for (const legacy of __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$migrationRunner$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["LEGACY_VERSION_SLOT_MIGRATIONS"]){
        const diskName = diskNamesByVersion.get(legacy.version);
        if (!diskName || diskName === legacy.name) {
            continue;
        }
        const legacyRow = db.prepare("SELECT version, name FROM _omniroute_migrations WHERE version = ? AND name = ?").get(legacy.version, legacy.name);
        if (!legacyRow) {
            continue;
        }
        const legacyVersion = `legacy-${legacy.version}-${legacy.name}`;
        const applyRepair = db.transaction(()=>{
            const existingLegacyRow = db.prepare("SELECT version FROM _omniroute_migrations WHERE version = ?").get(legacyVersion);
            if (existingLegacyRow) {
                db.prepare("DELETE FROM _omniroute_migrations WHERE version = ? AND name = ?").run(legacy.version, legacy.name);
                return;
            }
            db.prepare("UPDATE _omniroute_migrations SET version = ? WHERE version = ? AND name = ?").run(legacyVersion, legacy.version, legacy.name);
        });
        applyRepair();
        repaired = true;
        console.warn(`[Migration] Rehomed legacy migration ${legacy.version}_${legacy.name} ` + `to ${legacyVersion} so current ${legacy.version}_${diskName} can apply.`);
    }
    return repaired;
}
/**
 * Create a pre-migration backup of the SQLite database using VACUUM INTO.
 * Returns the backup path on success, null on failure.
 */ function createPreMigrationBackup(db) {
    try {
        const sqliteFile = db.name;
        if (!sqliteFile || sqliteFile === ":memory:") return null;
        const backupDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].dirname(sqliteFile), "db_backups");
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(backupDir)) {
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(backupDir, {
                recursive: true
            });
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(backupDir, `db_${timestamp}_pre-migration.sqlite`);
        const escapedBackupPath = backupPath.replace(/'/g, "''");
        db.exec(`VACUUM INTO '${escapedBackupPath}'`);
        console.log(`[Migration] Pre-migration backup created: ${backupPath}`);
        return backupPath;
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`[Migration] Failed to create pre-migration backup: ${message}`);
        return null;
    }
}
function runMigrations(db, options) {
    const isNewDb = options?.isNewDb === true;
    ensureMigrationsTable(db);
    const files = filterSupersededDuplicateMigrations(getMigrationFiles());
    rehomeLegacyVersionSlotMigrations(db, files);
    reconcileRenumberedMigrations(db, files);
    const applied = getAppliedVersions(db);
    const appliedRecords = getAppliedRecords(db);
    // ── Safety Check 1: Detect migration name mismatches (renumbering) ──
    const mismatches = detectNameMismatches(appliedRecords, files);
    if (mismatches.length > 0) {
        console.error(`[Migration] ⚠️  CRITICAL: ${mismatches.length} migration version(s) have been renumbered!`);
        for (const m of mismatches){
            console.error(`  Version ${m.version}: applied as "${m.appliedName}" but disk has "${m.diskName}"`);
        }
        console.error(`[Migration] This indicates migrations were renumbered between releases, ` + `which can cause the migration runner to skip or re-run migrations incorrectly.`);
        console.error(`[Migration] The version-only tracking will skip these (version already applied), ` + `but please report this to the OmniRoute maintainers.`);
    }
    // ── Gap Reconciliation: Identify non-contiguous missing migrations ──
    // Do not rely on any highest-version-applied heuristic. We must explicitly
    // iterate through all missing files on disk and apply them if they are missing
    // from the _omniroute_migrations table.
    const numericApplied = Array.from(applied).map((v)=>Number.parseInt(v, 10)).filter((n)=>!Number.isNaN(n));
    const highestApplied = numericApplied.length > 0 ? Math.max(...numericApplied) : 0;
    const pending = files.filter((f)=>{
        const isMissing = !applied.has(f.version);
        if (isMissing && Number(f.version) < highestApplied) {
            console.warn(`[Migration] 🔄 RECONCILIATION: Found missing intermediate migration ` + `${f.version}_${f.name} (highest applied is ${highestApplied}). ` + `This gap will be back-filled to ensure schema integrity.`);
        }
        return isMissing;
    });
    const deferredUnsupported = pending.filter((migration)=>isDeferredUnsupportedMigration(db, migration));
    const actionablePending = pending.filter((migration)=>!deferredUnsupported.some((deferred)=>deferred.version === migration.version));
    if (pending.length === 0) {
        return 0; // Nothing to do
    }
    if (deferredUnsupported.length > 0) {
        const summary = deferredUnsupported.map((migration)=>`${migration.version}_${migration.name}`).join(", ");
        console.warn(`[Migration] Deferring optional FTS5 migrations on driver ${db.driver}: ${summary}. ` + `Memory search will fall back until a SQLite driver with FTS5 support is available.`);
    }
    // ── Safety Check 2: Mass-migration detection (abort if existing DB + many migrations) ──
    // Skip in test environments where fresh DBs legitimately have many pending migrations.
    const isTestEnvironment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isAutomatedTestProcess"])();
    // #3416: resolve the threshold at call time so OMNIROUTE_MAX_PENDING_MIGRATIONS
    // can override the default (0 disables the check). The abort message below
    // interpolates this resolved value, so it auto-reflects any override.
    const maxPendingMigrations = resolveMaxPendingMigrations();
    if (!isTestEnvironment && !isNewDb && process.env.DISABLE_SQLITE_AUTO_BACKUP !== "true" && maxPendingMigrations > 0 && applied.size > 0 && actionablePending.length > maxPendingMigrations) {
        const physicalBaseline = inferPhysicalSchemaBaseline(db);
        const plausiblePendingCount = physicalBaseline ? getPlausiblePendingCount(files, physicalBaseline.version) : null;
        if (plausiblePendingCount !== null && actionablePending.length <= plausiblePendingCount) {
            console.warn(`[Migration] Allowing ${actionablePending.length} pending migrations on an existing database ` + `because the physical schema only proves ${physicalBaseline?.version} ` + `(${physicalBaseline?.description}).`);
        } else {
            const schemaHint = physicalBaseline && plausiblePendingCount !== null ? ` Physical schema already shows ${physicalBaseline.version} ` + `(${physicalBaseline.description}), so at most ${plausiblePendingCount} pending ` + `migration(s) are expected from a legitimate upgrade.` : "";
            const bypassHint = ` To bypass this check (e.g. after restoring a backup where the migration ` + `tracking table was wiped), set OMNIROUTE_MAX_PENDING_MIGRATIONS=0 in your ` + `server.env or DATA_DIR/.env and restart.`;
            const msg = `[Migration] 🛑 ABORT: Detected ${actionablePending.length} pending migrations on an existing database ` + `(threshold is ${maxPendingMigrations}). ` + `This usually means the migration tracking table was accidentally wiped. ` + `Running all migrations from scratch will cause data loss or schema errors.` + schemaHint + bypassHint;
            // #6260: memoize so the cascade of downstream ensureDbInitialized() calls
            // that re-open the DB throw the SAME instance and only log once.
            if (memoizedSafetyAbort && memoizedSafetyAbort.message === msg) {
                console.error(`[Migration] 🛑 ABORT (repeat — see earlier detail): ` + `${actionablePending.length} pending > threshold ${maxPendingMigrations}. ` + `Set OMNIROUTE_MAX_PENDING_MIGRATIONS=0 to bypass.`);
                throw memoizedSafetyAbort;
            }
            console.error(msg);
            memoizedSafetyAbort = new MigrationSafetyAbortError(msg);
            throw memoizedSafetyAbort;
        }
    }
    // ── Safety Check 3: Pre-migration backup ──
    // Skip backup if it's a completely fresh database (0 applied and all pending)
    // or if running in tests (where AUTO_BACKUP might be disabled)
    if (applied.size > 0 && process.env.DISABLE_SQLITE_AUTO_BACKUP !== "true") {
        createPreMigrationBackup(db);
    }
    let count = 0;
    for (const migration of pending){
        if (isDeferredUnsupportedMigration(db, migration)) {
            continue;
        }
        const applyMigration = db.transaction(()=>{
            if (isSchemaAlreadyApplied(db, migration)) {
                console.warn(`[Migration] Skipped executing ${migration.version}_${migration.name} as schema changes are already present (Idempotency check).`);
            } else if (migration.version === "032") {
                applyApiKeyLifecycleMigration(db);
            } else if (migration.version === "041" && migration.name === "compression_receipts") {
                applyCompressionReceiptsMigration(db);
            } else if (migration.version === "042") {
                applyCompressionCombosMigration(db, migration.path);
            } else {
                const sql = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(migration.path, "utf-8");
                db.exec(sql);
            }
            db.prepare("INSERT INTO _omniroute_migrations (version, name) VALUES (?, ?)").run(migration.version, migration.name);
        });
        try {
            applyMigration();
            count++;
            console.log(`[Migration] Applied: ${migration.version}_${migration.name}`);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            // "duplicate column name" means the column already exists — end state achieved, mark applied.
            if (message.includes("duplicate column name")) {
                const applyMarkerOnly = db.transaction(()=>{
                    db.prepare("INSERT OR IGNORE INTO _omniroute_migrations (version, name) VALUES (?, ?)").run(migration.version, migration.name);
                });
                applyMarkerOnly();
                count++;
                console.log(`[Migration] Applied (column pre-exists): ${migration.version}_${migration.name}`);
            } else {
                console.error(`[Migration] FAILED: ${migration.version}_${migration.name} — ${message}`);
                throw err; // Re-throw to prevent DB from starting in inconsistent state
            }
        }
    }
    if (count > 0) {
        console.log(`[Migration] ${count} migration(s) applied successfully.`);
    }
    // After applying all migrations, insert default settings if we just ran migration 46
    try {
        if (appliedRecords.some((m)=>m.name.startsWith("051_"))) {
            insertDefaultDatabaseSettings(db);
        }
    } catch (error) {
        console.error("Error inserting default database settings:", error);
    }
    return count;
}
function insertDefaultDatabaseSettings(db) {
    const tx = db.transaction(()=>{
        // Insert all default settings
        for (const [section, values] of Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"])){
            for (const [key, value] of Object.entries(values)){
                db.prepare("INSERT OR IGNORE INTO key_value (namespace, key, value) VALUES (?, ?, ?)").run("databaseSettings", `${section}.${key}`, JSON.stringify(value));
            }
        }
    });
    // Run in an immediate transaction to avoid nested transactions
    try {
        db.immediate(()=>{
            tx();
        });
    } catch (error) {
        console.error("Transaction error inserting default settings:", error);
        throw error;
    }
}
function getMigrationStatus(db) {
    ensureMigrationsTable(db);
    const appliedRows = db.prepare("SELECT version, name, applied_at FROM _omniroute_migrations ORDER BY version").all();
    const appliedVersions = new Set(appliedRows.map((r)=>r.version));
    const allFiles = getMigrationFiles();
    const pending = allFiles.filter((f)=>!appliedVersions.has(f.version));
    return {
        applied: appliedRows,
        pending
    };
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
"[project]/src/lib/db/healthCheck.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "runDbHealthCheck",
    ()=>runDbHealthCheck
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/combos/steps.ts [instrumentation] (ecmascript)");
;
function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
function toRecord(value) {
    return isRecord(value) ? value : {};
}
function toTrimmedString(value) {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function parseJsonRecord(value) {
    try {
        const parsed = JSON.parse(value);
        return isRecord(parsed) ? parsed : null;
    } catch  {
        return null;
    }
}
function isFiniteNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
}
function hasRows(db, table) {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?").get(table);
    return row?.name === table;
}
function hasProviderConnection(db, connectionId) {
    const row = db.prepare("SELECT 1 AS ok FROM provider_connections WHERE id = ? LIMIT 1").get(connectionId);
    return row?.ok === 1;
}
function isValidIsoTimestamp(value) {
    if (typeof value !== "string" || value.trim().length === 0) return false;
    return !Number.isNaN(Date.parse(value));
}
function buildRepairNote(message, checkedAt) {
    return `[db-health:${checkedAt}] ${message}`;
}
function buildDisabledCombo(row, checkedAt) {
    const now = checkedAt;
    return {
        id: row.id,
        name: row.name,
        version: 2,
        strategy: "priority",
        models: [],
        config: {},
        isActive: false,
        isHidden: false,
        sortOrder: typeof row.sort_order === "number" ? row.sort_order : 0,
        createdAt: row.created_at || now,
        updatedAt: now,
        repairNote: buildRepairNote("Combo payload was rebuilt after invalid JSON was detected.", now)
    };
}
function normalizeComboModels(models) {
    return Array.isArray(models) ? models : [];
}
function repairComboRows(db, rows, checkedAt, options) {
    if (rows.length === 0) return {
        issueCount: 0,
        repairedCount: 0
    };
    const existingComboNames = new Set(rows.map((row)=>row.name));
    let issueCount = 0;
    let repairedCount = 0;
    const updateComboStmt = db.prepare("UPDATE combos SET data = ?, updated_at = ? WHERE id = ?");
    for (const row of rows){
        const parsed = parseJsonRecord(row.data);
        if (!parsed) {
            issueCount += 1;
            if (options.autoRepair) {
                const repaired = buildDisabledCombo(row, checkedAt);
                updateComboStmt.run(JSON.stringify(repaired), checkedAt, row.id);
                repairedCount += 1;
            }
            continue;
        }
        const currentModels = normalizeComboModels(parsed.models);
        if (currentModels.length === 0) continue;
        const nextModels = [];
        let removedSteps = 0;
        let clearedConnectionPins = 0;
        let normalizedLegacyComboRefs = 0;
        for (const [index, rawStep] of currentModels.entries()){
            if (!isRecord(rawStep)) {
                if (typeof rawStep === "string") {
                    const normalizedStep = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeComboStep"])(rawStep, {
                        comboName: row.name,
                        index,
                        allCombos: existingComboNames
                    });
                    if (normalizedStep?.kind === "combo-ref") {
                        if (normalizedStep.comboName === row.name || !existingComboNames.has(normalizedStep.comboName)) {
                            removedSteps += 1;
                            continue;
                        }
                        nextModels.push(normalizedStep);
                        normalizedLegacyComboRefs += 1;
                        continue;
                    }
                }
                nextModels.push(rawStep);
                continue;
            }
            if (rawStep.kind === "combo-ref") {
                const comboName = toTrimmedString(rawStep.comboName);
                if (!comboName || comboName === row.name || !existingComboNames.has(comboName)) {
                    removedSteps += 1;
                    continue;
                }
                nextModels.push(rawStep);
                continue;
            }
            const connectionId = toTrimmedString(rawStep.connectionId);
            if (connectionId && !hasProviderConnection(db, connectionId)) {
                const repairedStep = {
                    ...rawStep
                };
                delete repairedStep.connectionId;
                nextModels.push(repairedStep);
                clearedConnectionPins += 1;
                continue;
            }
            nextModels.push(rawStep);
        }
        if (removedSteps === 0 && clearedConnectionPins === 0 && normalizedLegacyComboRefs === 0) {
            continue;
        }
        issueCount += removedSteps + clearedConnectionPins + normalizedLegacyComboRefs;
        if (!options.autoRepair) continue;
        const nextCombo = {
            ...parsed,
            models: nextModels,
            updatedAt: checkedAt,
            repairNote: buildRepairNote([
                removedSteps > 0 ? `${removedSteps} broken combo step(s) removed.` : null,
                clearedConnectionPins > 0 ? `${clearedConnectionPins} missing connection pin(s) cleared.` : null,
                normalizedLegacyComboRefs > 0 ? `${normalizedLegacyComboRefs} legacy combo ref step(s) canonicalized.` : null
            ].filter(Boolean).join(" "), checkedAt),
            ...nextModels.length === 0 ? {
                isActive: false
            } : {}
        };
        updateComboStmt.run(JSON.stringify(nextCombo), checkedAt, row.id);
        repairedCount += removedSteps + clearedConnectionPins + normalizedLegacyComboRefs;
    }
    return {
        issueCount,
        repairedCount
    };
}
function getBrokenQuotaSnapshotRowIds(db) {
    if (!hasRows(db, "quota_snapshots")) return [];
    const brokenRowIds = new Set();
    const rows = db.prepare("SELECT id, provider, connection_id, created_at FROM quota_snapshots").all();
    for (const row of rows){
        const connectionId = toTrimmedString(row.connection_id);
        const missingConnection = !!connectionId && !hasProviderConnection(db, connectionId);
        const invalidTimestamp = !isValidIsoTimestamp(row.created_at);
        if ((missingConnection || invalidTimestamp) && typeof row.id === "number") {
            brokenRowIds.add(row.id);
        }
    }
    return Array.from(brokenRowIds);
}
function countOrphanQuotaSnapshots(db) {
    return getBrokenQuotaSnapshotRowIds(db).length;
}
function repairQuotaSnapshots(db) {
    if (!hasRows(db, "quota_snapshots")) return 0;
    const brokenRowIds = getBrokenQuotaSnapshotRowIds(db);
    if (brokenRowIds.length === 0) return 0;
    const deleteByRowId = db.prepare("DELETE FROM quota_snapshots WHERE id = ?");
    let repaired = 0;
    for (const rowId of brokenRowIds){
        repaired += deleteByRowId.run(rowId).changes;
    }
    return repaired;
}
function countOrphanDomainRows(db, table) {
    if (!hasRows(db, table)) return 0;
    const row = db.prepare(`SELECT COUNT(*) AS count
       FROM ${table}
       WHERE api_key_id NOT IN (SELECT id FROM api_keys)`).get();
    return row?.count || 0;
}
function repairOrphanDomainRows(db, table) {
    if (!hasRows(db, table)) return 0;
    return db.prepare(`DELETE FROM ${table} WHERE api_key_id NOT IN (SELECT id FROM api_keys)`).run().changes;
}
function countInvalidJsonRows(db, table, column) {
    if (!hasRows(db, table)) return 0;
    const rows = db.prepare(`SELECT ${column} FROM ${table}`).all();
    let invalid = 0;
    for (const row of rows){
        const raw = row[column];
        if (raw == null && column === "options") continue;
        if (typeof raw !== "string") {
            invalid += 1;
            continue;
        }
        try {
            JSON.parse(raw);
        } catch  {
            invalid += 1;
        }
    }
    return invalid;
}
function repairInvalidJsonRows(db, table, column) {
    if (!hasRows(db, table)) return 0;
    const rows = db.prepare(`SELECT rowid, ${column} FROM ${table}`).all();
    const deleteByRowId = db.prepare(`DELETE FROM ${table} WHERE rowid = ?`);
    const clearOptionsByRowId = db.prepare("UPDATE domain_circuit_breakers SET options = NULL WHERE rowid = ?");
    let repaired = 0;
    for (const row of rows){
        const raw = row[column];
        if (raw == null && table === "domain_circuit_breakers") {
            continue;
        }
        if (typeof raw !== "string") {
            if (table === "domain_circuit_breakers") {
                repaired += clearOptionsByRowId.run(row.rowid).changes;
                continue;
            }
            deleteByRowId.run(row.rowid);
            repaired += 1;
            continue;
        }
        try {
            JSON.parse(raw);
        } catch  {
            if (table === "domain_circuit_breakers") {
                repaired += clearOptionsByRowId.run(row.rowid).changes;
                continue;
            }
            deleteByRowId.run(row.rowid);
            repaired += 1;
        }
    }
    return repaired;
}
function getSchemaVersionIssueCount(db, expectedSchemaVersion) {
    if (!hasRows(db, "db_meta")) return 0;
    const row = db.prepare("SELECT value FROM db_meta WHERE key = 'schema_version'").get();
    const current = typeof row?.value === "string" ? row.value : null;
    return current === expectedSchemaVersion ? 0 : 1;
}
function repairSchemaVersion(db, expectedSchemaVersion) {
    if (!hasRows(db, "db_meta")) return 0;
    return db.prepare("INSERT OR REPLACE INTO db_meta (key, value) VALUES ('schema_version', ?)").run(expectedSchemaVersion).changes;
}
function runDbHealthCheck(db, options = {}) {
    const autoRepair = options.autoRepair === true;
    const expectedSchemaVersion = options.expectedSchemaVersion || "1";
    const checkedAt = new Date().toISOString();
    const issues = [];
    let repairedCount = 0;
    let backupCreated = false;
    let backupAttempted = false;
    const ensureBackupBeforeRepair = ()=>{
        if (!autoRepair || backupAttempted || typeof options.createBackupBeforeRepair !== "function") {
            return;
        }
        backupAttempted = true;
        backupCreated = options.createBackupBeforeRepair();
    };
    // Use quick_check instead of integrity_check on startup — integrity_check
    // does a full page-by-page scan that can take minutes on a fragmented WAL,
    // causing 7+ minute boot times. quick_check still catches corruption but
    // skips deep index verification, reducing I/O to seconds.
    // Skip entirely when skipIntegrityCheck is set (env OMNIROUTE_SKIP_DB_HEALTHCHECK=1).
    if (!options.skipIntegrityCheck) {
        const integrityCheck = db.pragma("quick_check");
        if (integrityCheck[0]?.quick_check !== "ok") {
            issues.push({
                type: "integrity_check_failed",
                table: "sqlite",
                description: "SQLite integrity_check returned a non-ok status.",
                count: 1
            });
        }
    }
    if (hasRows(db, "combos")) {
        const comboRows = db.prepare("SELECT id, name, data, sort_order, created_at, updated_at FROM combos ORDER BY name COLLATE NOCASE ASC").all();
        const comboRepair = repairComboRows(db, comboRows, checkedAt, {
            autoRepair
        });
        if (comboRepair.issueCount > 0) {
            issues.push({
                type: "broken_reference",
                table: "combos",
                description: "Combos contained broken combo references, legacy combo refs, invalid JSON, or pinned connections that no longer exist.",
                count: comboRepair.issueCount
            });
            if (autoRepair) {
                ensureBackupBeforeRepair();
                repairedCount += comboRepair.repairedCount;
            }
        }
    }
    const orphanQuotaCount = countOrphanQuotaSnapshots(db);
    if (orphanQuotaCount > 0) {
        issues.push({
            type: "stale_snapshot",
            table: "quota_snapshots",
            description: "Quota snapshots referenced missing connections or contained invalid timestamps.",
            count: orphanQuotaCount
        });
        if (autoRepair) {
            ensureBackupBeforeRepair();
            repairedCount += repairQuotaSnapshots(db);
        }
    }
    const orphanBudgets = countOrphanDomainRows(db, "domain_budgets");
    if (orphanBudgets > 0) {
        issues.push({
            type: "broken_reference",
            table: "domain_budgets",
            description: "Domain budgets referenced API keys that no longer exist.",
            count: orphanBudgets
        });
        if (autoRepair) {
            ensureBackupBeforeRepair();
            repairedCount += repairOrphanDomainRows(db, "domain_budgets");
        }
    }
    const orphanCostHistory = countOrphanDomainRows(db, "domain_cost_history");
    if (orphanCostHistory > 0) {
        issues.push({
            type: "broken_reference",
            table: "domain_cost_history",
            description: "Domain cost history referenced API keys that no longer exist.",
            count: orphanCostHistory
        });
        if (autoRepair) {
            ensureBackupBeforeRepair();
            repairedCount += repairOrphanDomainRows(db, "domain_cost_history");
        }
    }
    const invalidFallbackChains = countInvalidJsonRows(db, "domain_fallback_chains", "chain");
    if (invalidFallbackChains > 0) {
        issues.push({
            type: "invalid_state",
            table: "domain_fallback_chains",
            description: "Fallback chain rows contained invalid JSON payloads.",
            count: invalidFallbackChains
        });
        if (autoRepair) {
            ensureBackupBeforeRepair();
            repairedCount += repairInvalidJsonRows(db, "domain_fallback_chains", "chain");
        }
    }
    const invalidLockoutState = countInvalidJsonRows(db, "domain_lockout_state", "attempts");
    if (invalidLockoutState > 0) {
        issues.push({
            type: "invalid_state",
            table: "domain_lockout_state",
            description: "Lockout state rows contained invalid JSON payloads.",
            count: invalidLockoutState
        });
        if (autoRepair) {
            ensureBackupBeforeRepair();
            repairedCount += repairInvalidJsonRows(db, "domain_lockout_state", "attempts");
        }
    }
    const invalidBreakerOptions = countInvalidJsonRows(db, "domain_circuit_breakers", "options");
    if (invalidBreakerOptions > 0) {
        issues.push({
            type: "invalid_state",
            table: "domain_circuit_breakers",
            description: "Circuit breaker option payloads were invalid JSON.",
            count: invalidBreakerOptions
        });
        if (autoRepair) {
            ensureBackupBeforeRepair();
            repairedCount += repairInvalidJsonRows(db, "domain_circuit_breakers", "options");
        }
    }
    const schemaVersionIssues = getSchemaVersionIssueCount(db, expectedSchemaVersion);
    if (schemaVersionIssues > 0) {
        issues.push({
            type: "invalid_state",
            table: "db_meta",
            description: `db_meta.schema_version did not match expected version ${expectedSchemaVersion}.`,
            count: schemaVersionIssues
        });
        if (autoRepair) {
            ensureBackupBeforeRepair();
            repairedCount += repairSchemaVersion(db, expectedSchemaVersion);
        }
    }
    return {
        isHealthy: issues.length === 0,
        issues,
        repairedCount,
        backupCreated,
        autoRepair,
        checkedAt
    };
}
}),
"[project]/src/lib/db/stateReset.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Central registry for DB module state resetters.
 * Used by restore flows to clear prepared statement caches without cross-module imports.
 */ __turbopack_context__.s([
    "registerDbStateResetter",
    ()=>registerDbStateResetter,
    "resetAllDbModuleState",
    ()=>resetAllDbModuleState
]);
const resetters = new Set();
function registerDbStateResetter(resetter) {
    resetters.add(resetter);
}
function resetAllDbModuleState() {
    for (const resetter of resetters){
        try {
            resetter();
        } catch (error) {
            console.warn("[DB] Failed to reset module state:", error);
        }
    }
}
}),
"[project]/src/lib/db/featureFlags.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearAllFeatureFlagOverrides",
    ()=>clearAllFeatureFlagOverrides,
    "getFeatureFlagOverride",
    ()=>getFeatureFlagOverride,
    "getFeatureFlagOverrides",
    ()=>getFeatureFlagOverrides,
    "removeFeatureFlagOverride",
    ()=>removeFeatureFlagOverride,
    "setFeatureFlagOverride",
    ()=>setFeatureFlagOverride
]);
/**
 * db/featureFlags.ts — Feature flag DB overrides.
 *
 * Stores per-flag override values in the key_value table under the
 * "feature_flags" namespace. When an override is present it takes precedence
 * over the process environment variable of the same name.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$featureFlagDefinitions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/featureFlagDefinitions.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
;
;
const NAMESPACE = "feature_flags";
function getFeatureFlagOverrides() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = ?").all(NAMESPACE);
    const result = {};
    for (const row of rows){
        result[row.key] = row.value;
    }
    return result;
}
function getFeatureFlagOverride(key) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = ? AND key = ?").get(NAMESPACE, key);
    return row?.value;
}
function setFeatureFlagOverride(key, value) {
    const definition = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$featureFlagDefinitions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FEATURE_FLAG_DEFINITIONS"].find((d)=>d.key === key);
    if (!definition) {
        throw new Error(`Unknown feature flag key: ${key}`);
    }
    if (definition.type === "enum" && definition.enumValues && !definition.enumValues.includes(value)) {
        throw new Error(`Invalid value "${value}" for enum flag ${key}. Allowed: ${definition.enumValues.join(", ")}`);
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES (?, ?, ?)").run(NAMESPACE, key, value);
}
function removeFeatureFlagOverride(key) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("DELETE FROM key_value WHERE namespace = ? AND key = ?").run(NAMESPACE, key);
}
function clearAllFeatureFlagOverrides() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("DELETE FROM key_value WHERE namespace = ?").run(NAMESPACE);
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
"[project]/src/lib/db/optimizationSettings.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyDatabaseOptimizationSettingsForDb",
    ()=>applyDatabaseOptimizationSettingsForDb,
    "applyStoredDatabaseOptimizationSettings",
    ()=>applyStoredDatabaseOptimizationSettings,
    "getAutoVacuumModeForDb",
    ()=>getAutoVacuumModeForDb,
    "setAutoVacuumForDb",
    ()=>setAutoVacuumForDb,
    "setCacheSizeForDb",
    ()=>setCacheSizeForDb,
    "setPageSizeForDb",
    ()=>setPageSizeForDb
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/databaseSettings.ts [instrumentation] (ecmascript)");
;
const AUTO_VACUUM_MODE_TO_PRAGMA = {
    NONE: 0,
    FULL: 1,
    INCREMENTAL: 2
};
const PRAGMA_TO_AUTO_VACUUM_MODE = {
    0: "NONE",
    1: "FULL",
    2: "INCREMENTAL"
};
function parseKeyValueJson(raw) {
    if (raw === null || raw === undefined) return undefined;
    try {
        return JSON.parse(raw);
    } catch  {
        return raw;
    }
}
function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
function normalizeAutoVacuumMode(value, fallback) {
    return typeof value === "string" && value in AUTO_VACUUM_MODE_TO_PRAGMA ? value : fallback;
}
function normalizePageSizeBytes(value, fallback) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return fallback;
    const pageSize = Math.floor(numeric);
    if (pageSize < 512 || pageSize > 65536 || pageSize % 512 !== 0) return fallback;
    return pageSize;
}
function normalizeVacuumHour(value, fallback) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return fallback;
    return Math.min(23, Math.max(0, Math.floor(numeric)));
}
function normalizeStoredCacheSizeKb(value, fallback) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return fallback;
    const cacheSizeKb = Math.floor(numeric);
    if (cacheSizeKb < 1 || cacheSizeKb > 1000000) return fallback;
    return cacheSizeKb;
}
function requireCacheSizeKb(value) {
    if (!Number.isInteger(value) || value < 1 || value > 1000000) {
        throw new Error("cache_size must be a positive KiB value between 1 and 1000000");
    }
    return value;
}
function mergeOptimizationSettings(target, value) {
    if (!isRecord(value)) return target;
    return {
        ...target,
        autoVacuumMode: normalizeAutoVacuumMode(value.autoVacuumMode, target.autoVacuumMode),
        scheduledVacuum: typeof value.scheduledVacuum === "string" && [
            "never",
            "daily",
            "weekly",
            "monthly"
        ].includes(value.scheduledVacuum) ? value.scheduledVacuum : target.scheduledVacuum,
        vacuumHour: normalizeVacuumHour(value.vacuumHour, target.vacuumHour),
        pageSize: normalizePageSizeBytes(value.pageSize, target.pageSize),
        cacheSize: normalizeStoredCacheSizeKb(value.cacheSize, target.cacheSize),
        optimizeOnStartup: typeof value.optimizeOnStartup === "boolean" ? value.optimizeOnStartup : target.optimizeOnStartup
    };
}
function readDatabaseOptimizationSettings(db) {
    let settings = {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"].optimization
    };
    try {
        const rows = db.prepare("SELECT namespace, key, value FROM key_value WHERE namespace IN (?, ?)").all("settings", "databaseSettings");
        const byNamespace = {
            settings: {},
            databaseSettings: {}
        };
        for (const row of rows){
            byNamespace[row.namespace] ??= {};
            byNamespace[row.namespace][row.key] = parseKeyValueJson(row.value);
        }
        const mainSettings = byNamespace.settings ?? {};
        const databaseSettingsValue = mainSettings.databaseSettings;
        if (isRecord(databaseSettingsValue)) {
            settings = mergeOptimizationSettings(settings, databaseSettingsValue.optimization);
        }
        settings = mergeOptimizationSettings(settings, mainSettings.optimization);
        const databaseSettings = byNamespace.databaseSettings ?? {};
        const optimizeOnStartup = databaseSettings["optimization.optimizeOnStartup"] ?? databaseSettings.optimizeOnStartup;
        settings = mergeOptimizationSettings(settings, databaseSettings.optimization);
        settings = {
            ...settings,
            autoVacuumMode: normalizeAutoVacuumMode(databaseSettings["optimization.autoVacuumMode"] ?? databaseSettings.autoVacuumMode, settings.autoVacuumMode),
            pageSize: normalizePageSizeBytes(databaseSettings["optimization.pageSize"] ?? databaseSettings.pageSize, settings.pageSize),
            cacheSize: normalizeStoredCacheSizeKb(databaseSettings["optimization.cacheSize"] ?? databaseSettings.cacheSize, settings.cacheSize),
            optimizeOnStartup: typeof optimizeOnStartup === "boolean" ? optimizeOnStartup : settings.optimizeOnStartup
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[DB] Failed to read database optimization settings; using defaults: ${message}`);
    }
    return settings;
}
function setCacheSizeForDb(db, cacheSizeKb) {
    const normalizedCacheSizeKb = requireCacheSizeKb(cacheSizeKb);
    const currentCacheSize = db.pragma("cache_size", {
        simple: true
    });
    const targetCacheSize = -normalizedCacheSizeKb;
    if (currentCacheSize === targetCacheSize) {
        console.log(`[DB] cache_size already set to ${normalizedCacheSizeKb}KB`);
        return;
    }
    console.log(`[DB] Changing cache_size from ${Math.abs(currentCacheSize)}KB to ${normalizedCacheSizeKb}KB`);
    db.pragma(`cache_size = ${targetCacheSize}`);
    const newCacheSize = db.pragma("cache_size", {
        simple: true
    });
    if (newCacheSize !== targetCacheSize) {
        throw new Error(`cache_size change did not take effect (expected ${targetCacheSize}, got ${newCacheSize})`);
    }
    console.log(`[DB] cache_size changed to ${Math.abs(newCacheSize)}KB`);
}
function applyPersistentOptimizationPragmas(db, settings) {
    const targetAutoVacuum = AUTO_VACUUM_MODE_TO_PRAGMA[settings.autoVacuumMode];
    const targetPageSize = normalizePageSizeBytes(settings.pageSize, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"].optimization.pageSize);
    const currentAutoVacuum = db.pragma("auto_vacuum", {
        simple: true
    });
    const currentPageSize = db.pragma("page_size", {
        simple: true
    });
    if (currentAutoVacuum === targetAutoVacuum && currentPageSize === targetPageSize) return;
    const originalJournalMode = String(db.pragma("journal_mode", {
        simple: true
    }) ?? "").toUpperCase();
    const shouldRestoreWal = originalJournalMode === "WAL";
    console.log(`[DB] Applying persistent optimization settings ` + `(auto_vacuum ${currentAutoVacuum}->${targetAutoVacuum}, ` + `page_size ${currentPageSize}->${targetPageSize})`);
    try {
        if (shouldRestoreWal) db.pragma("journal_mode = DELETE");
        db.pragma(`auto_vacuum = ${targetAutoVacuum}`);
        db.pragma(`page_size = ${targetPageSize}`);
        db.exec("VACUUM");
    } finally{
        if (shouldRestoreWal) {
            try {
                db.pragma("journal_mode = WAL");
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                console.warn(`[DB] Failed to restore WAL mode after optimization settings: ${message}`);
            }
        }
    }
    const newAutoVacuum = db.pragma("auto_vacuum", {
        simple: true
    });
    const newPageSize = db.pragma("page_size", {
        simple: true
    });
    if (newAutoVacuum !== targetAutoVacuum || newPageSize !== targetPageSize) {
        throw new Error(`database optimization settings did not take effect ` + `(auto_vacuum expected ${targetAutoVacuum}, got ${newAutoVacuum}; ` + `page_size expected ${targetPageSize}, got ${newPageSize})`);
    }
}
function applyDatabaseOptimizationSettingsForDb(db, settings, options) {
    if (options.applyPersistent) applyPersistentOptimizationPragmas(db, settings);
    setCacheSizeForDb(db, normalizeStoredCacheSizeKb(settings.cacheSize, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"].optimization.cacheSize));
}
function applyStoredDatabaseOptimizationSettings(db) {
    const settings = readDatabaseOptimizationSettings(db);
    // Startup can happen concurrently in test workers and clustered hosts. Only
    // restore connection-local settings here; page_size/auto_vacuum require VACUUM
    // and are applied synchronously when the Storage settings are saved.
    applyDatabaseOptimizationSettingsForDb(db, settings, {
        applyPersistent: false
    });
}
function setAutoVacuumForDb(db, mode) {
    const currentMode = db.pragma("auto_vacuum", {
        simple: true
    });
    const targetMode = AUTO_VACUUM_MODE_TO_PRAGMA[mode];
    if (currentMode === targetMode) {
        console.log(`[DB] auto_vacuum already set to ${mode}`);
        return;
    }
    applyPersistentOptimizationPragmas(db, {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"].optimization,
        autoVacuumMode: mode,
        pageSize: db.pragma("page_size", {
            simple: true
        })
    });
}
function getAutoVacuumModeForDb(db) {
    const mode = db.pragma("auto_vacuum", {
        simple: true
    });
    return PRAGMA_TO_AUTO_VACUUM_MODE[mode] || "NONE";
}
function setPageSizeForDb(db, pageSize) {
    const currentPageSize = db.pragma("page_size", {
        simple: true
    });
    const targetPageSize = normalizePageSizeBytes(pageSize, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"].optimization.pageSize);
    if (currentPageSize === targetPageSize) {
        console.log(`[DB] page_size already set to ${targetPageSize}`);
        return;
    }
    applyPersistentOptimizationPragmas(db, {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"].optimization,
        autoVacuumMode: getAutoVacuumModeForDb(db),
        pageSize: targetPageSize
    });
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
"[project]/src/lib/usage/callLogArtifacts.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CALL_LOGS_DIR",
    ()=>CALL_LOGS_DIR,
    "MAX_CALL_LOG_ARTIFACT_BYTES",
    ()=>MAX_CALL_LOG_ARTIFACT_BYTES,
    "buildArtifactRelativePath",
    ()=>buildArtifactRelativePath,
    "cleanupEmptyCallLogDirs",
    ()=>cleanupEmptyCallLogDirs,
    "deleteCallArtifact",
    ()=>deleteCallArtifact,
    "listCallLogArtifactFiles",
    ()=>listCallLogArtifactFiles,
    "purgeCallLogArtifactDirectory",
    ()=>purgeCallLogArtifactDirectory,
    "readCallArtifact",
    ()=>readCallArtifact,
    "writeCallArtifact",
    ()=>writeCallArtifact
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dataPaths.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logEnv.ts [instrumentation] (ecmascript)");
;
;
;
;
const isCloud = typeof globalThis.caches === "object" && globalThis.caches !== null;
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
const DATA_DIR = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveDataDir"])({
    isCloud
});
const CALL_LOGS_DIR = isCloud ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(DATA_DIR, "call_logs");
const MAX_CALL_LOG_ARTIFACT_BYTES = 512 * 1024;
const SIZE_LIMIT_EXCEEDED_REASON = "call_log_artifact_size_limit_exceeded";
const OMITTED_FOR_SIZE_LIMIT = "[omitted: call log artifact size limit exceeded]";
const STREAM_CHUNKS_OMITTED_FOR_SIZE_LIMIT = "[stream chunks omitted: call log artifact size limit exceeded]";
function buildArtifactRelativePath(timestamp, id) {
    const parsed = new Date(timestamp);
    const safeTimestamp = (Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString()).replace(/[:]/g, "-");
    const dateFolder = safeTimestamp.slice(0, 10);
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].posix.join(dateFolder, `${safeTimestamp}_${id}.json`);
}
function computeArtifactChecksum(serialized) {
    const bytes = Buffer.from(serialized);
    let hash = 0x811c9dc5;
    for (const byte of bytes){
        hash ^= byte;
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(16).padStart(8, "0");
}
function truncateArtifactForStorage(artifact) {
    const pipeline = artifact.pipeline;
    if (!pipeline?.streamChunks) return artifact;
    return {
        ...artifact,
        pipeline: {
            ...pipeline,
            streamChunks: {
                provider: pipeline.streamChunks.provider?.length ? [
                    STREAM_CHUNKS_OMITTED_FOR_SIZE_LIMIT
                ] : undefined,
                openai: pipeline.streamChunks.openai?.length ? [
                    STREAM_CHUNKS_OMITTED_FOR_SIZE_LIMIT
                ] : undefined,
                client: pipeline.streamChunks.client?.length ? [
                    STREAM_CHUNKS_OMITTED_FOR_SIZE_LIMIT
                ] : undefined
            }
        }
    };
}
function omitOversizedPipeline(artifact) {
    if (!artifact.pipeline) return artifact;
    return {
        ...artifact,
        pipeline: {
            error: {
                _omniroute_truncated: true,
                reason: SIZE_LIMIT_EXCEEDED_REASON
            }
        }
    };
}
function getArtifactMaxBytes(artifact) {
    return artifact.pipeline ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCallLogPipelineMaxSizeBytes"])() : MAX_CALL_LOG_ARTIFACT_BYTES;
}
function buildMinimalArtifactForSizeLimit(artifact) {
    return {
        schemaVersion: artifact.schemaVersion,
        summary: artifact.summary,
        requestBody: OMITTED_FOR_SIZE_LIMIT,
        responseBody: OMITTED_FOR_SIZE_LIMIT,
        error: artifact.error ? OMITTED_FOR_SIZE_LIMIT : null,
        pipeline: {
            error: {
                _omniroute_truncated: true,
                reason: SIZE_LIMIT_EXCEEDED_REASON
            }
        }
    };
}
function serializeFinalSizeLimitFallback(artifact, maxBytes) {
    const withSummary = JSON.stringify(buildMinimalArtifactForSizeLimit(artifact));
    if (Buffer.byteLength(withSummary) <= maxBytes) {
        return withSummary;
    }
    return JSON.stringify({
        schemaVersion: artifact.schemaVersion,
        _omniroute_truncated: true,
        reason: SIZE_LIMIT_EXCEEDED_REASON
    });
}
function serializeArtifactForStorage(artifact) {
    // Debug mode: write full untruncated payload
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isChatDebugFileEnabled"])()) {
        return JSON.stringify(artifact, null, 2);
    }
    const maxBytes = getArtifactMaxBytes(artifact);
    // Single-pass, non-pretty serialization on the hot path. Artifacts are machine-read via
    // JSON.parse (readCallArtifact), so pretty-printing only doubled the bytes and CPU of
    // serializing large request/response bodies on every request — a contributor to the
    // CPU-runaway. The debug path above keeps pretty output for human inspection.
    const serialized = JSON.stringify(artifact);
    if (Buffer.byteLength(serialized) <= maxBytes) {
        return serialized;
    }
    const truncated = JSON.stringify(truncateArtifactForStorage(artifact));
    if (Buffer.byteLength(truncated) <= maxBytes) {
        return truncated;
    }
    const withoutPipeline = JSON.stringify(omitOversizedPipeline(artifact));
    if (Buffer.byteLength(withoutPipeline) <= maxBytes) {
        return withoutPipeline;
    }
    const minimal = JSON.stringify({
        ...omitOversizedPipeline(artifact),
        requestBody: OMITTED_FOR_SIZE_LIMIT,
        responseBody: OMITTED_FOR_SIZE_LIMIT,
        error: artifact.error ? OMITTED_FOR_SIZE_LIMIT : null
    });
    if (Buffer.byteLength(minimal) <= maxBytes) {
        return minimal;
    }
    return serializeFinalSizeLimitFallback(artifact, maxBytes);
}
function writeCallArtifact(artifact, relativePath = buildArtifactRelativePath(artifact.summary.timestamp, artifact.summary.id)) {
    if (!CALL_LOGS_DIR || isBuildPhase) return null;
    const absPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(CALL_LOGS_DIR, relativePath);
    const tmpPath = `${absPath}.${process.pid}.${Date.now()}.tmp`;
    try {
        const serialized = serializeArtifactForStorage(artifact);
        const sizeBytes = Buffer.byteLength(serialized);
        // Keep the legacy field name for storage compatibility, but use a non-cryptographic checksum
        // so artifact bookkeeping is not treated as password hashing by static analysis.
        const fileChecksum = computeArtifactChecksum(serialized);
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].mkdirSync(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].dirname(absPath), {
            recursive: true
        });
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].writeFileSync(tmpPath, serialized);
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].renameSync(tmpPath, absPath);
        return {
            relPath: relativePath,
            sizeBytes,
            sha256: fileChecksum
        };
    } catch (error) {
        try {
            __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].rmSync(tmpPath, {
                force: true
            });
        } catch  {
        // Best effort cleanup only.
        }
        console.error("[callLogs] Failed to write request artifact:", error.message);
        return null;
    }
}
function readCallArtifact(relativePath) {
    if (!CALL_LOGS_DIR || !relativePath) {
        return {
            artifact: null,
            state: "missing"
        };
    }
    try {
        const absPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(CALL_LOGS_DIR, relativePath);
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(absPath)) {
            return {
                artifact: null,
                state: "missing"
            };
        }
        return {
            artifact: JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync(absPath, "utf8")),
            state: "ready"
        };
    } catch (error) {
        console.error("[callLogs] Failed to read request artifact:", error.message);
        return {
            artifact: null,
            state: "corrupt"
        };
    }
}
function deleteCallArtifact(relativePath) {
    if (!CALL_LOGS_DIR || !relativePath) return false;
    try {
        const absPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(CALL_LOGS_DIR, relativePath);
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(absPath)) return false;
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].rmSync(absPath, {
            force: true
        });
        return true;
    } catch  {
        return false;
    }
}
function cleanupEmptyCallLogDirs(baseDir = CALL_LOGS_DIR) {
    if (!baseDir || !__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(baseDir)) return;
    try {
        for (const entry of __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(baseDir)){
            const entryPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(baseDir, entry);
            const stat = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].statSync(entryPath);
            if (!stat.isDirectory()) continue;
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(entryPath).length === 0) {
                __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].rmSync(entryPath, {
                    recursive: true,
                    force: true
                });
            }
        }
    } catch  {
    // Best effort only.
    }
}
function listCallLogArtifactFiles(baseDir = CALL_LOGS_DIR) {
    if (!baseDir || !__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(baseDir)) return [];
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(baseDir).flatMap((entry)=>{
        const entryPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(baseDir, entry);
        try {
            const stat = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].statSync(entryPath);
            if (!stat.isDirectory()) return [];
            return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(entryPath).filter((file)=>file.endsWith(".json")).map((file)=>{
                const absPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(entryPath, file);
                const fileStat = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].statSync(absPath);
                return {
                    relativePath: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].posix.join(entry, file),
                    absPath,
                    mtimeMs: fileStat.mtimeMs
                };
            });
        } catch  {
            return [];
        }
    }).sort((a, b)=>b.mtimeMs - a.mtimeMs);
}
function purgeCallLogArtifactDirectory(baseDir = CALL_LOGS_DIR) {
    const result = {
        deletedArtifacts: 0,
        errors: 0
    };
    if (!baseDir || !__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(baseDir)) return result;
    try {
        result.deletedArtifacts = listCallLogArtifactFiles(baseDir).length;
    } catch  {
        result.deletedArtifacts = 0;
    }
    try {
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].rmSync(baseDir, {
            recursive: true,
            force: true
        });
    } catch (error) {
        console.error("[callLogArtifacts] Failed to purge call log artifacts:", error);
        result.deletedArtifacts = 0;
        result.errors++;
    }
    return result;
}
}),
"[project]/src/lib/db/encryption.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decrypt",
    ()=>decrypt,
    "decryptConnectionFields",
    ()=>decryptConnectionFields,
    "encrypt",
    ()=>encrypt,
    "encryptConnectionFields",
    ()=>encryptConnectionFields,
    "isEncryptionEnabled",
    ()=>isEncryptionEnabled,
    "looksEncrypted",
    ()=>looksEncrypted,
    "migrateLegacyEncryptedString",
    ()=>migrateLegacyEncryptedString
]);
/**
 * Field-Level Encryption — AES-256-GCM
 *
 * Encrypts/decrypts sensitive fields (API keys, tokens) stored in SQLite.
 * Format: `enc:v1:<iv_hex>:<ciphertext_hex>:<authTag_hex>`
 *
 * If STORAGE_ENCRYPTION_KEY is not set, operates in passthrough mode
 * (stores plaintext for development convenience).
 *
 * KEY DERIVATION CHANGE (v3.7.9):
 * The PRIMARY key is now derived with a static salt ("omniroute-field-encryption-v1").
 * The LEGACY key used a dynamic salt (sha256 hash of the key). Auto-migration
 * re-encrypts any legacy-encrypted tokens on decrypt.
 *
 * Why the change?
 * The dynamic salt `createHash("sha256").update(secret).digest().slice(0, 16)` produced
 * a different derived key than the static salt `"omniroute-field-encryption-v1"`. When the
 * health-check/token-refresh path used one derivation and the main API used another,
 * tokens encrypted by one path became undecryptable by the other, causing:
 * - Persistent decrypt failures
 * - Re-encryption loops (health-check undoing fixes)
 * - CPU spikes (50%) from error cascades
 *
 * This fix makes the static salt the primary derivation and auto-migrates
 * legacy-encrypted tokens back to static-salt encryption.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const KEY_LENGTH = 32;
/**
 * GCM authentication tag length, in bytes. Pinned to the full 16-byte tag
 * produced by `cipher.getAuthTag()`. Passing `authTagLength` to
 * `createDecipheriv` rejects truncated authentication tags up front, closing
 * the GCM tag-truncation forgery vector (Semgrep gcm-no-tag-length).
 */ const AUTH_TAG_LENGTH = 16;
const PREFIX = "enc:v1:";
const STATIC_SALT = "omniroute-field-encryption-v1";
let _staticKey = null;
let _legacyDynamicKey = null;
/**
 * Derive the PRIMARY encryption key using the static salt.
 * This is the canonical key derivation that all new encryptions use.
 * Returns null if no encryption key is configured.
 */ function getStaticKey() {
    if (_staticKey !== null) return _staticKey;
    const secret = process.env.STORAGE_ENCRYPTION_KEY;
    if (!secret || typeof secret !== "string" || secret.trim().length === 0) return null;
    try {
        _staticKey = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["scryptSync"])(secret, STATIC_SALT, KEY_LENGTH);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[Encryption] Failed to derive key from STORAGE_ENCRYPTION_KEY: ${message}. ` + `Generate a valid key with: openssl rand -base64 32`);
        return null;
    }
    return _staticKey;
}
/**
 * Derive the LEGACY key using the old dynamic salt method.
 * Used exclusively for fallback decryption of tokens encrypted by older versions.
 *
 * The old dynamic salt was: createHash("sha256").update(secret).digest().slice(0, 16)
 * This produced a different derived key than the static salt, causing incompatibility.
 */ function getLegacyDynamicKey() {
    if (_legacyDynamicKey !== null) return _legacyDynamicKey;
    const secret = process.env.STORAGE_ENCRYPTION_KEY;
    if (!secret || typeof secret !== "string" || secret.trim().length === 0) return null;
    const dynamicSalt = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHash"])("sha256").update(secret).digest().slice(0, 16);
    try {
        _legacyDynamicKey = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["scryptSync"])(secret, dynamicSalt, KEY_LENGTH);
    } catch  {
        return null;
    }
    return _legacyDynamicKey;
}
function isEncryptionEnabled() {
    return !!process.env.STORAGE_ENCRYPTION_KEY;
}
function looksEncrypted(value) {
    return typeof value === "string" && value.startsWith(PREFIX);
}
function encrypt(plaintext) {
    if (!plaintext || typeof plaintext !== "string") return plaintext;
    const key = getStaticKey();
    if (!key) {
        console.warn("[Encryption] STORAGE_ENCRYPTION_KEY not set. Storing plaintext (passthrough mode).");
        return plaintext; // passthrough mode
    }
    // Already encrypted — don't double-encrypt
    if (plaintext.startsWith(PREFIX)) return plaintext;
    try {
        const iv = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomBytes"])(IV_LENGTH);
        const cipher = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createCipheriv"])(ALGORITHM, key, iv);
        let encrypted = cipher.update(plaintext, "utf8", "hex");
        encrypted += cipher.final("hex");
        const authTag = cipher.getAuthTag().toString("hex");
        return `${PREFIX}${iv.toString("hex")}:${encrypted}:${authTag}`;
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[Encryption] Encryption failed: ${message}. ` + `Check your STORAGE_ENCRYPTION_KEY — generate one with: openssl rand -base64 32`);
        return plaintext; // fallback to plaintext rather than crashing
    }
}
function decrypt(ciphertext) {
    if (!ciphertext || typeof ciphertext !== "string") return ciphertext;
    // Not encrypted — return as-is (legacy plaintext or passthrough mode)
    if (!ciphertext.startsWith(PREFIX)) return ciphertext;
    const staticKey = getStaticKey();
    if (!staticKey) {
        console.warn("[Encryption] Found encrypted data but STORAGE_ENCRYPTION_KEY is not set. Cannot decrypt.");
        return null;
    }
    const body = ciphertext.slice(PREFIX.length);
    const parts = body.split(":");
    if (parts.length !== 3) {
        console.error("[Encryption] Malformed encrypted value");
        return null;
    }
    const [ivHex, encryptedHex, authTagHex] = parts;
    const tryDecryptWithKey = (candidateKey)=>{
        try {
            const iv = Buffer.from(ivHex, "hex");
            const authTag = Buffer.from(authTagHex, "hex");
            const decipher = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createDecipheriv"])(ALGORITHM, candidateKey, iv, {
                authTagLength: AUTH_TAG_LENGTH
            });
            decipher.setAuthTag(authTag);
            let decrypted = decipher.update(encryptedHex, "hex", "utf8");
            decrypted += decipher.final("utf8");
            return decrypted;
        } catch  {
            return null;
        }
    };
    try {
        // PRIMARY: Try static-salt key first (canonical derivation)
        const decrypted = tryDecryptWithKey(staticKey);
        if (decrypted !== null) {
            return decrypted;
        }
        console.error(`[Encryption] Decryption failed. Ciphertext prefix: ${ciphertext.slice(0, 30)}... ` + `Auth tag validation likely failed.`);
        return null;
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[Encryption] Decryption failed:", message);
        return null;
    }
}
function encryptConnectionFields(conn) {
    if (!isEncryptionEnabled()) return conn;
    if (!conn) return conn;
    if (conn.apiKey) conn.apiKey = encrypt(conn.apiKey);
    if (conn.accessToken) conn.accessToken = encrypt(conn.accessToken);
    if (conn.refreshToken) conn.refreshToken = encrypt(conn.refreshToken);
    if (conn.idToken) conn.idToken = encrypt(conn.idToken);
    return conn;
}
function decryptConnectionFields(row) {
    if (!row) return row;
    if (!isEncryptionEnabled()) return row;
    const apiKey = decrypt(row.apiKey);
    const accessToken = decrypt(row.accessToken);
    const refreshToken = decrypt(row.refreshToken);
    const idToken = decrypt(row.idToken);
    // #6148 — a stored credential that is still encrypted (`enc:v1:…`) but
    // decrypts to null means the STORAGE_ENCRYPTION_KEY changed or was unset.
    // Flag it so callers surface a clear error instead of coercing the null to
    // "" and firing an empty-Bearer request that upstream rejects as 401.
    const credentialDecryptFailed = looksEncrypted(row.apiKey) && apiKey === null || looksEncrypted(row.accessToken) && accessToken === null || looksEncrypted(row.refreshToken) && refreshToken === null || looksEncrypted(row.idToken) && idToken === null;
    return {
        ...row,
        apiKey,
        accessToken,
        refreshToken,
        idToken,
        ...credentialDecryptFailed ? {
            credentialDecryptFailed: true
        } : {}
    };
}
function migrateLegacyEncryptedString(ciphertext) {
    if (!isEncryptionEnabled()) return {
        updated: false,
        value: ciphertext
    };
    if (!ciphertext || ciphertext.trim().length === 0) return {
        updated: false,
        value: ciphertext
    };
    if (!ciphertext.startsWith(PREFIX)) return {
        updated: false,
        value: ciphertext
    };
    const staticKey = getStaticKey();
    const legacyKey = getLegacyDynamicKey();
    if (!staticKey) return {
        updated: false,
        value: null
    };
    const rawPayload = ciphertext.slice(PREFIX.length);
    const parts = rawPayload.split(":");
    if (parts.length !== 3) return {
        updated: false,
        value: ciphertext
    };
    const [ivHex, encryptedHex, authTagHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    const tryDecryptWithKey = (key)=>{
        try {
            const decipher = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createDecipheriv"])(ALGORITHM, key, iv, {
                authTagLength: AUTH_TAG_LENGTH
            });
            decipher.setAuthTag(authTag);
            let decrypted = decipher.update(encrypted, undefined, "utf8");
            decrypted += decipher.final("utf8");
            return decrypted;
        } catch  {
            return null;
        }
    };
    // 1. If it already decrypts with the static key, no migration needed.
    if (tryDecryptWithKey(staticKey) !== null) {
        return {
            updated: false,
            value: ciphertext
        };
    }
    // 2. If it decrypts with the legacy key, it needs migration!
    if (legacyKey) {
        const legacyDecrypted = tryDecryptWithKey(legacyKey);
        if (legacyDecrypted !== null) {
            // Re-encrypt using the canonical static key and return updated
            return {
                updated: true,
                value: encrypt(legacyDecrypted)
            };
        }
    }
    // 3. Un-decryptable or corrupted, leave it alone
    return {
        updated: false,
        value: ciphertext
    };
}
}),
"[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * DB Read Cache — In-memory TTL cache for hot read paths.
 *
 * SQLite reads are already fast since better-sqlite3 is synchronous and
 * memory-mapped. However, some functions (getSettings, getPricing,
 * getProviderConnections) are called on every request by multiple callers.
 * A short TTL cache (5s) eliminates redundant I/O without staling data for
 * long enough to matter (settings changes are applied within one cache cycle).
 *
 * Usage:
 *   import { dbCache } from '@/lib/db/readCache';
 *   const settings = await dbCache.getSettings();
 */ __turbopack_context__.s([
    "getCachedLKGP",
    ()=>getCachedLKGP,
    "getCachedPricing",
    ()=>getCachedPricing,
    "getCachedProviderConnectionById",
    ()=>getCachedProviderConnectionById,
    "getCachedProviderConnections",
    ()=>getCachedProviderConnections,
    "getCachedProviderNodes",
    ()=>getCachedProviderNodes,
    "getCachedRawProviderConnections",
    ()=>getCachedRawProviderConnections,
    "getCachedSettings",
    ()=>getCachedSettings,
    "getCombosCacheVersion",
    ()=>getCombosCacheVersion,
    "getModelCatalogCacheVersion",
    ()=>getModelCatalogCacheVersion,
    "invalidateDbCache",
    ()=>invalidateDbCache,
    "setCachedLKGP",
    ()=>setCachedLKGP
]);
class TTLCache {
    cache = new Map();
    ttlMs;
    maxSize;
    constructor(ttlMs, maxSize){
        this.ttlMs = ttlMs;
        this.maxSize = maxSize ?? 0;
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) return undefined;
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return undefined;
        }
        // LRU: move to end (most recently used)
        this.cache.delete(key);
        this.cache.set(key, entry);
        return entry.value;
    }
    set(key, value) {
        // Evict LRU (first key in insertion order) when at capacity
        if (this.maxSize > 0 && this.cache.size >= this.maxSize && !this.cache.has(key)) {
            const oldest = this.cache.keys().next().value;
            if (oldest !== undefined) this.cache.delete(oldest);
        }
        this.cache.set(key, {
            value,
            expiresAt: Date.now() + this.ttlMs
        });
    }
    invalidate(key) {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }
}
// Cache with 5s TTL — short enough to pick up dashboard changes quickly,
// long enough to serve burst request bursts without hammering SQLite.
const SETTINGS_TTL_MS = 5_000;
const PRICING_TTL_MS = 30_000;
const CONNECTIONS_TTL_MS = 5_000;
const settingsCache = new TTLCache(SETTINGS_TTL_MS);
const pricingCache = new TTLCache(PRICING_TTL_MS);
const connectionsCache = new TTLCache(CONNECTIONS_TTL_MS, 500);
async function getCachedSettings() {
    const cached = settingsCache.get("settings");
    if (cached) return cached;
    const { getSettings } = await __turbopack_context__.A("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript, async loader)");
    const value = await getSettings();
    settingsCache.set("settings", value);
    return value;
}
async function getCachedPricing() {
    const cached = pricingCache.get("pricing");
    if (cached) return cached;
    const { getPricing } = await __turbopack_context__.A("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript, async loader)");
    const value = await getPricing();
    pricingCache.set("pricing", value);
    return value;
}
async function getCachedProviderConnections(filter) {
    const cacheKey = filter && Object.keys(filter).length > 0 ? JSON.stringify(filter) : "all";
    const cached = connectionsCache.get(cacheKey);
    if (cached) return cached;
    const { getProviderConnections } = await __turbopack_context__.A("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript, async loader)");
    const value = await getProviderConnections(filter);
    connectionsCache.set(cacheKey, value);
    return value;
}
const rawConnectionsCache = new TTLCache(CONNECTIONS_TTL_MS, 500);
async function getCachedRawProviderConnections(filter) {
    const key = JSON.stringify(filter ?? {});
    const cached = rawConnectionsCache.get(key);
    if (cached !== undefined) return cached;
    const { getRawProviderConnections } = await __turbopack_context__.A("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript, async loader)");
    const rows = await getRawProviderConnections(filter);
    rawConnectionsCache.set(key, rows);
    return rows;
}
const connectionByIdCache = new TTLCache(CONNECTIONS_TTL_MS, 10_000);
const nodesCache = new TTLCache(CONNECTIONS_TTL_MS);
async function getCachedProviderConnectionById(id) {
    if (!id) return null;
    const cached = connectionByIdCache.get(id);
    if (cached !== undefined) return cached;
    const { getProviderConnectionById } = await __turbopack_context__.A("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript, async loader)");
    const value = await getProviderConnectionById(id);
    connectionByIdCache.set(id, value);
    return value;
}
async function getCachedProviderNodes(filter) {
    const cacheKey = filter ? JSON.stringify(filter) : "all";
    const cached = nodesCache.get(cacheKey);
    if (cached) return cached;
    const { getProviderNodes } = await __turbopack_context__.A("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript, async loader)");
    const value = await getProviderNodes(filter);
    nodesCache.set(cacheKey, value);
    return value;
}
const lkgpCache = new TTLCache(SETTINGS_TTL_MS);
async function getCachedLKGP(comboName, modelId) {
    const cacheKey = `lkgp:${comboName}:${modelId}`;
    const cached = lkgpCache.get(cacheKey);
    if (cached !== undefined) return cached;
    const { getLKGP } = await __turbopack_context__.A("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript, async loader)");
    const value = await getLKGP(comboName, modelId);
    lkgpCache.set(cacheKey, value);
    return value;
}
async function setCachedLKGP(comboName, modelId, providerId, connectionId) {
    const { setLKGP } = await __turbopack_context__.A("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript, async loader)");
    await setLKGP(comboName, modelId, providerId, connectionId);
    lkgpCache.invalidate(`lkgp:${comboName}:${modelId}`);
}
// ──────────────── Combo Cache Invalidation Signal ────────────────
//
// The nested-combo expansion caches live in request handlers
// (`src/sse/handlers/chat.ts` getCombosCachedForChat and
// `open-sse/handlers/chatCore.ts` getCombosCached), each with a 10s TTL. A db
// module must NOT import a request handler (that would create an import cycle),
// so instead those caches consult this monotonically-incrementing version.
// Combo writes call `invalidateDbCache("combos")`, which bumps the version;
// the handlers compare the version they were populated at against the current
// one and treat a mismatch as a cache miss — so combo edits take effect
// immediately instead of after the 10s window (#3147).
let combosCacheVersion = 0;
function getCombosCacheVersion() {
    return combosCacheVersion;
}
// ──────────────── Model Catalog Cache Invalidation Signal ────────────────
//
// #6408 added a request-shape-keyed (prefix/isCodex/apiKey) TTL cache around the
// unified /v1/models builder (src/app/api/v1/models/catalog.ts) to coalesce
// concurrent/bursty GETs. That cache key does not vary with the underlying DB
// state the builder reads (connections, settings, combos), so a write followed by
// a read within the ~1.5s TTL replayed the pre-write response. Same import-cycle
// constraint as combosCacheVersion above (a db module must not import the route
// module) — catalog.ts instead compares this version on every access and drops its
// whole cache the moment it moves, so any write that calls invalidateDbCache() makes
// the next read miss immediately instead of waiting out the TTL.
let modelCatalogCacheVersion = 0;
function getModelCatalogCacheVersion() {
    return modelCatalogCacheVersion;
}
function invalidateDbCache(scope, id) {
    if (!scope || scope === "settings") settingsCache.invalidate();
    if (!scope || scope === "pricing") pricingCache.invalidate();
    if (!scope || scope === "connections") {
        connectionsCache.invalidate();
        rawConnectionsCache.invalidate();
        if (id) {
            connectionByIdCache.invalidate(id);
        } else {
            connectionByIdCache.invalidate();
        }
    }
    if (!scope || scope === "nodes") nodesCache.invalidate();
    if (!scope || scope === "combos") combosCacheVersion++;
    // Settings/connections/combos all feed the unified model catalog builder
    // (blockedProviders + hidePaidModels, provider connections + excludedModels,
    // combo definitions, respectively) — pricing does too, via isFreeModel().
    modelCatalogCacheVersion++;
}
}),
"[project]/src/lib/db/caseMapping.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * db/caseMapping.ts — pure snake_case ↔ camelCase column mapping.
 *
 * Extracted from db/core.ts (god-file decomposition): the column-name conversion
 * helpers that translate raw SQLite rows (snake_case columns, 0/1 booleans, `_json`
 * TEXT columns) into the camelCase shapes the domain modules consume. Pure — no DB
 * handle, no module state — so they live as a co-located leaf that every db/ module
 * (and core.ts itself) imports. core.ts re-exports all five so existing call sites that
 * pull these helpers off the core module keep working unchanged.
 */ __turbopack_context__.s([
    "cleanNulls",
    ()=>cleanNulls,
    "objToSnake",
    ()=>objToSnake,
    "rowToCamel",
    ()=>rowToCamel,
    "toCamelCase",
    ()=>toCamelCase,
    "toSnakeCase",
    ()=>toSnakeCase
]);
const BOOLEAN_CAMEL_COLUMNS = new Set([
    "isActive",
    "rateLimitProtection",
    "proxyEnabled",
    "perKeyProxyEnabled",
    "quotaVisible"
]);
function toSnakeCase(str) {
    return str.replace(/([A-Z])/g, "_$1").toLowerCase();
}
function toCamelCase(str) {
    return str.replace(/_([a-z])/g, (_, c)=>c.toUpperCase());
}
function objToSnake(obj) {
    if (!obj || typeof obj !== "object") return obj;
    const result = {};
    for (const [k, v] of Object.entries(obj)){
        result[toSnakeCase(k)] = v;
    }
    return result;
}
function rowToCamel(row) {
    if (!row) return null;
    const result = {};
    for (const [k, v] of Object.entries(row)){
        const camelKey = toCamelCase(k);
        if (BOOLEAN_CAMEL_COLUMNS.has(camelKey)) {
            result[camelKey] = v === 1 || v === true;
        } else if (camelKey === "providerSpecificData" && typeof v === "string") {
            try {
                result[camelKey] = JSON.parse(v);
            } catch  {
                result[camelKey] = v;
            }
        } else if (camelKey.endsWith("Json")) {
            // Convention: any column with a `_json` suffix is JSON-encoded TEXT.
            // Surface the parsed object under the friendlier name (key minus the
            // "Json" suffix) — e.g. quotaWindowThresholdsJson → quotaWindowThresholds.
            // A NULL/absent column normalizes to `baseKey: null` (not the suffixed
            // key) so read and write paths expose a consistent shape.
            const baseKey = camelKey.slice(0, -"Json".length);
            if (typeof v === "string") {
                try {
                    result[baseKey] = JSON.parse(v);
                } catch  {
                    result[baseKey] = null;
                }
            } else {
                result[baseKey] = v == null ? null : v;
            }
        } else {
            result[camelKey] = v;
        }
    }
    return result;
}
function cleanNulls(obj) {
    const result = {};
    for (const [k, v] of Object.entries(obj || {})){
        if (v !== null && v !== undefined) {
            result[k] = v;
        }
    }
    return result;
}
}),
"[project]/src/lib/db/schemaColumns.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * db/schemaColumns.ts — idempotent schema-column reconciliation + table introspection.
 *
 * Extracted from db/core.ts (god-file decomposition): the helpers that bring older SQLite
 * files up to the current column set (ALTER TABLE … ADD COLUMN, guarded by PRAGMA
 * table_info) plus the small introspection utilities they build on. Each takes the db
 * handle explicitly — no module state — so they live as a co-located leaf that core.ts
 * calls during getDbInstance() bootstrap. Behavior-preserving move.
 */ __turbopack_context__.s([
    "ensureCallLogsColumns",
    ()=>ensureCallLogsColumns,
    "ensureProviderConnectionsColumns",
    ()=>ensureProviderConnectionsColumns,
    "ensureProxyLogsColumns",
    ()=>ensureProxyLogsColumns,
    "ensureUsageHistoryAccountIndex",
    ()=>ensureUsageHistoryAccountIndex,
    "ensureUsageHistoryColumns",
    ()=>ensureUsageHistoryColumns,
    "getTableColumns",
    ()=>getTableColumns,
    "hasColumn",
    ()=>hasColumn,
    "hasTable",
    ()=>hasTable,
    "quoteIdentifier",
    ()=>quoteIdentifier
]);
function ensureProviderConnectionsColumns(db) {
    try {
        const columns = db.prepare("PRAGMA table_info(provider_connections)").all();
        const columnNames = new Set(columns.map((column)=>String(column.name ?? "")));
        for (const [column, type] of [
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
                "display_name",
                "TEXT"
            ],
            [
                "provider_specific_data",
                "TEXT"
            ]
        ]){
            if (!columnNames.has(column)) {
                db.exec(`ALTER TABLE provider_connections ADD COLUMN ${column} ${type}`);
                console.log(`[DB] Added provider_connections.${column} column`);
            }
        }
        if (!columnNames.has("rate_limit_protection")) {
            db.exec("ALTER TABLE provider_connections ADD COLUMN rate_limit_protection INTEGER DEFAULT 0");
            console.log("[DB] Added provider_connections.rate_limit_protection column");
        }
        if (!columnNames.has("last_used_at")) {
            db.exec("ALTER TABLE provider_connections ADD COLUMN last_used_at TEXT");
            console.log("[DB] Added provider_connections.last_used_at column");
        }
        if (!columnNames.has("group")) {
            db.exec('ALTER TABLE provider_connections ADD COLUMN "group" TEXT');
            console.log('[DB] Added provider_connections."group" column');
        }
        if (!columnNames.has("max_concurrent")) {
            db.exec("ALTER TABLE provider_connections ADD COLUMN max_concurrent INTEGER");
            console.log("[DB] Added provider_connections.max_concurrent column");
        }
        if (!columnNames.has("proxy_enabled")) {
            db.exec("ALTER TABLE provider_connections ADD COLUMN proxy_enabled INTEGER NOT NULL DEFAULT 1");
            console.log("[DB] Added provider_connections.proxy_enabled column");
        }
        if (!columnNames.has("per_key_proxy_enabled")) {
            db.exec("ALTER TABLE provider_connections ADD COLUMN per_key_proxy_enabled INTEGER NOT NULL DEFAULT 0");
            console.log("[DB] Added provider_connections.per_key_proxy_enabled column");
        }
        if (!columnNames.has("quota_visible")) {
            db.exec("ALTER TABLE provider_connections ADD COLUMN quota_visible INTEGER NOT NULL DEFAULT 1");
            console.log("[DB] Added provider_connections.quota_visible column");
        }
        if (!columnNames.has("quota_window_thresholds_json")) {
            db.exec("ALTER TABLE provider_connections ADD COLUMN quota_window_thresholds_json TEXT");
            console.log("[DB] Added provider_connections.quota_window_thresholds_json column");
        }
        if (!columnNames.has("rate_limit_overrides_json")) {
            db.exec("ALTER TABLE provider_connections ADD COLUMN rate_limit_overrides_json TEXT");
            console.log("[DB] Added provider_connections.rate_limit_overrides_json column");
        }
        // `refresh_token` is part of 001_initial_schema.sql, but `CREATE TABLE IF NOT EXISTS`
        // is a no-op on a pre-existing legacy table that predates it — heal it defensively
        // before the index below relies on it, or a very old DB fails startup entirely.
        if (!columnNames.has("refresh_token")) {
            db.exec("ALTER TABLE provider_connections ADD COLUMN refresh_token TEXT");
            console.log("[DB] Added provider_connections.refresh_token column");
        }
        db.exec("CREATE INDEX IF NOT EXISTS idx_pc_max_concurrent ON provider_connections(provider, max_concurrent)");
        db.exec("CREATE INDEX IF NOT EXISTS idx_pc_auth_active_refresh ON provider_connections(auth_type, is_active, refresh_token)");
        db.exec("CREATE INDEX IF NOT EXISTS idx_pc_provider_auth_type ON provider_connections(provider, auth_type)");
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn("[DB] Failed to verify provider_connections schema:", message);
    }
}
function ensureUsageHistoryAccountIndex(db) {
    try {
        db.exec("CREATE INDEX IF NOT EXISTS idx_uh_account_key ON usage_history(account_key)");
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn("[DB] Failed to verify usage_history account index:", message);
    }
}
function ensureUsageHistoryColumns(db) {
    try {
        const columns = db.prepare("PRAGMA table_info(usage_history)").all();
        const columnNames = new Set(columns.map((column)=>String(column.name ?? "")));
        if (!columnNames.has("success")) {
            db.exec("ALTER TABLE usage_history ADD COLUMN success INTEGER DEFAULT 1");
            console.log("[DB] Added usage_history.success column");
        }
        if (!columnNames.has("latency_ms")) {
            db.exec("ALTER TABLE usage_history ADD COLUMN latency_ms INTEGER DEFAULT 0");
            console.log("[DB] Added usage_history.latency_ms column");
        }
        if (!columnNames.has("ttft_ms")) {
            db.exec("ALTER TABLE usage_history ADD COLUMN ttft_ms INTEGER DEFAULT 0");
            console.log("[DB] Added usage_history.ttft_ms column");
        }
        if (!columnNames.has("error_code")) {
            db.exec("ALTER TABLE usage_history ADD COLUMN error_code TEXT");
            console.log("[DB] Added usage_history.error_code column");
        }
        if (!columnNames.has("service_tier")) {
            db.exec("ALTER TABLE usage_history ADD COLUMN service_tier TEXT DEFAULT 'standard'");
            console.log("[DB] Added usage_history.service_tier column");
        }
        db.exec("CREATE INDEX IF NOT EXISTS idx_uh_service_tier ON usage_history(service_tier)");
        if (!columnNames.has("combo_strategy")) {
            db.exec("ALTER TABLE usage_history ADD COLUMN combo_strategy TEXT DEFAULT 'direct'");
            console.log("[DB] Added usage_history.combo_strategy column");
        }
        db.exec("CREATE INDEX IF NOT EXISTS idx_uh_combo_strategy ON usage_history(combo_strategy)");
        if (!columnNames.has("account_key")) {
            db.exec("ALTER TABLE usage_history ADD COLUMN account_key TEXT");
            console.log("[DB] Added usage_history.account_key column");
        }
        if (!columnNames.has("account_label")) {
            db.exec("ALTER TABLE usage_history ADD COLUMN account_label TEXT");
            console.log("[DB] Added usage_history.account_label column");
        }
        if (!columnNames.has("account_label_priority")) {
            db.exec("ALTER TABLE usage_history ADD COLUMN account_label_priority INTEGER DEFAULT 0");
            console.log("[DB] Added usage_history.account_label_priority column");
        }
        db.exec("CREATE INDEX IF NOT EXISTS idx_uh_provider_model_timestamp ON usage_history(provider, model, timestamp)");
        db.exec(`CREATE INDEX IF NOT EXISTS idx_uh_dedup ON usage_history(
        timestamp,
        COALESCE(provider, ''),
        COALESCE(model, ''),
        COALESCE(connection_id, ''),
        COALESCE(api_key_id, ''),
        tokens_input,
        tokens_output
      )`);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn("[DB] Failed to verify usage_history schema:", message);
    }
}
function ensureCallLogsColumns(db) {
    try {
        const columns = db.prepare("PRAGMA table_info(call_logs)").all();
        const columnNames = new Set(columns.map((column)=>String(column.name ?? "")));
        if (!columnNames.has("artifact_relpath")) {
            db.exec("ALTER TABLE call_logs ADD COLUMN artifact_relpath TEXT");
            console.log("[DB] Added call_logs.artifact_relpath column");
        }
        if (!columnNames.has("has_pipeline_details")) {
            db.exec("ALTER TABLE call_logs ADD COLUMN has_pipeline_details INTEGER DEFAULT 0");
            console.log("[DB] Added call_logs.has_pipeline_details column");
        }
        if (!columnNames.has("requested_model")) {
            db.exec("ALTER TABLE call_logs ADD COLUMN requested_model TEXT DEFAULT NULL");
            console.log("[DB] Added call_logs.requested_model column");
        }
        if (!columnNames.has("request_type")) {
            db.exec("ALTER TABLE call_logs ADD COLUMN request_type TEXT DEFAULT NULL");
            console.log("[DB] Added call_logs.request_type column");
        }
        if (!columnNames.has("tokens_cache_read")) {
            db.exec("ALTER TABLE call_logs ADD COLUMN tokens_cache_read INTEGER DEFAULT NULL");
            console.log("[DB] Added call_logs.tokens_cache_read column");
        }
        if (!columnNames.has("tokens_cache_creation")) {
            db.exec("ALTER TABLE call_logs ADD COLUMN tokens_cache_creation INTEGER DEFAULT NULL");
            console.log("[DB] Added call_logs.tokens_cache_creation column");
        }
        if (!columnNames.has("tokens_reasoning")) {
            db.exec("ALTER TABLE call_logs ADD COLUMN tokens_reasoning INTEGER DEFAULT NULL");
            console.log("[DB] Added call_logs.tokens_reasoning column");
        }
        if (!columnNames.has("cache_source")) {
            db.exec("ALTER TABLE call_logs ADD COLUMN cache_source TEXT DEFAULT 'upstream'");
            console.log("[DB] Added call_logs.cache_source column");
        }
        if (!columnNames.has("combo_step_id")) {
            db.exec("ALTER TABLE call_logs ADD COLUMN combo_step_id TEXT DEFAULT NULL");
            console.log("[DB] Added call_logs.combo_step_id column");
        }
        if (!columnNames.has("combo_execution_key")) {
            db.exec("ALTER TABLE call_logs ADD COLUMN combo_execution_key TEXT DEFAULT NULL");
            console.log("[DB] Added call_logs.combo_execution_key column");
        }
        if (!columnNames.has("error_summary")) {
            db.exec("ALTER TABLE call_logs ADD COLUMN error_summary TEXT DEFAULT NULL");
            console.log("[DB] Added call_logs.error_summary column");
        }
        if (!columnNames.has("detail_state")) {
            db.exec("ALTER TABLE call_logs ADD COLUMN detail_state TEXT DEFAULT 'none'");
            console.log("[DB] Added call_logs.detail_state column");
        }
        if (!columnNames.has("artifact_size_bytes")) {
            db.exec("ALTER TABLE call_logs ADD COLUMN artifact_size_bytes INTEGER DEFAULT NULL");
            console.log("[DB] Added call_logs.artifact_size_bytes column");
        }
        if (!columnNames.has("artifact_sha256")) {
            db.exec("ALTER TABLE call_logs ADD COLUMN artifact_sha256 TEXT DEFAULT NULL");
            console.log("[DB] Added call_logs.artifact_sha256 column");
        }
        if (!columnNames.has("has_request_body")) {
            db.exec("ALTER TABLE call_logs ADD COLUMN has_request_body INTEGER DEFAULT 0");
            console.log("[DB] Added call_logs.has_request_body column");
        }
        if (!columnNames.has("has_response_body")) {
            db.exec("ALTER TABLE call_logs ADD COLUMN has_response_body INTEGER DEFAULT 0");
            console.log("[DB] Added call_logs.has_response_body column");
        }
        if (!columnNames.has("request_summary")) {
            db.exec("ALTER TABLE call_logs ADD COLUMN request_summary TEXT DEFAULT NULL");
            console.log("[DB] Added call_logs.request_summary column");
        }
        if (!columnNames.has("correlation_id")) {
            db.exec("ALTER TABLE call_logs ADD COLUMN correlation_id TEXT DEFAULT NULL");
            console.log("[DB] Added call_logs.correlation_id column");
        }
        if (!columnNames.has("model_pinned")) {
            db.exec("ALTER TABLE call_logs ADD COLUMN model_pinned INTEGER DEFAULT 0");
            console.log("[DB] Added call_logs.model_pinned column");
        }
        if (!columnNames.has("session_tag")) {
            db.exec("ALTER TABLE call_logs ADD COLUMN session_tag TEXT DEFAULT NULL");
            console.log("[DB] Added call_logs.session_tag column");
        }
        db.exec("CREATE INDEX IF NOT EXISTS idx_call_logs_requested_model ON call_logs(requested_model)");
        db.exec("CREATE INDEX IF NOT EXISTS idx_call_logs_request_type ON call_logs(request_type)");
        db.exec("CREATE INDEX IF NOT EXISTS idx_cl_combo_target ON call_logs(combo_name, combo_execution_key, timestamp)");
        db.exec("CREATE INDEX IF NOT EXISTS idx_cl_correlation_id ON call_logs(correlation_id)");
        db.exec("CREATE INDEX IF NOT EXISTS idx_cl_session_tag ON call_logs(session_tag)");
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn("[DB] Failed to verify call_logs schema:", message);
    }
}
function ensureProxyLogsColumns(db) {
    try {
        const columns = db.prepare("PRAGMA table_info(proxy_logs)").all();
        const columnNames = new Set(columns.map((column)=>String(column.name ?? "")));
        if (!columnNames.has("egress_ip")) {
            db.exec("ALTER TABLE proxy_logs ADD COLUMN egress_ip TEXT");
            console.log("[DB] Added proxy_logs.egress_ip column");
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn("[DB] Failed to verify proxy_logs schema:", message);
    }
}
function hasColumn(db, tableName, columnName) {
    const rows = db.prepare(`PRAGMA table_info(${tableName})`).all();
    return rows.some((row)=>row.name === columnName);
}
function hasTable(db, tableName) {
    return Boolean(db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(tableName));
}
function quoteIdentifier(identifier) {
    return `"${identifier.replace(/"/g, '""')}"`;
}
function getTableColumns(db, tableName) {
    return db.prepare(`PRAGMA table_info(${quoteIdentifier(tableName)})`).all().map((column)=>String(column.name ?? "")).filter((column)=>column.length > 0);
}
}),
"[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * db/core.js — Database infrastructure: schema, singleton, utils, migration.
 *
 * All domain modules import `getDbInstance` and helpers from here.
 */ __turbopack_context__.s([
    "DATA_DIR",
    ()=>DATA_DIR,
    "DB_BACKUPS_DIR",
    ()=>DB_BACKUPS_DIR,
    "SQLITE_FILE",
    ()=>SQLITE_FILE,
    "applyDatabaseOptimizationSettings",
    ()=>applyDatabaseOptimizationSettings,
    "closeDbInstance",
    ()=>closeDbInstance,
    "closeProbeIfSafe",
    ()=>closeProbeIfSafe,
    "ensureDbInitialized",
    ()=>ensureDbInitialized,
    "getAutoVacuumMode",
    ()=>getAutoVacuumMode,
    "getDbInstance",
    ()=>getDbInstance,
    "getDriverInfo",
    ()=>getDriverInfo,
    "isBuildPhase",
    ()=>isBuildPhase,
    "isCloud",
    ()=>isCloud,
    "isNativeSqliteLoadError",
    ()=>isNativeSqliteLoadError,
    "isSqliteDriverUnavailableError",
    ()=>isSqliteDriverUnavailableError,
    "pingDb",
    ()=>pingDb,
    "resetDbInstance",
    ()=>resetDbInstance,
    "runManagedDbHealthCheck",
    ()=>runManagedDbHealthCheck,
    "runManualVacuum",
    ()=>runManualVacuum,
    "setAutoVacuum",
    ()=>setAutoVacuum,
    "setCacheSize",
    ()=>setCacheSize,
    "setPageSize",
    ()=>setPageSize
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$adapters$2f$driverFactory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/adapters/driverFactory.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$probeUtils$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/probeUtils.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dataPaths.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$migrationRunner$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/migrationRunner.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$healthCheck$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/healthCheck.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$stateReset$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/stateReset.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logPayloads.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/databaseSettings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$optimizationSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/optimizationSettings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogArtifacts.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/encryption.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/caseMapping.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/testProcess.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/schemaColumns.ts [instrumentation] (ecmascript)");
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
const isCloud = typeof globalThis.caches === "object" && globalThis.caches !== null;
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
const DATA_DIR = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveWritableDataDir"])({
    isCloud
});
const LEGACY_DATA_DIR = isCloud ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getLegacyDotDataDir"])();
const SQLITE_FILE = isCloud ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(DATA_DIR, "storage.sqlite");
const JSON_DB_FILE = isCloud ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(DATA_DIR, "db.json");
const DB_BACKUPS_DIR = isCloud ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(DATA_DIR, "db_backups");
const DEFAULT_CRITICAL_TABLE_ROW_LIMIT = 10_000;
const SKIP_PRESERVE_NAMESPACES = new Set([
    "syncedAvailableModels",
    "providerLimitsCache",
    "lkgp",
    "gemini_thought_signatures"
]);
const CRITICAL_DB_TABLES = [
    {
        table: "key_value",
        maxRows: 10_000,
        readRows (db) {
            return (db.prepare("SELECT namespace, key, value FROM key_value").all() ?? []).filter((row)=>typeof row.namespace !== "string" || !SKIP_PRESERVE_NAMESPACES.has(row.namespace));
        }
    },
    {
        table: "provider_connections",
        maxRows: 5_000
    },
    {
        table: "provider_nodes",
        maxRows: 5_000
    },
    {
        table: "combos",
        maxRows: 5_000
    },
    {
        table: "api_keys",
        maxRows: 5_000
    },
    {
        table: "proxy_registry",
        maxRows: 5_000
    },
    {
        table: "proxy_assignments",
        maxRows: 10_000
    },
    {
        table: "model_combo_mappings",
        maxRows: 5_000
    },
    {
        table: "sync_tokens",
        maxRows: 5_000
    },
    {
        table: "registered_keys",
        maxRows: 10_000
    },
    {
        table: "provider_key_limits",
        maxRows: 10_000
    },
    {
        table: "account_key_limits",
        maxRows: 10_000
    },
    {
        table: "upstream_proxy_config",
        maxRows: 5_000
    },
    {
        table: "webhooks",
        maxRows: 5_000
    }
];
function isNativeSqliteLoadError(error) {
    const message = error instanceof Error ? error.message : String(error);
    const code = getErrorCode(error);
    return message.includes("Module did not self-register") || message.includes("NODE_MODULE_VERSION") || message.includes("ERR_DLOPEN_FAILED") || // bun and similar runtimes that skip the postinstall script never download
    // the prebuilt *.node binary, so `bindings()` fails with this message
    // before any DLOPEN even happens (#2358).
    message.includes("Could not locate the bindings file") || message.includes("Cannot find module 'better-sqlite3'") || code === "ERR_DLOPEN_FAILED" || code === "MODULE_NOT_FOUND";
}
function isSqliteDriverUnavailableError(error) {
    const message = error instanceof Error ? error.message : String(error);
    return message.includes("Nenhum driver SQLite disponível") || message.includes("Chame ensureDbInitialized() no startup") || message.includes("sql.js WASM ainda não foi pré-inicializado");
}
function getErrorCode(error) {
    if (!error || typeof error !== "object" || !("code" in error)) return undefined;
    const code = error.code;
    return typeof code === "string" ? code : undefined;
}
function closeProbeIfSafe(adapter) {
    if (!adapter || adapter.driver === "sql.js") return;
    if (adapter.open) adapter.close();
}
function openSqliteDatabase(sqliteFile, options) {
    const adapter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$adapters$2f$driverFactory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["tryOpenSync"])(sqliteFile, options);
    if (adapter) return adapter;
    const sqlJs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$adapters$2f$driverFactory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getSqlJsAdapter"])(sqliteFile);
    if (sqlJs) return sqlJs;
    // sql.js pre-init was genuinely attempted (e.g. by the top-level eager
    // barrier below) and failed — surface the real cause instead of the
    // generic/misleading "not pre-initialized yet" message (#7288).
    const preInitError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$adapters$2f$driverFactory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getSqlJsPreInitError"])(sqliteFile);
    const syncDrivers = process.versions.bun ? "bun:sqlite (failed)" : "better-sqlite3 (failed), node:sqlite (unavailable)";
    if (preInitError) {
        throw new Error(`[DB] Nenhum driver SQLite disponível para '${sqliteFile}'. ` + `Drivers testados: ${syncDrivers}, ` + `sql.js (falhou: ${preInitError}).`);
    }
    throw new Error(`[DB] Nenhum driver SQLite disponível para '${sqliteFile}'. ` + "Chame ensureDbInitialized() no startup. " + `Drivers testados: ${syncDrivers}. ` + "sql.js WASM ainda não foi pré-inicializado.");
}
// Ensure data directory exists — with fallback for restricted home directories (#133)
if (!isCloud && !__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(DATA_DIR)) {
    try {
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(DATA_DIR, {
            recursive: true
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[DB] Cannot create data directory '${DATA_DIR}': ${msg}\n` + `[DB] Set the DATA_DIR environment variable to a writable path, e.g.:\n` + `[DB]   DATA_DIR=/path/to/writable/dir omniroute`);
    }
}
// ──────────────── Schema ────────────────
const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS provider_connections (
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
    proxy_enabled INTEGER NOT NULL DEFAULT 1,
    per_key_proxy_enabled INTEGER NOT NULL DEFAULT 0,
    quota_visible INTEGER NOT NULL DEFAULT 1,
    quota_window_thresholds_json TEXT,
    rate_limit_overrides_json TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_pc_provider ON provider_connections(provider);
  CREATE INDEX IF NOT EXISTS idx_pc_active ON provider_connections(is_active);
  CREATE INDEX IF NOT EXISTS idx_pc_priority ON provider_connections(provider, priority);

  CREATE TABLE IF NOT EXISTS provider_nodes (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    prefix TEXT,
    api_type TEXT,
    base_url TEXT,
    chat_path TEXT,
    models_path TEXT,
    custom_headers_json TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS key_value (
    namespace TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    PRIMARY KEY (namespace, key)
  );

  CREATE TABLE IF NOT EXISTS combos (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    data TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    key TEXT NOT NULL UNIQUE,
    machine_id TEXT,
    allowed_models TEXT DEFAULT '[]',
    no_log INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_ak_key ON api_keys(key);

  CREATE TABLE IF NOT EXISTS db_meta (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS usage_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider TEXT,
    model TEXT,
    connection_id TEXT,
    account_key TEXT,
    account_label TEXT,
    account_label_priority INTEGER DEFAULT 0,
    api_key_id TEXT,
    api_key_name TEXT,
    tokens_input INTEGER DEFAULT 0,
    tokens_output INTEGER DEFAULT 0,
    tokens_cache_read INTEGER DEFAULT 0,
    tokens_cache_creation INTEGER DEFAULT 0,
    tokens_reasoning INTEGER DEFAULT 0,
    service_tier TEXT DEFAULT 'standard',
    status TEXT,
    success INTEGER DEFAULT 1,
    latency_ms INTEGER DEFAULT 0,
    ttft_ms INTEGER DEFAULT 0,
    error_code TEXT,
    timestamp TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_uh_timestamp ON usage_history(timestamp);
  CREATE INDEX IF NOT EXISTS idx_uh_provider ON usage_history(provider);
  CREATE INDEX IF NOT EXISTS idx_uh_model ON usage_history(model);

  CREATE TABLE IF NOT EXISTS call_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    method TEXT,
    path TEXT,
    status INTEGER,
    model TEXT,
    requested_model TEXT,
    provider TEXT,
    account TEXT,
    connection_id TEXT,
    duration INTEGER DEFAULT 0,
    tokens_in INTEGER DEFAULT 0,
    tokens_out INTEGER DEFAULT 0,
    tokens_cache_read INTEGER DEFAULT NULL,
    tokens_cache_creation INTEGER DEFAULT NULL,
    tokens_reasoning INTEGER DEFAULT NULL,
    tokens_compressed INTEGER DEFAULT NULL,
    cache_source TEXT DEFAULT "upstream",
    request_type TEXT,
    source_format TEXT,
    target_format TEXT,
    api_key_id TEXT,
    api_key_name TEXT,
    combo_name TEXT,
    combo_step_id TEXT,
    combo_execution_key TEXT,
    error_summary TEXT,
    detail_state TEXT DEFAULT 'none',
    artifact_relpath TEXT,
    artifact_size_bytes INTEGER DEFAULT NULL,
    artifact_sha256 TEXT DEFAULT NULL,
    has_request_body INTEGER DEFAULT 0,
    has_response_body INTEGER DEFAULT 0,
    has_pipeline_details INTEGER DEFAULT 0,
    request_summary TEXT,
    correlation_id TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_cl_timestamp ON call_logs(timestamp);
  CREATE INDEX IF NOT EXISTS idx_cl_status ON call_logs(status);

  CREATE TABLE IF NOT EXISTS proxy_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    status TEXT,
    proxy_type TEXT,
    proxy_host TEXT,
    proxy_port INTEGER,
    level TEXT,
    level_id TEXT,
    provider TEXT,
    target_url TEXT,
    public_ip TEXT,
    latency_ms INTEGER DEFAULT 0,
    error TEXT,
    connection_id TEXT,
    combo_id TEXT,
    account TEXT,
    tls_fingerprint INTEGER DEFAULT 0
  );
  CREATE INDEX IF NOT EXISTS idx_pl_timestamp ON proxy_logs(timestamp);
  CREATE INDEX IF NOT EXISTS idx_pl_status ON proxy_logs(status);
  CREATE INDEX IF NOT EXISTS idx_pl_provider ON proxy_logs(provider);

  -- Domain State Persistence (Phase 5)
  CREATE TABLE IF NOT EXISTS domain_fallback_chains (
    model TEXT PRIMARY KEY,
    chain TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS domain_budgets (
    api_key_id TEXT PRIMARY KEY,
    daily_limit_usd REAL NOT NULL,
    weekly_limit_usd REAL DEFAULT 0,
    monthly_limit_usd REAL DEFAULT 0,
    warning_threshold REAL DEFAULT 0.8,
    reset_interval TEXT DEFAULT 'daily',
    reset_time TEXT DEFAULT '00:00',
    budget_reset_at INTEGER,
    last_budget_reset_at INTEGER,
    warning_emitted_at INTEGER,
    warning_period_start INTEGER
  );

  CREATE TABLE IF NOT EXISTS domain_budget_reset_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_key_id TEXT NOT NULL,
    reset_interval TEXT NOT NULL,
    previous_spend REAL NOT NULL DEFAULT 0,
    reset_at INTEGER NOT NULL,
    next_reset_at INTEGER NOT NULL,
    period_start INTEGER NOT NULL,
    period_end INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_dbrl_key_reset ON domain_budget_reset_logs(api_key_id, reset_at DESC);

  CREATE TABLE IF NOT EXISTS domain_cost_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_key_id TEXT NOT NULL,
    cost REAL NOT NULL,
    timestamp INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_dch_key ON domain_cost_history(api_key_id);
  CREATE INDEX IF NOT EXISTS idx_dch_ts ON domain_cost_history(timestamp);

  CREATE TABLE IF NOT EXISTS domain_lockout_state (
    identifier TEXT PRIMARY KEY,
    attempts TEXT NOT NULL,
    locked_until INTEGER
  );

  CREATE TABLE IF NOT EXISTS domain_circuit_breakers (
    name TEXT PRIMARY KEY,
    state TEXT NOT NULL DEFAULT 'CLOSED',
    failure_count INTEGER DEFAULT 0,
    last_failure_time INTEGER,
    options TEXT
  );

  CREATE TABLE IF NOT EXISTS semantic_cache (
    id TEXT PRIMARY KEY,
    signature TEXT NOT NULL UNIQUE,
    model TEXT NOT NULL,
    prompt_hash TEXT NOT NULL,
    response TEXT NOT NULL,
    tokens_saved INTEGER DEFAULT 0,
    hit_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_sc_sig ON semantic_cache(signature);
  CREATE INDEX IF NOT EXISTS idx_sc_model ON semantic_cache(model);

  CREATE TABLE IF NOT EXISTS quota_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider TEXT NOT NULL,
    connection_id TEXT NOT NULL,
    window_key TEXT NOT NULL,
    remaining_percentage REAL,
    is_exhausted INTEGER DEFAULT 0,
    next_reset_at TEXT,
    window_duration_ms INTEGER,
    raw_data TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_quota_snapshots_provider_time ON quota_snapshots(provider, created_at);
  CREATE INDEX IF NOT EXISTS idx_quota_snapshots_connection_time ON quota_snapshots(connection_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_quota_snapshots_created_at ON quota_snapshots(created_at);
`;
function getDb() {
    return globalThis.__omnirouteDb ?? null;
}
function setDb(db) {
    if (db) {
        globalThis.__omnirouteDb = db;
    } else {
        delete globalThis.__omnirouteDb;
    }
}
function checkpointDb(db, mode = "TRUNCATE") {
    if (isCloud || isBuildPhase || !SQLITE_FILE) return false;
    db.pragma(`wal_checkpoint(${mode})`);
    return true;
}
function summarizePreservedTables(tables) {
    if (tables.length === 0) return "none";
    return tables.map((table)=>`${table.table}(${table.rowCount})`).join(", ");
}
function summarizeSkippedTables(tables) {
    if (tables.length === 0) return "none";
    return tables.map((table)=>`${table.table}(${table.rowCount}/${table.maxRows}: ${table.reason})`).join(", ");
}
function listProbeFailureBackups(sqliteFile) {
    const directory = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].dirname(sqliteFile);
    const baseName = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].basename(sqliteFile);
    const prefix = `${baseName}.probe-failed-`;
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(directory)) return [];
    return __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readdirSync(directory).filter((name)=>name.startsWith(prefix)).map((name)=>({
            path: __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(directory, name),
            timestamp: Number(name.slice(prefix.length))
        })).sort((left, right)=>{
        const leftTimestamp = Number.isFinite(left.timestamp) ? left.timestamp : 0;
        const rightTimestamp = Number.isFinite(right.timestamp) ? right.timestamp : 0;
        return rightTimestamp - leftTimestamp || right.path.localeCompare(left.path);
    }).map((backup)=>backup.path);
}
function captureCriticalDbState(sqliteFile) {
    const snapshot = {
        captureSucceeded: false,
        captureError: null,
        preservedTables: [],
        skippedTables: []
    };
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(sqliteFile)) {
        snapshot.captureSucceeded = true;
        return snapshot;
    }
    let probe = null;
    try {
        probe = openSqliteDatabase(sqliteFile, {
            readonly: true
        });
        for (const tableSpec of CRITICAL_DB_TABLES){
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["hasTable"])(probe, tableSpec.table)) continue;
            const maxRows = tableSpec.maxRows ?? DEFAULT_CRITICAL_TABLE_ROW_LIMIT;
            const rows = tableSpec.readRows?.(probe) ?? probe.prepare(`SELECT * FROM ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["quoteIdentifier"])(tableSpec.table)}`).all();
            const rowCount = rows.length;
            if (rowCount === 0) continue;
            if (rowCount > maxRows) {
                snapshot.skippedTables.push({
                    table: tableSpec.table,
                    rowCount,
                    maxRows,
                    reason: "row_limit_exceeded"
                });
                continue;
            }
            snapshot.preservedTables.push({
                table: tableSpec.table,
                rowCount,
                maxRows,
                columns: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getTableColumns"])(probe, tableSpec.table),
                rows
            });
        }
        snapshot.captureSucceeded = true;
        return snapshot;
    } catch (error) {
        snapshot.captureError = error instanceof Error ? error.message : String(error);
        return snapshot;
    } finally{
        try {
            closeProbeIfSafe(probe);
        } catch  {
        /* ignore */ }
    }
}
function restoreCriticalDbState(db, snapshot) {
    const restoredTables = [];
    const restore = db.transaction(()=>{
        for (const table of snapshot.preservedTables){
            if (table.rows.length === 0) continue;
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["hasTable"])(db, table.table)) {
                throw new Error(`Current schema is missing preserved table "${table.table}"`);
            }
            const currentColumns = new Set((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getTableColumns"])(db, table.table));
            const restoreColumns = table.columns.filter((column)=>currentColumns.has(column));
            if (restoreColumns.length === 0) {
                throw new Error(`No compatible columns remain for preserved table "${table.table}"`);
            }
            const sql = `INSERT OR REPLACE INTO ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["quoteIdentifier"])(table.table)} (${restoreColumns.map((column)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["quoteIdentifier"])(column)).join(", ")}) VALUES (${restoreColumns.map(()=>"?").join(", ")})`;
            const insert = db.prepare(sql);
            for (const row of table.rows){
                insert.run(...restoreColumns.map((column)=>row[column] ?? null));
            }
            restoredTables.push(table);
        }
    });
    restore();
    return restoredTables;
}
function cleanupRecreatedSqliteFiles(sqliteFile) {
    for (const filePath of [
        sqliteFile,
        `${sqliteFile}-wal`,
        `${sqliteFile}-shm`,
        `${sqliteFile}-journal`
    ]){
        try {
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(filePath)) __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].unlinkSync(filePath);
        } catch  {
        /* ignore */ }
    }
}
function parseLegacyError(value) {
    if (typeof value !== "string" || value.trim().length === 0) return null;
    try {
        return JSON.parse(value);
    } catch  {
        return value;
    }
}
function offloadLegacyCallLogDetails(db) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["hasTable"])(db, "call_logs_v1_legacy")) return;
    const pendingRows = db.prepare(`
      SELECT legacy.*
      FROM call_logs_v1_legacy AS legacy
      JOIN call_logs AS current ON current.id = legacy.id
      WHERE current.detail_state = 'legacy-inline'
      ORDER BY legacy.timestamp ASC
    `).all();
    if (pendingRows.length === 0) {
        db.exec("DROP TABLE IF EXISTS call_logs_v1_legacy");
        return;
    }
    const updateStmt = db.prepare(`
    UPDATE call_logs
    SET artifact_relpath = @artifactRelPath,
        artifact_size_bytes = @artifactSizeBytes,
        artifact_sha256 = @artifactSha256,
        detail_state = 'ready'
    WHERE id = @id
  `);
    const markMissingStmt = db.prepare(`
    UPDATE call_logs
    SET detail_state = 'missing',
        artifact_relpath = NULL,
        artifact_size_bytes = NULL,
        artifact_sha256 = NULL
    WHERE id = ?
  `);
    let failed = 0;
    const tx = db.transaction(()=>{
        for (const row of pendingRows){
            const artifact = {
                schemaVersion: 5,
                summary: {
                    id: row.id,
                    timestamp: row.timestamp || new Date().toISOString(),
                    method: row.method || "POST",
                    path: row.path || "/v1/chat/completions",
                    status: row.status || 0,
                    model: row.model || "-",
                    requestedModel: row.requested_model || null,
                    provider: row.provider || "-",
                    account: row.account || "-",
                    connectionId: row.connection_id || null,
                    duration: row.duration || 0,
                    tokens: {
                        in: row.tokens_in || 0,
                        out: row.tokens_out || 0,
                        cacheRead: row.tokens_cache_read ?? null,
                        cacheWrite: row.tokens_cache_creation ?? null,
                        reasoning: row.tokens_reasoning ?? null,
                        compressed: row.tokens_compressed ?? null
                    },
                    requestType: row.request_type || null,
                    sourceFormat: row.source_format || null,
                    targetFormat: row.target_format || null,
                    apiKeyId: row.api_key_id || null,
                    apiKeyName: row.api_key_name || null,
                    comboName: row.combo_name || null,
                    comboStepId: row.combo_step_id || null,
                    comboExecutionKey: row.combo_execution_key || null
                },
                requestBody: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseStoredPayload"])(row.request_body),
                responseBody: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseStoredPayload"])(row.response_body),
                error: parseLegacyError(row.error)
            };
            const artifactResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["writeCallArtifact"])(artifact, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildArtifactRelativePath"])(artifact.summary.timestamp, artifact.summary.id));
            if (!artifactResult) {
                failed++;
                markMissingStmt.run(row.id);
                continue;
            }
            updateStmt.run({
                id: row.id,
                artifactRelPath: artifactResult.relPath,
                artifactSizeBytes: artifactResult.sizeBytes,
                artifactSha256: artifactResult.sha256
            });
        }
    });
    tx();
    if (failed > 0) {
        console.warn(`[DB] Kept call_logs_v1_legacy after partial call log offload (${failed} failed row(s)).`);
        return;
    }
    db.exec("DROP TABLE IF EXISTS call_logs_v1_legacy");
    try {
        db.pragma("wal_checkpoint(TRUNCATE)");
        db.exec("VACUUM");
        console.log(`[DB] Offloaded ${pendingRows.length} legacy call log detail row(s) to artifacts.`);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn("[DB] Legacy call log compaction finished without VACUUM:", message);
    }
}
function shouldRunStartupDbHealthCheck() {
    if (process.env.OMNIROUTE_FORCE_DB_HEALTHCHECK === "1") return true;
    return !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isAutomatedTestProcess"])();
}
function createManagedDbBackup(db, reason) {
    const isTest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isAutomatedTestProcess"])();
    if (isTest) return false;
    try {
        const backupDir = DB_BACKUPS_DIR || __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(DATA_DIR, "db_backups");
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(backupDir)) {
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(backupDir, {
                recursive: true
            });
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(backupDir, `db_${timestamp}_${reason}.sqlite`);
        const escapedBackupPath = backupPath.replace(/'/g, "''");
        db.exec(`VACUUM INTO '${escapedBackupPath}'`);
        console.log(`[DB] Backup created (${reason}): ${backupPath}`);
        return true;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[DB] Failed to create ${reason} backup:`, message);
        return false;
    }
}
function createHealthCheckBackup(db) {
    return createManagedDbBackup(db, "health-check-repair");
}
function autoMigrateLegacyEncryptedConnections(db) {
    const rows = db.prepare("SELECT * FROM provider_connections").all();
    const updateStmt = db.prepare("UPDATE provider_connections SET api_key = @apiKey, id_token = @idToken, access_token = @accessToken, refresh_token = @refreshToken, updated_at = @updatedAt WHERE id = @id");
    const encryptedFields = [
        "apiKey",
        "idToken",
        "accessToken",
        "refreshToken"
    ];
    let migratedCount = 0;
    let backupCreated = false;
    for (const row of rows){
        const camelRow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["rowToCamel"])(row);
        if (!camelRow) continue;
        let updatedRow = false;
        for (const field of encryptedFields){
            if (typeof camelRow[field] !== "string") continue;
            const { updated, value } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["migrateLegacyEncryptedString"])(camelRow[field]);
            if (updated) {
                camelRow[field] = value;
                updatedRow = true;
            }
        }
        if (!updatedRow) continue;
        if (!backupCreated) {
            createManagedDbBackup(db, "legacy-encryption-migration");
            backupCreated = true;
        }
        updateStmt.run({
            id: camelRow.id,
            apiKey: camelRow.apiKey ?? null,
            idToken: camelRow.idToken ?? null,
            accessToken: camelRow.accessToken ?? null,
            refreshToken: camelRow.refreshToken ?? null,
            updatedAt: new Date().toISOString()
        });
        migratedCount++;
    }
    if (migratedCount > 0) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("connections");
        console.log(`[DB] Auto-migrated ${migratedCount} connection(s) to new static-salt encryption.`);
    }
    return migratedCount;
}
let dbHealthCheckTimer = null;
function getDbHealthCheckIntervalMs() {
    const rawValue = process.env.OMNIROUTE_DB_HEALTHCHECK_INTERVAL_MS;
    if (typeof rawValue === "string" && rawValue.trim().length > 0) {
        const parsed = Number(rawValue);
        if (Number.isFinite(parsed) && parsed >= 0) {
            return parsed;
        }
    }
    return 6 * 60 * 60 * 1000;
}
function clearDbHealthCheckScheduler() {
    if (dbHealthCheckTimer) {
        clearInterval(dbHealthCheckTimer);
        dbHealthCheckTimer = null;
    }
}
function startDbHealthCheckScheduler(db) {
    clearDbHealthCheckScheduler();
    if (isCloud || isBuildPhase || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isAutomatedTestProcess"])()) return;
    const intervalMs = getDbHealthCheckIntervalMs();
    if (intervalMs <= 0) return;
    dbHealthCheckTimer = setInterval(()=>{
        try {
            if (!db.open) return;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$healthCheck$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runDbHealthCheck"])(db, {
                autoRepair: true,
                skipIntegrityCheck: process.env.OMNIROUTE_SKIP_DB_HEALTHCHECK === "1",
                expectedSchemaVersion: "1",
                createBackupBeforeRepair: ()=>createHealthCheckBackup(db)
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn("[DB] Periodic health-check failed:", message);
        }
    }, intervalMs);
    dbHealthCheckTimer.unref?.();
}
function runManagedDbHealthCheck(options) {
    const db = getDbInstance();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$healthCheck$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runDbHealthCheck"])(db, {
        autoRepair: options?.autoRepair === true,
        expectedSchemaVersion: "1",
        createBackupBeforeRepair: ()=>createHealthCheckBackup(db)
    });
}
function getDbInstance() {
    const existing = getDb();
    if (existing) return existing;
    if (isCloud || isBuildPhase) {
        if (isBuildPhase) {
            console.log("[DB] Build phase detected — using in-memory SQLite (read-only)");
        }
        const memoryDb = openSqliteDatabase(":memory:");
        memoryDb.pragma("journal_mode = WAL");
        memoryDb.exec(SCHEMA_SQL);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureUsageHistoryColumns"])(memoryDb);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureUsageHistoryAccountIndex"])(memoryDb);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureCallLogsColumns"])(memoryDb);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureProviderConnectionsColumns"])(memoryDb);
        setDb(memoryDb);
        return memoryDb;
    }
    const sqliteFile = SQLITE_FILE;
    if (!sqliteFile) {
        throw new Error("SQLITE_FILE is unavailable for local mode");
    }
    const jsonDbFile = JSON_DB_FILE;
    const probeFailureBackups = listProbeFailureBackups(sqliteFile);
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(sqliteFile) && probeFailureBackups.length > 0) {
        // Cycle-breaker: a previous probe failure renamed the DB to
        // `storage.sqlite.probe-failed-<ts>` and the next caller auto-restored it.
        // When the same DB continues to fail the probe (typically an OOM on a
        // large sql.js WASM load), the rename/restore cascade loops forever
        // because every subsystem (BATCH, HealthCheck, ProviderLimitsSync, ...)
        // hits the same code path during boot. Track restoration attempts on
        // globalThis; abort with a clear recovery message after 3 attempts so
        // the user gets a real error instead of a hung "Starting server...".
        if ((globalThis.__omnirouteDbProbeRestoreCount = (globalThis.__omnirouteDbProbeRestoreCount || 0) + 1) > 3) {
            throw new Error(`[DB] Aborting startup: probe-failed/restore loop detected after 3 attempts. ` + `The preserved database at ${__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].dirname(sqliteFile)} is unloadable under this runtime. ` + `Remove the probe-failed backups (storage.sqlite.probe-failed-*) from ${__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].dirname(sqliteFile)} and restart, or restore the database from a known-good backup.`);
        }
        const latestBackup = probeFailureBackups[0];
        try {
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].renameSync(latestBackup, sqliteFile);
            console.log(`[DB] Auto-restored preserved database from previous probe failure: ${__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].basename(latestBackup)}`);
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            throw new Error(`[DB] Manual recovery required before startup. ` + `Failed to auto-restore preserved database ${latestBackup}: ${msg}. ` + `Restore the preserved file or another backup to ${sqliteFile} before restarting.`);
        }
    }
    let preservedCriticalState = {
        captureSucceeded: true,
        captureError: null,
        preservedTables: [],
        skippedTables: []
    };
    let failedProbePath = null;
    let failedProbeMessage = null;
    // Track whether the DB file is brand new (fresh DATA_DIR / Docker volume).
    // This is needed so the migration runner skips the mass-migration safety abort
    // that would otherwise trigger because heuristic seeding marks some migrations
    // as applied, making the fresh DB look like a wiped existing DB (#1328).
    const isNewDb = !__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(sqliteFile);
    // Detect and handle old schema format — preserve data when possible (#146)
    // Uses a single probe connection that becomes the real connection when possible.
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(sqliteFile)) {
        try {
            const probe = openSqliteDatabase(sqliteFile, {
                readonly: true
            });
            const hasOldSchema = probe.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations'").get();
            if (hasOldSchema) {
                let hasData = false;
                try {
                    const count = probe.prepare("SELECT COUNT(*) as c FROM provider_connections").get();
                    hasData = Boolean(count && count.c > 0);
                } catch  {
                // Table might not exist at all — truly incompatible
                }
                closeProbeIfSafe(probe);
                if (hasData) {
                    console.log(`[DB] Old schema_migrations table found but data exists — preserving data (#146)`);
                    const fixDb = openSqliteDatabase(sqliteFile);
                    try {
                        fixDb.exec("DROP TABLE IF EXISTS schema_migrations");
                        fixDb.pragma("wal_checkpoint(TRUNCATE)");
                    } catch (e) {
                        const message = e instanceof Error ? e.message : String(e);
                        console.warn("[DB] Could not clean up old schema table:", message);
                    } finally{
                        closeProbeIfSafe(fixDb);
                    }
                } else {
                    const oldPath = sqliteFile + ".old-schema";
                    console.log(`[DB] Old incompatible schema detected (empty) — renaming to ${__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].basename(oldPath)}`);
                    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].renameSync(sqliteFile, oldPath);
                    for (const ext of [
                        "-wal",
                        "-shm"
                    ]){
                        try {
                            if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(sqliteFile + ext)) __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].unlinkSync(sqliteFile + ext);
                        } catch  {
                        /* ok */ }
                    }
                }
            } else {
                closeProbeIfSafe(probe);
            }
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            console.warn("[DB] Could not probe existing DB:", message);
            // If the error is a Node module/ABI failure, throw it immediately to avoid renaming the database
            if (isNativeSqliteLoadError(e) || isSqliteDriverUnavailableError(e) || message.includes("could not be found")) {
                throw e;
            }
            // OOM during probe = the DB is too large to load under the current
            // V8 heap (sql.js loads the whole file into WASM memory). Throwing
            // immediately gives the user a clear "increase --max-old-space-size"
            // signal instead of silently renaming a perfectly good DB.
            if (/out of memory|allocation failure|Array buffer allocation failed|allocation failed/i.test(message)) {
                // Cycle-breaker (#6835): the OOM path never renames the file away,
                // so it never trips the generic probe-failed/restore cap above. Cap
                // it independently after 3 consecutive OOM failures (same threshold
                // as the generic path) so repeated polling doesn't hang forever with
                // no actionable terminal diagnostic.
                if ((globalThis.__omnirouteDbOomFailureCount = (globalThis.__omnirouteDbOomFailureCount || 0) + 1) > 3) {
                    throw new Error(`[DB] Aborting startup: persistent out-of-memory probing ${sqliteFile} after 3 attempts. ` + `Increase the V8 heap with NODE_OPTIONS=--max-old-space-size=4096 (or higher) — the ` + `current heap is insufficient for this database — and restart, or shrink/restore the ` + `database from a backup. Original error: ${message}`);
                }
                throw new Error(`[DB] Out of memory while probing ${sqliteFile}. ` + `The bundled sql.js driver loads the entire file into WASM memory; ` + `increase the V8 heap with NODE_OPTIONS=--max-old-space-size=4096 (or higher) ` + `and restart, or restore the database from a backup. ` + `Original error: ${message}`);
            }
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$probeUtils$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["retryProbeIfTransient"])(sqliteFile, e, openSqliteDatabase, closeProbeIfSafe)) {
                preservedCriticalState = captureCriticalDbState(sqliteFile);
                // SAFETY: Never delete the database — rename to backup so data can be recovered.
                // The old code would silently destroy all user data on any probe failure.
                const failedPath = sqliteFile + `.probe-failed-${Date.now()}`;
                try {
                    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].renameSync(sqliteFile, failedPath);
                    console.warn(`[DB] Renamed corrupt DB to ${__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].basename(failedPath)}`);
                    failedProbePath = failedPath;
                    failedProbeMessage = message;
                } catch  {
                /* ok */ }
            }
        }
    }
    if (failedProbePath) {
        const hasUnsafeSkippedTables = preservedCriticalState.skippedTables.length > 0;
        const missingSnapshot = !preservedCriticalState.captureSucceeded;
        if (hasUnsafeSkippedTables || missingSnapshot) {
            const details = missingSnapshot ? `snapshot_failed=${preservedCriticalState.captureError || "unknown"}` : `skipped_tables=${summarizeSkippedTables(preservedCriticalState.skippedTables)}`;
            throw new Error(`[DB] Manual recovery required after probe failure. ` + `Preserved database: ${failedProbePath}. ` + `Automatic recovery was aborted because ${details}. ` + `Original probe error: ${failedProbeMessage || "unknown"}.`);
        }
    }
    const db = openSqliteDatabase(sqliteFile);
    db.pragma("journal_mode = WAL");
    // better-sqlite3 is synchronous, so a contended write parks the Node event loop for up to
    // busy_timeout ms (a 0-CPU freeze that stacks under load → /health stops responding). The
    // hot-path writers here (usage_history, call_logs) are best-effort and the WinUI host opens
    // the same DB, so cap the block at 2s instead of 5s: normal writes complete in <1ms, and a
    // contended op can no longer freeze the loop past the host watchdog's 6s liveness probe.
    db.pragma("busy_timeout = 2000");
    db.pragma("synchronous = NORMAL");
    db.pragma(`cache_size = -${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"].optimization.cacheSize}`);
    db.pragma("temp_store = MEMORY");
    db.exec(SCHEMA_SQL);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureProviderConnectionsColumns"])(db);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureUsageHistoryColumns"])(db);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureCallLogsColumns"])(db);
    // ── Versioned Migrations ──
    // Auto-seed 001 as applied (the inline SCHEMA_SQL already created these tables)
    // then run any new migrations (002+)
    db.exec(`
    CREATE TABLE IF NOT EXISTS _omniroute_migrations (
      version TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    INSERT OR IGNORE INTO _omniroute_migrations (version, name)
    VALUES ('001', 'initial_schema');
  `);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$migrationRunner$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runMigrations"])(db, {
        isNewDb
    });
    // Fresh installs need the same post-migration index guarantee as upgraded
    // databases, including recovery from an interrupted migration 127 attempt.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureUsageHistoryAccountIndex"])(db);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$optimizationSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyStoredDatabaseOptimizationSettings"])(db);
    // Apply mmap_size from stored settings (migration 046), fallback to 256MiB
    try {
        const mmapRow = db.prepare("SELECT value FROM key_value WHERE namespace = ? AND key = ?").get("databaseSettings", "mmapSize");
        const mmapSize = mmapRow ? Math.max(0, parseInt(mmapRow.value, 10) || 0) : 268435456;
        if (mmapSize > 0) {
            db.pragma(`mmap_size = ${mmapSize}`);
        }
    } catch  {
    // mmap_size is best-effort; not available in all runtimes (e.g. web)
    }
    offloadLegacyCallLogDetails(db);
    // Auto-migrate from db.json if exists
    if (jsonDbFile && __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(jsonDbFile)) {
        migrateFromJson(db, jsonDbFile);
    }
    if (failedProbePath && preservedCriticalState.preservedTables.length > 0) {
        try {
            const restoredTables = restoreCriticalDbState(db, preservedCriticalState);
            console.log(`[DB] Restored preserved critical DB state after probe failure: ${summarizePreservedTables(restoredTables)}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            try {
                closeProbeIfSafe(db);
            } catch  {
            /* ignore */ }
            cleanupRecreatedSqliteFiles(sqliteFile);
            throw new Error(`[DB] Automatic recovery aborted after probe failure. ` + `Preserved database: ${failedProbePath}. ` + `Restore failure: ${message}.`);
        }
    }
    // Store schema version
    const versionStmt = db.prepare("INSERT OR REPLACE INTO db_meta (key, value) VALUES ('schema_version', '1')");
    versionStmt.run();
    if (shouldRunStartupDbHealthCheck()) {
        const skipIntegrityCheck = process.env.OMNIROUTE_SKIP_DB_HEALTHCHECK === "1";
        if (skipIntegrityCheck) {
            console.log("[DB] Health check skipped (OMNIROUTE_SKIP_DB_HEALTHCHECK=1)");
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$healthCheck$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runDbHealthCheck"])(db, {
            autoRepair: true,
            expectedSchemaVersion: "1",
            skipIntegrityCheck,
            createBackupBeforeRepair: ()=>createHealthCheckBackup(db)
        });
    }
    setDb(db);
    // Re-encrypt any tokens using the legacy dynamic salt to canonical static salt
    try {
        autoMigrateLegacyEncryptedConnections(db);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[DB] Legacy encryption migration failed: ${message}`);
    }
    startDbHealthCheckScheduler(db);
    // Log the resolved absolute DATA_DIR + SQLITE_FILE once at init so a
    // multi-replica / Docker volume-topology mismatch (each replica opening a
    // different on-disk DB → "phantom"/missing combos & connections) is
    // diagnosable straight from the logs. (#3147)
    console.log(`[DB] SQLite database ready: ${sqliteFile} ` + `(DATA_DIR=${__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(DATA_DIR)}, SQLITE_FILE=${__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(sqliteFile)})`);
    return db;
}
function pingDb() {
    try {
        const result = getDbInstance().prepare("SELECT 1 AS ok").get();
        return result?.ok === 1;
    } catch  {
        return false;
    }
}
function closeDbInstance(options) {
    clearDbHealthCheckScheduler();
    const db = getDb();
    if (!db) return false;
    const checkpointMode = options?.checkpointMode ?? "TRUNCATE";
    try {
        if (checkpointMode) {
            try {
                if (checkpointDb(db, checkpointMode)) {
                    console.log(`[DB] SQLite WAL checkpoint completed (${checkpointMode}).`);
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                console.warn(`[DB] WAL checkpoint failed during close (${checkpointMode}):`, message);
            }
        }
    } finally{
        try {
            if (db.open) db.close();
        } finally{
            setDb(null);
            // Module-level caches (prepared statements, schema-check memos — e.g.
            // apiKeys.ts) are bound to the closed connection. Without this, a recreated
            // DB (tests, backup restore of an older snapshot) hits "no such column"
            // on the stale re-prepare path. backup.ts already does this on restore;
            // close/reset must too (found by the 6A.1 orphan-test re-wire, 2026-06-09).
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$stateReset$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resetAllDbModuleState"])();
        }
    }
    return true;
}
function resetDbInstance() {
    closeDbInstance();
    // Read caches outlive the SQLite singleton. A reset swaps the backing
    // database, so retaining cached rows can leak the previous database's
    // connections/settings into the newly opened instance (tests and restore).
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])();
}
let driverInfoCached = null;
function setDriverInfo(info) {
    driverInfoCached = info;
}
function getDriverInfo() {
    return driverInfoCached;
}
async function ensureDbInitialized() {
    if (getDb()) return;
    // Cloud/build: getDbInstance() cria in-memory, sem necessidade de pré-init
    if (isCloud || isBuildPhase || !SQLITE_FILE) {
        getDbInstance();
        return;
    }
    // Tenta drivers síncronos primeiro
    const sync = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$adapters$2f$driverFactory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["tryOpenSync"])(SQLITE_FILE);
    if (sync) {
        // Drivers síncronos disponíveis — fechar o probe, getDbInstance() vai abrir com setup completo
        sync.close();
        getDbInstance();
        return;
    }
    // No synchronous driver available — pre-initialize sql.js (WASM, async)
    console.warn("[DB] Pre-initializing sql.js WASM (synchronous drivers unavailable)...");
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$adapters$2f$driverFactory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["preInitSqlJs"])(SQLITE_FILE);
    // Agora getSqlJsAdapter() retornará o adapter, e getDbInstance() vai usá-lo
    getDbInstance();
}
// ──────────────── JSON → SQLite Migration ────────────────
function migrateFromJson(db, jsonPath) {
    try {
        const raw = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(jsonPath, "utf-8");
        const data = JSON.parse(raw);
        const connCount = (data.providerConnections || []).length;
        const nodeCount = (data.providerNodes || []).length;
        const keyCount = (data.apiKeys || []).length;
        if (connCount === 0 && nodeCount === 0 && keyCount === 0) {
            console.log("[DB] db.json has no data to migrate, skipping");
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].renameSync(jsonPath, jsonPath + ".empty");
            return;
        }
        console.log(`[DB] Migrating db.json → SQLite (${connCount} connections, ${nodeCount} nodes, ${keyCount} keys)...`);
        const migrate = db.transaction(()=>{
            // 1. Provider Connections
            const insertConn = db.prepare(`
        INSERT OR REPLACE INTO provider_connections (
          id, provider, auth_type, name, email, priority, is_active,
          access_token, refresh_token, expires_at, token_expires_at,
          scope, project_id, test_status, error_code, last_error,
          last_error_at, last_error_type, last_error_source, backoff_level,
          rate_limited_until, health_check_interval, last_health_check_at,
          last_tested, api_key, id_token, provider_specific_data,
          expires_in, display_name, global_priority, default_model,
          token_type, consecutive_use_count, rate_limit_protection, last_used_at, created_at, updated_at
        ) VALUES (
          @id, @provider, @authType, @name, @email, @priority, @isActive,
          @accessToken, @refreshToken, @expiresAt, @tokenExpiresAt,
          @scope, @projectId, @testStatus, @errorCode, @lastError,
          @lastErrorAt, @lastErrorType, @lastErrorSource, @backoffLevel,
          @rateLimitedUntil, @healthCheckInterval, @lastHealthCheckAt,
          @lastTested, @apiKey, @idToken, @providerSpecificData,
          @expiresIn, @displayName, @globalPriority, @defaultModel,
          @tokenType, @consecutiveUseCount, @rateLimitProtection, @lastUsedAt, @createdAt, @updatedAt
        )
      `);
            for (const conn of data.providerConnections || []){
                insertConn.run({
                    id: conn.id,
                    provider: conn.provider,
                    authType: conn.authType || "oauth",
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
                    healthCheckInterval: conn.healthCheckInterval || null,
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
                    lastUsedAt: conn.lastUsedAt || null,
                    rateLimitProtection: conn.rateLimitProtection === true || conn.rateLimitProtection === 1 ? 1 : 0,
                    createdAt: conn.createdAt || new Date().toISOString(),
                    updatedAt: conn.updatedAt || new Date().toISOString()
                });
            }
            // 2. Provider Nodes
            const insertNode = db.prepare(`
        INSERT OR REPLACE INTO provider_nodes (id, type, name, prefix, api_type, base_url, created_at, updated_at)
        VALUES (@id, @type, @name, @prefix, @apiType, @baseUrl, @createdAt, @updatedAt)
      `);
            for (const node of data.providerNodes || []){
                insertNode.run({
                    id: node.id,
                    type: node.type,
                    name: node.name,
                    prefix: node.prefix || null,
                    apiType: node.apiType || null,
                    baseUrl: node.baseUrl || null,
                    createdAt: node.createdAt || new Date().toISOString(),
                    updatedAt: node.updatedAt || new Date().toISOString()
                });
            }
            // 3. Key-Value pairs
            const insertKv = db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES (?, ?, ?)");
            for (const [alias, model] of Object.entries(data.modelAliases || {})){
                insertKv.run("modelAliases", alias, JSON.stringify(model));
            }
            for (const [toolName, mappings] of Object.entries(data.mitmAlias || {})){
                insertKv.run("mitmAlias", toolName, JSON.stringify(mappings));
            }
            for (const [key, value] of Object.entries(data.settings || {})){
                insertKv.run("settings", key, JSON.stringify(value));
            }
            for (const [provider, models] of Object.entries(data.pricing || {})){
                insertKv.run("pricing", provider, JSON.stringify(models));
            }
            for (const [providerId, models] of Object.entries(data.customModels || {})){
                insertKv.run("customModels", providerId, JSON.stringify(models));
            }
            if (data.proxyConfig) {
                insertKv.run("proxyConfig", "global", JSON.stringify(data.proxyConfig.global || null));
                insertKv.run("proxyConfig", "providers", JSON.stringify(data.proxyConfig.providers || {}));
                insertKv.run("proxyConfig", "combos", JSON.stringify(data.proxyConfig.combos || {}));
                insertKv.run("proxyConfig", "keys", JSON.stringify(data.proxyConfig.keys || {}));
            }
            // 4. Combos
            const insertCombo = db.prepare(`
        INSERT OR REPLACE INTO combos (id, name, data, sort_order, created_at, updated_at)
        VALUES (@id, @name, @data, @sortOrder, @createdAt, @updatedAt)
      `);
            for (const [index, combo] of (data.combos || []).entries()){
                const normalizedCombo = {
                    ...combo,
                    sortOrder: typeof combo.sortOrder === "number" ? combo.sortOrder : index + 1
                };
                insertCombo.run({
                    id: normalizedCombo.id,
                    name: normalizedCombo.name,
                    data: JSON.stringify(normalizedCombo),
                    sortOrder: normalizedCombo.sortOrder,
                    createdAt: normalizedCombo.createdAt || new Date().toISOString(),
                    updatedAt: normalizedCombo.updatedAt || new Date().toISOString()
                });
            }
            // 5. API Keys
            const insertKey = db.prepare(`
        INSERT OR REPLACE INTO api_keys (id, name, key, machine_id, allowed_models, no_log, created_at)
        VALUES (@id, @name, @key, @machineId, @allowedModels, @noLog, @createdAt)
      `);
            for (const apiKey of data.apiKeys || []){
                insertKey.run({
                    id: apiKey.id,
                    name: apiKey.name,
                    key: apiKey.key,
                    machineId: apiKey.machineId || null,
                    allowedModels: JSON.stringify(apiKey.allowedModels || []),
                    noLog: apiKey.noLog ? 1 : 0,
                    createdAt: apiKey.createdAt || new Date().toISOString()
                });
            }
        });
        migrate();
        const migratedPath = jsonPath + ".migrated";
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].renameSync(jsonPath, migratedPath);
        console.log(`[DB] ✓ Migration complete. Original saved as ${migratedPath}`);
        const legacyBackupDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(DATA_DIR, "db_backups");
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(legacyBackupDir)) {
            const jsonBackups = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readdirSync(legacyBackupDir).filter((f)=>f.endsWith(".json"));
            if (jsonBackups.length > 0) {
                console.log(`[DB] Note: ${jsonBackups.length} legacy .json backups remain in ${legacyBackupDir}`);
            }
        }
    } catch (err) {
        console.error("[DB] Migration from db.json failed:", err.message);
    }
}
function applyDatabaseOptimizationSettings(settings) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$optimizationSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyDatabaseOptimizationSettingsForDb"])(getDbInstance(), settings, {
        applyPersistent: true
    });
}
function setAutoVacuum(mode) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$optimizationSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["setAutoVacuumForDb"])(getDbInstance(), mode);
}
function getAutoVacuumMode() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$optimizationSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAutoVacuumModeForDb"])(getDbInstance());
}
function runManualVacuum() {
    const db = getDbInstance();
    const startTime = Date.now();
    try {
        console.log("[DB] Starting manual VACUUM...");
        db.exec("VACUUM");
        const duration = Date.now() - startTime;
        console.log(`[DB] Manual VACUUM completed in ${duration}ms`);
        return {
            success: true,
            duration
        };
    } catch (err) {
        const duration = Date.now() - startTime;
        console.error("[DB] Manual VACUUM failed:", err);
        const message = err instanceof Error ? err.message : String(err);
        return {
            success: false,
            duration,
            error: message
        };
    }
}
function setPageSize(pageSize) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$optimizationSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["setPageSizeForDb"])(getDbInstance(), pageSize);
}
function setCacheSize(cacheSizeKb) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$optimizationSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["setCacheSizeForDb"])(getDbInstance(), cacheSizeKb);
}
}),
"[project]/src/lib/db/paramFilters.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addParamToBlocklist",
    ()=>addParamToBlocklist,
    "deleteParamFilterConfig",
    ()=>deleteParamFilterConfig,
    "getParamFilterConfig",
    ()=>getParamFilterConfig,
    "isAutoLearnGloballyEnabled",
    ()=>isAutoLearnGloballyEnabled,
    "loadParamFilterConfigs",
    ()=>loadParamFilterConfigs,
    "setGlobalAutoLearnEnabled",
    ()=>setGlobalAutoLearnEnabled,
    "setParamFilterConfig",
    ()=>setParamFilterConfig
]);
/**
 * db/paramFilters.ts — Provider/Model parameter filter configuration.
 *
 * CRUD against the key_value table under namespace "provider_param_filters".
 * Follows the established key_value pattern from databaseSettings.ts.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
;
const NAMESPACE = "provider_param_filters";
// ── Cache ───────────────────────────────────────────────────────────────────
let filterCache = null;
let cacheGeneration = 0;
function bumpCacheGeneration() {
    cacheGeneration++;
    filterCache = null;
}
// ── Helpers ─────────────────────────────────────────────────────────────────
function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
function parseStoredValue(raw) {
    if (typeof raw !== "string") return raw;
    try {
        return JSON.parse(raw);
    } catch  {
        return raw;
    }
}
function toNormalizedString(value) {
    return typeof value === "string" && value.length > 0 ? value : null;
}
function toStringArray(value) {
    return Array.isArray(value) ? value.filter((k)=>typeof k === "string") : [];
}
function toModelParamFilter(raw) {
    const block = toStringArray(raw.block);
    const allow = toStringArray(raw.allow);
    if (block.length === 0 && allow.length === 0) return null;
    const filter = {};
    if (block.length > 0) filter.block = block;
    if (allow.length > 0) filter.allow = allow;
    return filter;
}
function toModelParamFilters(raw) {
    const models = {};
    if (!isRecord(raw)) return models;
    for (const [modelId, val] of Object.entries(raw)){
        if (!isRecord(val)) continue;
        const filter = toModelParamFilter(val);
        if (filter) models[modelId] = filter;
    }
    return models;
}
function toProviderParamFilter(raw) {
    if (!isRecord(raw)) return null;
    const block = toStringArray(raw.block);
    const allow = toStringArray(raw.allow);
    const models = toModelParamFilters(raw.models);
    const autoLearn = typeof raw.autoLearn === "boolean" ? raw.autoLearn : false;
    return {
        block,
        allow,
        models: Object.keys(models).length > 0 ? models : undefined,
        autoLearn
    };
}
// ── Read ────────────────────────────────────────────────────────────────────
function readNamespace(namespace) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = ?").all(namespace);
    const values = {};
    for (const row of rows){
        values[row.key] = parseStoredValue(row.value);
    }
    return values;
}
function loadAllConfigs() {
    const raw = readNamespace(NAMESPACE);
    const map = new Map();
    for (const [key, value] of Object.entries(raw)){
        const parsed = toProviderParamFilter(value);
        if (parsed) {
            map.set(key, parsed);
        }
    }
    return map;
}
function loadParamFilterConfigs() {
    if (filterCache === null) {
        filterCache = loadAllConfigs();
    }
    return filterCache;
}
function getParamFilterConfig(provider) {
    return toNormalizedString(provider) ? loadParamFilterConfigs().get(provider) ?? null : null;
}
function setParamFilterConfig(provider, config) {
    if (!toNormalizedString(provider)) return;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const stmt = db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES (?, ?, ?)");
    // Normalize the filter before persisting
    const normalized = {
        block: config.block ?? [],
        allow: config.allow ?? [],
        autoLearn: config.autoLearn ?? false,
        models: config.models && Object.keys(config.models).length > 0 ? config.models : undefined
    };
    stmt.run(NAMESPACE, provider, JSON.stringify(normalized));
    bumpCacheGeneration();
}
function deleteParamFilterConfig(provider) {
    if (!toNormalizedString(provider)) return;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const stmt = db.prepare("DELETE FROM key_value WHERE namespace = ? AND key = ?");
    stmt.run(NAMESPACE, provider);
    bumpCacheGeneration();
}
// ── Global auto-learn flag ──────────────────────────────────────────────────
const GLOBAL_AUTOLEARN_KEY = "__global__";
function isAutoLearnGloballyEnabled() {
    const globalCfg = getParamFilterConfig(GLOBAL_AUTOLEARN_KEY);
    return globalCfg?.autoLearn === true;
}
function setGlobalAutoLearnEnabled(enabled) {
    const existing = getParamFilterConfig(GLOBAL_AUTOLEARN_KEY);
    setParamFilterConfig(GLOBAL_AUTOLEARN_KEY, {
        block: existing?.block ?? [],
        allow: existing?.allow ?? [],
        autoLearn: enabled
    });
}
function addParamToBlocklist(provider, paramName, model) {
    if (!toNormalizedString(provider) || !toNormalizedString(paramName)) return;
    const existing = getParamFilterConfig(provider) ?? {
        block: [],
        allow: [],
        autoLearn: false
    };
    if (model) {
        // Model-level
        const models = existing.models ?? {};
        const modelCfg = models[model] ?? {};
        if (Array.isArray(modelCfg.block) && modelCfg.block.includes(paramName)) return;
        const updatedBlock = [
            ...modelCfg.block ?? [],
            paramName
        ];
        models[model] = {
            ...modelCfg,
            block: updatedBlock
        };
        existing.models = models;
    } else {
        // Provider-level
        if (existing.block.includes(paramName)) return;
        existing.block = [
            ...existing.block,
            paramName
        ];
    }
    setParamFilterConfig(provider, existing);
}
}),
"[project]/src/lib/db/reasoningCache.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cleanupExpiredReasoning",
    ()=>cleanupExpiredReasoning,
    "clearAllReasoningCache",
    ()=>clearAllReasoningCache,
    "deleteReasoningCache",
    ()=>deleteReasoningCache,
    "getReasoningCache",
    ()=>getReasoningCache,
    "getReasoningCacheEntries",
    ()=>getReasoningCacheEntries,
    "getReasoningCacheStats",
    ()=>getReasoningCacheStats,
    "setReasoningCache",
    ()=>setReasoningCache
]);
/**
 * reasoningCache.ts — DB domain module for the Reasoning Replay Cache.
 *
 * Persists reasoning_content from thinking-mode models (DeepSeek V4, Kimi K2,
 * Qwen-Thinking, etc.) keyed by tool_call_id. Used for crash recovery and
 * dashboard visibility. The hot path uses the in-memory cache in
 * open-sse/services/reasoningCache.ts; this module is the persistence layer.
 *
 * @see Issue #1628
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
;
// ──────────────── Constants ────────────────
const DEFAULT_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
function toUnixEpochSeconds(dateMs) {
    return Math.floor(dateMs / 1000);
}
const EXPIRES_AT_EPOCH_SQL = `COALESCE(
  CASE
    WHEN typeof(expires_at) IN ('integer', 'real') THEN CAST(expires_at AS INTEGER)
    WHEN typeof(expires_at) = 'text' AND expires_at <> '' AND expires_at NOT GLOB '*[^0-9]*'
      THEN CAST(expires_at AS INTEGER)
    ELSE unixepoch(expires_at)
  END,
  0
)`;
function epochSecondsToIso(value) {
    const text = String(value);
    const seconds = typeof value === "number" || text !== "" && !/[^0-9]/.test(text) ? Number.parseInt(text, 10) : NaN;
    if (Number.isFinite(seconds) && seconds > 0) {
        return new Date(seconds * 1000).toISOString();
    }
    const parsedMs = Date.parse(text);
    if (Number.isFinite(parsedMs)) {
        return new Date(parsedMs).toISOString();
    }
    return String(value);
}
const MAX_ENTRY_BYTES = 10000;
function setReasoningCache(toolCallId, provider, model, reasoning, ttlMs = DEFAULT_TTL_MS) {
    if (reasoning.length > MAX_ENTRY_BYTES) {
        reasoning = reasoning.slice(0, MAX_ENTRY_BYTES);
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const expiresAt = toUnixEpochSeconds(Date.now() + ttlMs);
    const charCount = reasoning.length;
    db.prepare(`INSERT OR REPLACE INTO reasoning_cache
       (tool_call_id, provider, model, reasoning, char_count, created_at, expires_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'), ?)`).run(toolCallId, provider, model, reasoning, charCount, expiresAt);
}
function getReasoningCache(toolCallId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare(`SELECT reasoning, provider, model FROM reasoning_cache
       WHERE tool_call_id = ? AND ${EXPIRES_AT_EPOCH_SQL} > unixepoch('now')`).get(toolCallId);
    return row ?? null;
}
function deleteReasoningCache(toolCallId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const result = db.prepare(`DELETE FROM reasoning_cache WHERE tool_call_id = ?`).run(toolCallId);
    return result.changes;
}
function cleanupExpiredReasoning() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const result = db.prepare(`DELETE FROM reasoning_cache WHERE ${EXPIRES_AT_EPOCH_SQL} <= unixepoch('now')`).run();
    return result.changes;
}
function clearAllReasoningCache(provider) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    if (provider) {
        const result = db.prepare(`DELETE FROM reasoning_cache WHERE provider = ?`).run(provider);
        return result.changes;
    }
    const result = db.prepare(`DELETE FROM reasoning_cache`).run();
    return result.changes;
}
function getReasoningCacheStats() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    // Total counts
    const totals = db.prepare(`SELECT COUNT(*) as total_entries, COALESCE(SUM(char_count), 0) as total_chars
       FROM reasoning_cache WHERE ${EXPIRES_AT_EPOCH_SQL} > unixepoch('now')`).get();
    // By provider
    const providerRows = db.prepare(`SELECT provider, COUNT(*) as entries, COALESCE(SUM(char_count), 0) as chars
       FROM reasoning_cache WHERE ${EXPIRES_AT_EPOCH_SQL} > unixepoch('now')
       GROUP BY provider ORDER BY entries DESC`).all();
    const byProvider = {};
    for (const row of providerRows){
        byProvider[row.provider] = {
            entries: row.entries,
            chars: row.chars
        };
    }
    // By model
    const modelRows = db.prepare(`SELECT model, COUNT(*) as entries, COALESCE(SUM(char_count), 0) as chars
       FROM reasoning_cache WHERE ${EXPIRES_AT_EPOCH_SQL} > unixepoch('now')
       GROUP BY model ORDER BY entries DESC`).all();
    const byModel = {};
    for (const row of modelRows){
        byModel[row.model] = {
            entries: row.entries,
            chars: row.chars
        };
    }
    // Oldest/newest
    const oldest = db.prepare(`SELECT created_at FROM reasoning_cache
       WHERE ${EXPIRES_AT_EPOCH_SQL} > unixepoch('now') ORDER BY created_at ASC LIMIT 1`).get();
    const newest = db.prepare(`SELECT created_at FROM reasoning_cache
       WHERE ${EXPIRES_AT_EPOCH_SQL} > unixepoch('now') ORDER BY created_at DESC LIMIT 1`).get();
    return {
        totalEntries: totals.total_entries,
        totalChars: totals.total_chars,
        byProvider,
        byModel,
        oldestEntry: oldest?.created_at ?? null,
        newestEntry: newest?.created_at ?? null
    };
}
function getReasoningCacheEntries(opts = {}) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const limit = Math.min(opts.limit ?? 50, 200);
    const offset = opts.offset ?? 0;
    const conditions = [
        `${EXPIRES_AT_EPOCH_SQL} > unixepoch('now')`
    ];
    const params = [];
    if (opts.provider) {
        conditions.push("provider = ?");
        params.push(opts.provider);
    }
    if (opts.model) {
        conditions.push("model = ?");
        params.push(opts.model);
    }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const rows = db.prepare(`SELECT tool_call_id, provider, model, reasoning, char_count, created_at, expires_at
       FROM reasoning_cache ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`).all(...params, limit, offset);
    return rows.map((row)=>({
            toolCallId: row.tool_call_id,
            provider: row.provider,
            model: row.model,
            reasoning: row.reasoning,
            charCount: row.char_count,
            createdAt: row.created_at,
            expiresAt: epochSecondsToIso(row.expires_at)
        }));
}
}),
"[project]/src/lib/db/backup.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "backupDbFile",
    ()=>backupDbFile,
    "cleanupDbBackups",
    ()=>cleanupDbBackups,
    "countImportedRows",
    ()=>countImportedRows,
    "exportAllSummaryRows",
    ()=>exportAllSummaryRows,
    "getDbBackupMaxFiles",
    ()=>getDbBackupMaxFiles,
    "getDbBackupRetentionDays",
    ()=>getDbBackupRetentionDays,
    "getTableNamesFromAdapter",
    ()=>getTableNamesFromAdapter,
    "isAutoBackupDisabledBySetting",
    ()=>isAutoBackupDisabledBySetting,
    "listDbBackups",
    ()=>listDbBackups,
    "restoreDbBackup",
    ()=>restoreDbBackup,
    "setDbBackupMaxFiles",
    ()=>setDbBackupMaxFiles,
    "setDbBackupRetentionDays",
    ()=>setDbBackupRetentionDays,
    "unlinkFileWithRetry",
    ()=>unlinkFileWithRetry
]);
/**
 * db/backup.js — Database backup/restore operations.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$stateReset$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/stateReset.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/testProcess.ts [instrumentation] (ecmascript)");
;
;
;
;
;
// ──────────────── Backup Config ────────────────
let _lastBackupAt = 0;
const BACKUP_THROTTLE_MS = 60 * 60 * 1000; // 60 minutes
const MAX_DB_BACKUPS = 20;
const DEFAULT_DB_BACKUP_RETENTION_DAYS = 0;
const TRUE_ENV_VALUES = new Set([
    "1",
    "true",
    "yes",
    "on"
]);
function parsePositiveInt(value, fallback) {
    if (!value) return fallback;
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
function parseNonNegativeInt(value, fallback) {
    if (value === undefined) return fallback;
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}
// #3834: the "Keep latest backups" UI value is persisted here so it survives a page
// refresh / the loadStorageHealth() refetch. A dedicated namespace avoids any
// cross-talk with the databaseSettings key_value store (which rewrites all of its own
// keys on every update). It is intentionally separate from the orphan
// `databaseSettings.backup.keepLastNBackups` (default 5) so existing installs keep the
// historical default of 20 until an operator explicitly changes it here.
const DB_BACKUP_SETTINGS_NAMESPACE = "dbBackup";
const DB_BACKUP_MAX_FILES_KEY = "maxFiles";
const DB_BACKUP_RETENTION_DAYS_KEY = "retentionDays";
function getStoredDbBackupInteger(key, options) {
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const row = db.prepare("SELECT value FROM key_value WHERE namespace = ? AND key = ?").get(DB_BACKUP_SETTINGS_NAMESPACE, key);
        if (!row?.value) return undefined;
        const parsed = JSON.parse(row.value);
        return Number.isInteger(parsed) && parsed >= options.min ? parsed : undefined;
    } catch  {
        return undefined;
    }
}
function setStoredDbBackupInteger(key, value, options) {
    if (!Number.isInteger(value) || value < options.min) return;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES (?, ?, ?)").run(DB_BACKUP_SETTINGS_NAMESPACE, key, JSON.stringify(value));
}
function setDbBackupMaxFiles(value) {
    setStoredDbBackupInteger(DB_BACKUP_MAX_FILES_KEY, value, {
        min: 1
    });
}
function getDbBackupMaxFiles() {
    // Precedence: DB_BACKUP_MAX_FILES env override (ops) → persisted UI value → default.
    if (process.env.DB_BACKUP_MAX_FILES) {
        return parsePositiveInt(process.env.DB_BACKUP_MAX_FILES, MAX_DB_BACKUPS);
    }
    return getStoredDbBackupInteger(DB_BACKUP_MAX_FILES_KEY, {
        min: 1
    }) ?? MAX_DB_BACKUPS;
}
function setDbBackupRetentionDays(value) {
    setStoredDbBackupInteger(DB_BACKUP_RETENTION_DAYS_KEY, value, {
        min: 0
    });
}
function getDbBackupRetentionDays() {
    // Precedence: DB_BACKUP_RETENTION_DAYS env override (ops) → persisted UI value → default.
    if (process.env.DB_BACKUP_RETENTION_DAYS) {
        return parseNonNegativeInt(process.env.DB_BACKUP_RETENTION_DAYS, DEFAULT_DB_BACKUP_RETENTION_DAYS);
    }
    return getStoredDbBackupInteger(DB_BACKUP_RETENTION_DAYS_KEY, {
        min: 0
    }) ?? DEFAULT_DB_BACKUP_RETENTION_DAYS;
}
function getBackupDir() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DB_BACKUPS_DIR"] || __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DATA_DIR"], "db_backups");
}
function getBackupFamilyBase(filename) {
    if (filename.endsWith("-wal") || filename.endsWith("-shm")) return filename.slice(0, -4);
    if (filename.endsWith("-journal")) return filename.slice(0, -8);
    return filename;
}
function collectBackupFamilies(backupDir) {
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(backupDir)) return [];
    const families = new Map();
    for (const name of __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readdirSync(backupDir)){
        if (!name.startsWith("db_")) continue;
        const base = getBackupFamilyBase(name);
        const filePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(backupDir, name);
        let stat;
        try {
            stat = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].statSync(filePath);
        } catch  {
            continue;
        }
        const family = families.get(base) || {
            base,
            hasPrimary: false,
            primaryMtimeMs: 0,
            latestMtimeMs: 0,
            files: []
        };
        family.files.push(name);
        family.latestMtimeMs = Math.max(family.latestMtimeMs, stat.mtimeMs);
        if (name === base && name.endsWith(".sqlite")) {
            family.hasPrimary = true;
            family.primaryMtimeMs = stat.mtimeMs;
        }
        families.set(base, family);
    }
    return [
        ...families.values()
    ];
}
function cleanupDbBackups(options) {
    const backupDir = getBackupDir();
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(backupDir)) {
        return {
            deletedBackupFamilies: 0,
            deletedFiles: 0,
            keptBackupFamilies: 0,
            maxFiles: options?.maxFiles ?? getDbBackupMaxFiles(),
            retentionDays: options?.retentionDays ?? getDbBackupRetentionDays()
        };
    }
    const maxFiles = Math.max(1, options?.maxFiles ?? getDbBackupMaxFiles());
    const retentionDays = Math.max(0, options?.retentionDays ?? getDbBackupRetentionDays());
    const cutoffMs = retentionDays > 0 ? Date.now() - retentionDays * 24 * 60 * 60 * 1000 : 0;
    const families = collectBackupFamilies(backupDir);
    const primaryFamilies = families.filter((family)=>family.hasPrimary).sort((a, b)=>b.primaryMtimeMs - a.primaryMtimeMs);
    const keepPrimaryBases = new Set(primaryFamilies.slice(0, maxFiles).map((family)=>family.base));
    let deletedBackupFamilies = 0;
    let deletedFiles = 0;
    for (const family of families){
        const isOverflowPrimary = family.hasPrimary && !keepPrimaryBases.has(family.base);
        const isExpired = retentionDays > 0 && family.latestMtimeMs < cutoffMs;
        const isOrphan = !family.hasPrimary;
        if (!isOverflowPrimary && !isExpired && !isOrphan) continue;
        deletedBackupFamilies += 1;
        for (const name of family.files){
            try {
                __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].unlinkSync(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(backupDir, name));
                deletedFiles += 1;
            } catch  {
            /* ignore */ }
        }
    }
    return {
        deletedBackupFamilies,
        deletedFiles,
        keptBackupFamilies: collectBackupFamilies(backupDir).filter((family)=>family.hasPrimary).length,
        maxFiles,
        retentionDays
    };
}
function coerceBoolean(value) {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
        const v = value.trim().toLowerCase();
        if (v === "true" || v === "1") return true;
        if (v === "false" || v === "0") return false;
    }
    return null;
}
function parseStoredJson(value) {
    if (value === undefined) return undefined;
    try {
        return JSON.parse(value);
    } catch  {
        return value;
    }
}
function isAutoBackupDisabledBySetting() {
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const rows = db.prepare("SELECT namespace, key, value FROM key_value WHERE namespace IN (?, ?)").all("settings", "databaseSettings");
        // Candidate values by source, resolved regardless of DB row iteration order.
        // Precedence (lowest → highest, last wins), mirroring getUserDatabaseSettings():
        //   settings.databaseSettings.backup → settings.backup → databaseSettings namespace.
        let fromSettingsNested = null; // settings.databaseSettings.backup.autoBackupEnabled
        let fromSettingsBackup = null; // settings.backup.autoBackupEnabled
        let fromDbFlat = null; // databaseSettings namespace flat alias "autoBackupEnabled"
        let fromDbNested = null; // databaseSettings namespace nested "backup.autoBackupEnabled"
        for (const row of rows){
            const parsed = parseStoredJson(row.value);
            if (row.namespace === "settings") {
                if (row.key === "databaseSettings" && isPlainObject(parsed)) {
                    const backup = parsed.backup;
                    if (isPlainObject(backup)) {
                        const b = coerceBoolean(backup.autoBackupEnabled);
                        if (b !== null) fromSettingsNested = b;
                    }
                } else if (row.key === "backup" && isPlainObject(parsed)) {
                    const b = coerceBoolean(parsed.autoBackupEnabled);
                    if (b !== null) fromSettingsBackup = b;
                }
            } else if (row.namespace === "databaseSettings") {
                if (row.key === "autoBackupEnabled") {
                    const b = coerceBoolean(parsed);
                    if (b !== null) fromDbFlat = b;
                } else if (row.key === "backup.autoBackupEnabled") {
                    const b = coerceBoolean(parsed);
                    if (b !== null) fromDbNested = b;
                }
            }
        }
        // Apply precedence: last non-null wins (mirrors getUserDatabaseSettings — flat alias
        // first, then nested key). Default (no persisted value) → not disabled.
        let enabled = null;
        for (const candidate of [
            fromSettingsNested,
            fromSettingsBackup,
            fromDbFlat,
            fromDbNested
        ]){
            if (candidate !== null) enabled = candidate;
        }
        return enabled === false;
    } catch  {
        // If the setting cannot be read (e.g. DB not ready), do not block backups.
        return false;
    }
}
function isPlainObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isSqliteAutoBackupDisabled() {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isAutomatedTestProcess"])()) return true;
    const value = process.env.DISABLE_SQLITE_AUTO_BACKUP;
    if (!value) return false;
    return TRUE_ENV_VALUES.has(value.trim().toLowerCase());
}
function sleep(ms) {
    return new Promise((resolve)=>setTimeout(resolve, ms));
}
async function unlinkFileWithRetry(filePath, options) {
    const maxAttempts = Math.max(1, options?.maxAttempts ?? 10);
    const retryableCodes = new Set(options?.retryableCodes ?? [
        "EBUSY",
        "EPERM"
    ]);
    const baseDelayMs = Math.max(0, options?.baseDelayMs ?? 100);
    for(let attempt = 0; attempt < maxAttempts; attempt++){
        try {
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(filePath)) __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].unlinkSync(filePath);
            return;
        } catch (err) {
            const code = err && typeof err === "object" && "code" in err ? err.code : "";
            if (code === "ENOENT") return;
            if (retryableCodes.has(String(code)) && attempt < maxAttempts - 1) {
                await sleep(baseDelayMs * (attempt + 1));
            } else {
                throw err;
            }
        }
    }
}
function backupDbFile(reason = "auto") {
    try {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isBuildPhase"] || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"]) return null;
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SQLITE_FILE"] || !__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SQLITE_FILE"])) return null;
        if (reason !== "manual" && isSqliteAutoBackupDisabled()) return null;
        // #5871: honor the persisted `backup.autoBackupEnabled` dashboard toggle. Only
        // manual and pre-restore backups bypass this gate; automatic + pre-write safety
        // snapshots must stop firing once the operator disables auto-backup in the UI.
        if (reason !== "manual" && reason !== "pre-restore" && isAutoBackupDisabledBySetting()) return null;
        const stat = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].statSync(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SQLITE_FILE"]);
        if (stat.size < 4096) {
            console.warn(`[DB] Backup SKIPPED — DB too small (${stat.size}B)`);
            return null;
        }
        // Throttle
        const now = Date.now();
        if (reason !== "manual" && reason !== "pre-restore" && now - _lastBackupAt < BACKUP_THROTTLE_MS) return null;
        _lastBackupAt = now;
        const backupDir = getBackupDir();
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(backupDir)) __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(backupDir, {
            recursive: true
        });
        if (reason !== "manual" && reason !== "pre-restore") {
            // Shrink detection is useful for automatic safety backups, but it should
            // never block an explicit operator action like manual backup or pre-restore.
            const existingBackups = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readdirSync(backupDir).filter((f)=>f.startsWith("db_") && f.endsWith(".sqlite")).sort();
            if (existingBackups.length > 0) {
                const latestBackup = existingBackups[existingBackups.length - 1];
                const latestStat = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].statSync(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(backupDir, latestBackup));
                if (latestStat.size > 4096 && stat.size < latestStat.size * 0.5) {
                    console.warn(`[DB] Backup SKIPPED — DB shrank from ${latestStat.size}B to ${stat.size}B`);
                    return null;
                }
            }
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupFile = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(backupDir, `db_${timestamp}_${reason}.sqlite`);
        // Use native SQLite backup API for consistency
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        db.backup(backupFile).then(()=>{
            console.log(`[DB] Backup created: ${backupFile} (${stat.size} bytes)`);
            cleanupDbBackups();
        }).catch((err)=>{
            const message = err instanceof Error ? err.message : String(err);
            console.error("[DB] Backup failed:", message);
        });
        return {
            filename: __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].basename(backupFile),
            size: stat.size
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[DB] Backup failed:", message);
        return null;
    }
}
async function listDbBackups() {
    const backupDir = getBackupDir();
    try {
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(backupDir)) return [];
        const entries = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readdirSync(backupDir).filter((f)=>f.startsWith("db_") && f.endsWith(".sqlite")).sort().reverse();
        const { tryOpenSync } = await __turbopack_context__.A("[project]/src/lib/db/adapters/driverFactory.ts [instrumentation] (ecmascript, async loader)");
        return entries.map((filename)=>{
            const filePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(backupDir, filename);
            const stat = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].statSync(filePath);
            const match = filename.match(/^db_(.+?)_([^.]+)\.sqlite$/);
            const reason = match ? match[2] : "unknown";
            let connectionCount = 0;
            try {
                const backupDb = tryOpenSync(filePath, {
                    readonly: true
                });
                if (backupDb) {
                    try {
                        const row = backupDb.prepare("SELECT COUNT(*) as cnt FROM provider_connections").get();
                        connectionCount = Number(row?.cnt ?? 0);
                    } finally{
                        backupDb.close();
                    }
                }
            } catch  {
            /* ignore */ }
            return {
                id: filename,
                filename,
                createdAt: stat.mtime.toISOString(),
                size: stat.size,
                reason,
                connectionCount
            };
        });
    } catch  {
        return [];
    }
}
async function restoreDbBackup(backupId) {
    const backupDir = getBackupDir();
    // Validate format: must be db_<timestamp>_<reason>.sqlite, no path separators
    if (!backupId.startsWith("db_") || !backupId.endsWith(".sqlite") || backupId.includes(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].sep) || backupId.includes("/")) {
        throw new Error("Invalid backup ID");
    }
    const backupPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(backupDir, backupId);
    // Prevent path traversal: resolved path must stay within backupDir
    if (!backupPath.startsWith(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(backupDir) + __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].sep) && backupPath !== __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(backupDir)) {
        throw new Error("Invalid backup ID: path traversal detected");
    }
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(backupPath)) {
        throw new Error(`Backup not found: ${backupId}`);
    }
    // Validate backup integrity
    try {
        const { tryOpenSync } = await __turbopack_context__.A("[project]/src/lib/db/adapters/driverFactory.ts [instrumentation] (ecmascript, async loader)");
        const testDb = tryOpenSync(backupPath, {
            readonly: true
        });
        if (!testDb) {
            throw new Error("Backup file is corrupt: could not open");
        }
        let result;
        try {
            result = testDb.pragma("integrity_check");
        } finally{
            testDb.close();
        }
        if (result[0]?.integrity_check !== "ok") {
            throw new Error("Backup integrity check failed");
        }
    } catch (e) {
        if (e instanceof Error && e.message === "Backup integrity check failed") throw e;
        const message = e instanceof Error ? e.message : String(e);
        throw new Error(`Backup file is corrupt: ${message}`);
    }
    // Force pre-restore backup (bypass throttle) and await so the DB is not closed while backup runs
    if (!isSqliteAutoBackupDisabled()) {
        _lastBackupAt = 0;
        const backupDirForPre = getBackupDir();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SQLITE_FILE"] && __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SQLITE_FILE"])) {
            const stat = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].statSync(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SQLITE_FILE"]);
            if (stat.size >= 4096) {
                if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(backupDirForPre)) __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(backupDirForPre, {
                    recursive: true
                });
                const preBackupPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(backupDirForPre, `db_${new Date().toISOString().replace(/[:.]/g, "-")}_pre-restore.sqlite`);
                const dbForBackup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
                await dbForBackup.backup(preBackupPath);
                _lastBackupAt = Date.now();
            }
        }
    }
    // Close and reset current connection
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resetDbInstance"])();
    // Clear all cached prepared statements and other state bound to the old connection
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$stateReset$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resetAllDbModuleState"])();
    const sqliteFile = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SQLITE_FILE"];
    if (!sqliteFile) {
        throw new Error("SQLITE_FILE is unavailable in local backup restore");
    }
    // On Windows, the file handle may be released asynchronously after close; give it a moment.
    await sleep(500);
    // Remove main file and WAL sidecars to avoid stale frame replay after restore.
    // Retry unlink on EBUSY/EPERM (Windows may hold the handle briefly).
    const sqliteFilesToReplace = [
        sqliteFile,
        `${sqliteFile}-wal`,
        `${sqliteFile}-shm`,
        `${sqliteFile}-journal`
    ];
    for (const filePath of sqliteFilesToReplace){
        if (!filePath) continue;
        await unlinkFileWithRetry(filePath);
    }
    // Copy backup over current DB
    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].copyFileSync(backupPath, sqliteFile);
    // Reopen
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const connCount = db.prepare("SELECT COUNT(*) as cnt FROM provider_connections").get()?.cnt || 0;
    const nodeCount = db.prepare("SELECT COUNT(*) as cnt FROM provider_nodes").get()?.cnt || 0;
    const comboCount = db.prepare("SELECT COUNT(*) as cnt FROM combos").get()?.cnt || 0;
    const keyCount = db.prepare("SELECT COUNT(*) as cnt FROM api_keys").get()?.cnt || 0;
    console.log(`[DB] Restored backup: ${backupId} (${connCount} connections)`);
    return {
        restored: true,
        backupId,
        connectionCount: connCount,
        nodeCount,
        comboCount,
        apiKeyCount: keyCount
    };
}
function exportAllSummaryRows() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const settings = {};
    try {
        const rows = db.prepare("SELECT key, value FROM key_value").all();
        for (const row of rows){
            settings[row.key] = row.value;
        }
    } catch  {
    // key_value table might not exist
    }
    const combos = [];
    try {
        combos.push(...db.prepare("SELECT * FROM combos").all());
    } catch  {
    // combos table might not exist
    }
    const providers = [];
    try {
        providers.push(...db.prepare("SELECT id, provider, name, auth_type, is_active, email, created_at FROM provider_connections").all());
    } catch  {
    // provider_connections table might not exist
    }
    const apiKeys = [];
    try {
        apiKeys.push(...db.prepare("SELECT id, name, substr(key, 1, 8) as prefix, machine_id, created_at FROM api_keys").all());
    } catch  {
    // api_keys table might not exist
    }
    const reasoningRoutingRules = [];
    try {
        reasoningRoutingRules.push(...db.prepare("SELECT * FROM reasoning_routing_rules").all());
    } catch  {
    // reasoning_routing_rules table might not exist in an older backup
    }
    return {
        settings,
        combos,
        providers,
        apiKeys,
        reasoningRoutingRules
    };
}
function getTableNamesFromAdapter(adapter) {
    const rows = adapter.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    return rows.map((r)=>r.name);
}
function countImportedRows() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const connCount = db.prepare("SELECT COUNT(*) as cnt FROM provider_connections").get()?.cnt || 0;
    const nodeCount = db.prepare("SELECT COUNT(*) as cnt FROM provider_nodes").get()?.cnt || 0;
    const comboCount = db.prepare("SELECT COUNT(*) as cnt FROM combos").get()?.cnt || 0;
    const keyCount = db.prepare("SELECT COUNT(*) as cnt FROM api_keys").get()?.cnt || 0;
    return {
        connCount,
        nodeCount,
        comboCount,
        keyCount
    };
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
"[project]/src/lib/db/modelContextOverrides.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getModelContextOverride",
    ()=>getModelContextOverride,
    "getModelContextOverrideRecord",
    ()=>getModelContextOverrideRecord,
    "listModelContextOverrides",
    ()=>listModelContextOverrides,
    "removeModelContextOverride",
    ()=>removeModelContextOverride,
    "setModelContextOverride",
    ()=>setModelContextOverride
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
;
;
function isPositiveInteger(value) {
    return typeof value === "number" && Number.isInteger(value) && value > 0;
}
function normalizeKey(provider, modelId) {
    const p = typeof provider === "string" ? provider.trim() : "";
    const m = typeof modelId === "string" ? modelId.trim() : "";
    if (!p || !m) return null;
    return {
        provider: p,
        modelId: m
    };
}
function toOverride(row) {
    return {
        provider: row.provider,
        modelId: row.model_id,
        realContext: row.real_context,
        source: row.source === "auto:discovery" ? "auto:discovery" : "manual",
        refreshedAt: row.refreshed_at
    };
}
function getModelContextOverrideRecord(provider, modelId) {
    const key = normalizeKey(provider, modelId);
    if (!key) return null;
    try {
        const row = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("SELECT provider, model_id, real_context, source, refreshed_at " + "FROM model_context_overrides WHERE provider = ? AND model_id = ?").get(key.provider, key.modelId);
        return row ? toOverride(row) : null;
    } catch  {
        // Table may not exist yet (pre-migration) — fall through to the catalog.
        return null;
    }
}
function getModelContextOverride(provider, modelId) {
    const record = getModelContextOverrideRecord(provider, modelId);
    return record ? record.realContext : null;
}
function setModelContextOverride(provider, modelId, realContext, source = "manual") {
    const key = normalizeKey(provider, modelId);
    if (!key || !isPositiveInteger(realContext)) return false;
    const normalizedSource = source === "auto:discovery" ? "auto:discovery" : "manual";
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("INSERT OR REPLACE INTO model_context_overrides " + "(provider, model_id, real_context, source, refreshed_at) " + "VALUES (?, ?, ?, ?, datetime('now'))").run(key.provider, key.modelId, realContext, normalizedSource);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("model-capabilities");
    return true;
}
function removeModelContextOverride(provider, modelId) {
    const key = normalizeKey(provider, modelId);
    if (!key) return false;
    const info = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("DELETE FROM model_context_overrides WHERE provider = ? AND model_id = ?").run(key.provider, key.modelId);
    if (info.changes > 0) (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("model-capabilities");
    return info.changes > 0;
}
function listModelContextOverrides() {
    try {
        const rows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("SELECT provider, model_id, real_context, source, refreshed_at " + "FROM model_context_overrides ORDER BY refreshed_at DESC").all();
        return rows.map(toOverride);
    } catch  {
        return [];
    }
}
}),
"[project]/src/lib/db/modelCapabilityOverrides.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getModelCapabilityOverride",
    ()=>getModelCapabilityOverride,
    "listModelCapabilityOverrides",
    ()=>listModelCapabilityOverrides,
    "parseModelOverrideTarget",
    ()=>parseModelOverrideTarget,
    "removeModelCapabilityOverride",
    ()=>removeModelCapabilityOverride,
    "setModelCapabilityOverride",
    ()=>setModelCapabilityOverride
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
;
;
function isSupportedKey(value) {
    return value === "max_input_tokens" || value === "max_output_tokens";
}
function isPositiveInteger(value) {
    return typeof value === "number" && Number.isInteger(value) && value > 0;
}
function parseModelOverrideTarget(target) {
    const raw = typeof target === "string" ? target.trim() : "";
    const slashIndex = raw.indexOf("/");
    if (slashIndex <= 0 || slashIndex === raw.length - 1) return null;
    const provider = raw.slice(0, slashIndex).trim();
    const modelId = raw.slice(slashIndex + 1).trim();
    if (!provider || !modelId) return null;
    return {
        provider,
        modelId
    };
}
function toOverride(row) {
    if (!isSupportedKey(row.override_key)) return null;
    let parsedValue;
    try {
        parsedValue = JSON.parse(row.override_value);
    } catch  {
        return null;
    }
    if (!isPositiveInteger(parsedValue)) return null;
    return {
        provider: row.provider,
        modelId: row.model_id,
        target: `${row.provider}/${row.model_id}`,
        key: row.override_key,
        value: parsedValue,
        refreshedAt: row.refreshed_at
    };
}
function getModelCapabilityOverride(provider, modelId, key) {
    const target = parseModelOverrideTarget(`${provider || ""}/${modelId || ""}`);
    if (!target || !isSupportedKey(key)) return null;
    try {
        const row = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("SELECT provider, model_id, override_key, override_value, refreshed_at " + "FROM model_capability_overrides WHERE provider = ? AND model_id = ? AND override_key = ?").get(target.provider, target.modelId, key);
        const override = row ? toOverride(row) : null;
        return override?.value ?? null;
    } catch  {
        return null;
    }
}
function setModelCapabilityOverride(target, key, value) {
    const parsedTarget = parseModelOverrideTarget(target);
    if (!parsedTarget || !isSupportedKey(key) || !isPositiveInteger(value)) return false;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("INSERT OR REPLACE INTO model_capability_overrides " + "(provider, model_id, override_key, override_value, refreshed_at) " + "VALUES (?, ?, ?, ?, datetime('now'))").run(parsedTarget.provider, parsedTarget.modelId, key, JSON.stringify(value));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("model-capabilities");
    return true;
}
function removeModelCapabilityOverride(target, key) {
    const parsedTarget = parseModelOverrideTarget(target);
    if (!parsedTarget || !isSupportedKey(key)) return false;
    const info = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("DELETE FROM model_capability_overrides " + "WHERE provider = ? AND model_id = ? AND override_key = ?").run(parsedTarget.provider, parsedTarget.modelId, key);
    if (info.changes > 0) (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("model-capabilities");
    return info.changes > 0;
}
function listModelCapabilityOverrides() {
    try {
        const rows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("SELECT provider, model_id, override_key, override_value, refreshed_at " + "FROM model_capability_overrides ORDER BY refreshed_at DESC").all();
        return rows.map(toOverride).filter((entry)=>entry !== null);
    } catch  {
        return [];
    }
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
"[project]/src/lib/db/providers/lazyConnectionView.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/encryption.ts [instrumentation] (ecmascript)");
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
                apiKey: toStringOrNull((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["decrypt"])(base.apiKey)),
                accessToken: toStringOrNull((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["decrypt"])(base.accessToken)),
                refreshToken: toStringOrNull((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["decrypt"])(base.refreshToken))
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
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["decrypt"])(value);
}
}),
"[project]/src/lib/db/reasoningRoutingRules.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$stateReset$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/stateReset.ts [instrumentation] (ecmascript)");
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
    return Boolean((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare(`SELECT 1 FROM ${table} WHERE id = ?`).get(id));
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
        const rows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("SELECT * FROM reasoning_routing_rules ORDER BY priority DESC, created_at ASC, id ASC").all();
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
    const row = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("SELECT * FROM reasoning_routing_rules WHERE id = ?").get(id);
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare(`INSERT INTO reasoning_routing_rules (
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare(`UPDATE reasoning_routing_rules SET
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
    const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("DELETE FROM reasoning_routing_rules WHERE id = ?").run(id);
    if ((result.changes ?? 0) > 0) invalidate();
    return (result.changes ?? 0) > 0;
}
function invalidateReasoningRoutingRuleCache() {
    invalidate();
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$stateReset$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["registerDbStateResetter"])(invalidateReasoningRoutingRuleCache);
}),
"[project]/src/lib/db/proxies/mappers.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "coerceProxyPayload",
    ()=>coerceProxyPayload,
    "extractRelayAuth",
    ()=>extractRelayAuth,
    "isRelayAuthMissing",
    ()=>isRelayAuthMissing,
    "isRelayProxyType",
    ()=>isRelayProxyType,
    "mapAssignmentRow",
    ()=>mapAssignmentRow,
    "mapProxyRow",
    ()=>mapProxyRow,
    "normalizeAssignmentScopeId",
    ()=>normalizeAssignmentScopeId,
    "normalizeScope",
    ()=>normalizeScope,
    "redactProxySecrets",
    ()=>redactProxySecrets,
    "relayRepairMode",
    ()=>relayRepairMode,
    "toLegacyProxyLevel",
    ()=>toLegacyProxyLevel,
    "toRecord",
    ()=>toRecord,
    "toRegistryProxyResolution",
    ()=>toRegistryProxyResolution
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/encryption.ts [instrumentation] (ecmascript)");
;
function toRecord(value) {
    return value && typeof value === "object" ? value : {};
}
function mapProxyRow(row) {
    const r = toRecord(row);
    return {
        id: typeof r.id === "string" ? r.id : "",
        name: typeof r.name === "string" ? r.name : "",
        type: typeof r.type === "string" ? r.type : "http",
        host: typeof r.host === "string" ? r.host : "",
        port: Number(r.port) || 0,
        username: typeof r.username === "string" ? r.username : "",
        password: typeof r.password === "string" ? r.password : "",
        region: typeof r.region === "string" ? r.region : null,
        notes: typeof r.notes === "string" ? r.notes : null,
        status: typeof r.status === "string" ? r.status : "active",
        source: typeof r.source === "string" ? r.source : "manual",
        family: typeof r.family === "string" ? r.family : "auto",
        subscriptionId: typeof r.subscription_id === "string" ? r.subscription_id : null,
        createdAt: typeof r.created_at === "string" ? r.created_at : "",
        updatedAt: typeof r.updated_at === "string" ? r.updated_at : ""
    };
}
function mapAssignmentRow(row) {
    const r = toRecord(row);
    const scope = typeof r.scope === "string" ? r.scope : "global";
    const rawScopeId = typeof r.scope_id === "string" ? r.scope_id : null;
    return {
        id: Number(r.id) || 0,
        proxyId: typeof r.proxy_id === "string" ? r.proxy_id : "",
        scope,
        scopeId: scope === "global" && rawScopeId === "__global__" ? null : rawScopeId,
        position: Number(r.position) || 0,
        createdAt: typeof r.created_at === "string" ? r.created_at : "",
        updatedAt: typeof r.updated_at === "string" ? r.updated_at : ""
    };
}
// Edge-relay proxy types. Mirrors RELAY_TYPES in open-sse/utils/proxyDispatcher.
// Duplicated here (not imported) to keep src/lib/db/ free of open-sse runtime
// imports; if a third relay backend lands, update BOTH sets.
const RELAY_PROXY_TYPES = new Set([
    "vercel",
    "deno",
    "cloudflare"
]);
function isRelayProxyType(type) {
    return typeof type === "string" && RELAY_PROXY_TYPES.has(type);
}
function extractRelayAuth(notes) {
    if (typeof notes !== "string") return undefined;
    try {
        const parsed = JSON.parse(notes);
        // Prefer the encrypted form when both are present (legacy plaintext rows
        // are still readable until migrated). decrypt() is a no-op when encryption
        // is disabled, matching the existing convention for webhook secrets.
        if (parsed.relayAuthEnc) {
            const dec = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["decrypt"])(parsed.relayAuthEnc);
            if (dec) return dec;
            // decrypt returned null despite a present blob — warn so operators
            // know the key changed or went missing. The plaintext fallback below
            // may still save us (legacy rows that never migrated).
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["looksEncrypted"])(parsed.relayAuthEnc)) {
                console.warn(`[relay] Failed to decrypt relayAuthEnc for proxy — ` + `STORAGE_ENCRYPTION_KEY may have changed or been unset`);
            }
        }
        return parsed.relayAuth || undefined;
    } catch  {
        return undefined;
    }
}
function isRelayAuthMissing(notes, type) {
    return isRelayProxyType(type) && extractRelayAuth(notes) === undefined;
}
function relayRepairMode(notes, type) {
    if (!isRelayProxyType(type)) return null;
    // Plaintext relayAuth already in place: nothing to do.
    const parsed = safeParseNotes(notes);
    if (typeof parsed?.relayAuth === "string" && parsed.relayAuth) return "noop";
    // Encrypted blob present and still decryptable: re-derive plaintext in place.
    if (typeof parsed?.relayAuthEnc === "string" && parsed.relayAuthEnc && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["decrypt"])(parsed.relayAuthEnc)) {
        return "recovered";
    }
    // Neither recoverable: the deploy token (never persisted) is lost → redeploy.
    return "redeploy";
}
function safeParseNotes(notes) {
    if (typeof notes !== "string") return null;
    try {
        const parsed = JSON.parse(notes);
        return parsed && typeof parsed === "object" ? parsed : null;
    } catch  {
        return null;
    }
}
function toRegistryProxyResolution(row, level, levelId) {
    const record = toRecord(row);
    const relayAuth = isRelayProxyType(record.type) ? extractRelayAuth(record.notes) : undefined;
    return {
        proxy: {
            type: record.type,
            host: record.host,
            port: record.port,
            username: record.username,
            password: record.password,
            family: typeof record.family === "string" ? record.family : "auto",
            ...relayAuth !== undefined ? {
                relayAuth
            } : {}
        },
        level,
        levelId,
        source: "registry"
    };
}
function normalizeScope(scope) {
    const value = String(scope || "").toLowerCase();
    if (value === "key") return "account";
    if (value === "provider") return "provider";
    if (value === "account") return "account";
    if (value === "combo") return "combo";
    return "global";
}
function normalizeAssignmentScopeId(scope, scopeId) {
    return scope === "global" ? "__global__" : scopeId || null;
}
function toLegacyProxyLevel(scope) {
    return scope === "account" ? "key" : scope;
}
function coerceProxyPayload(value, fallbackName) {
    if (!value) return null;
    if (typeof value === "string") {
        try {
            const parsed = new URL(value);
            return {
                name: fallbackName,
                type: parsed.protocol.replace(":", "") || "http",
                host: parsed.hostname,
                port: Number(parsed.port || (parsed.protocol === "https:" ? "443" : "8080")),
                username: parsed.username ? decodeURIComponent(parsed.username) : "",
                password: parsed.password ? decodeURIComponent(parsed.password) : "",
                status: "active"
            };
        } catch  {
            return null;
        }
    }
    if (typeof value !== "object" || Array.isArray(value)) return null;
    const record = toRecord(value);
    const host = typeof record.host === "string" ? record.host.trim() : "";
    if (!host) return null;
    const port = Number(record.port) || 8080;
    return {
        name: fallbackName,
        type: typeof record.type === "string" ? record.type : "http",
        host,
        port,
        username: typeof record.username === "string" ? record.username : "",
        password: typeof record.password === "string" ? record.password : "",
        status: "active"
    };
}
function redactProxySecrets(proxy) {
    let redactedNotes = proxy.notes;
    if (isRelayProxyType(proxy.type) && proxy.notes) {
        try {
            const parsed = JSON.parse(proxy.notes);
            if (parsed && typeof parsed === "object") {
                const next = {
                    ...parsed
                };
                let touched = false;
                if ("relayAuth" in next) {
                    next.relayAuth = "***";
                    touched = true;
                }
                if ("relayAuthEnc" in next) {
                    next.relayAuthEnc = "***";
                    touched = true;
                }
                if (touched) {
                    redactedNotes = JSON.stringify(next);
                }
            }
        } catch  {
        // Non-JSON notes pass through unchanged
        }
    }
    return {
        ...proxy,
        username: proxy.username ? "***" : "",
        password: proxy.password ? "***" : "",
        notes: redactedNotes
    };
}
}),
"[project]/src/lib/db/proxies/guards.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PROXY_ALIVE_PREDICATE",
    ()=>PROXY_ALIVE_PREDICATE,
    "hasBlockingProxyAssignment",
    ()=>hasBlockingProxyAssignment,
    "hasBlockingProxyAssignmentForProvider",
    ()=>hasBlockingProxyAssignmentForProvider,
    "isGlobalProxyEnabled",
    ()=>isGlobalProxyEnabled
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
;
const PROXY_ALIVE_PREDICATE = "(p.status IS NULL OR LOWER(p.status) NOT IN ('inactive','error','disabled','dead','down'))";
function isGlobalProxyEnabled(db) {
    try {
        const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'settings' AND key = 'proxyEnabled'").get();
        if (!row?.value) return true;
        try {
            return JSON.parse(row.value) !== false;
        } catch  {
            return true;
        }
    } catch  {
        return true;
    }
}
function hasBlockingProxyAssignment(connectionId, providerId) {
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        if (!isGlobalProxyEnabled(db)) return false;
        const conn = db.prepare("SELECT provider, proxy_enabled FROM provider_connections WHERE id = ?").get(connectionId);
        if (conn && conn.proxy_enabled === 0) return false;
        const provider = conn?.provider ?? providerId ?? null;
        const dead = db.prepare(`SELECT 1 FROM proxy_assignments a JOIN proxy_registry p ON p.id = a.proxy_id
           WHERE ((a.scope = 'account' AND a.scope_id = ?)
               OR (a.scope = 'provider' AND a.scope_id = ?)
               OR (a.scope = 'global'))
             AND NOT ${PROXY_ALIVE_PREDICATE}
           LIMIT 1`).get(connectionId, provider);
        return !!dead;
    } catch  {
        return false;
    }
}
function hasBlockingProxyAssignmentForProvider(providerId) {
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        if (!isGlobalProxyEnabled(db)) return false;
        const assignments = db.prepare(`SELECT
           EXISTS(
             SELECT 1 FROM proxy_assignments a
             WHERE ((a.scope = 'provider' AND a.scope_id = ?)
                 OR a.scope = 'global')
           ) AS assigned,
           EXISTS(
             SELECT 1 FROM proxy_assignments a JOIN proxy_registry p ON p.id = a.proxy_id
             WHERE ((a.scope = 'provider' AND a.scope_id = ?)
                 OR a.scope = 'global')
               AND ${PROXY_ALIVE_PREDICATE}
           ) AS alive`).get(providerId, providerId);
        return assignments?.assigned === 1 && assignments.alive === 0;
    } catch  {
        return false;
    }
}
}),
"[project]/src/lib/db/proxies/registryGeneration.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "bumpProxyRegistryGeneration",
    ()=>bumpProxyRegistryGeneration,
    "getProxyRegistryGeneration",
    ()=>getProxyRegistryGeneration
]);
// Shared registry-generation counter for the proxy registry. Split out so both
// `proxies.ts` and `proxySubscriptions.ts` can bump/read it without a cyclic
// import between the two sibling modules.
let proxyRegistryGeneration = 0;
function bumpProxyRegistryGeneration() {
    proxyRegistryGeneration++;
}
function getProxyRegistryGeneration() {
    return proxyRegistryGeneration;
}
}),
"[project]/src/lib/db/proxySubscriptions.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addProxiesToScopePool",
    ()=>addProxiesToScopePool
]);
// Proxy-subscription-specific pool operations, split out of `proxies.ts` to keep
// that module under its frozen size cap. Re-exported from `proxies.ts` so callers
// (subscriptionService.ts et al.) can keep importing from the original module.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/proxies/mappers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$registryGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/proxies/registryGeneration.ts [instrumentation] (ecmascript)");
;
;
;
;
async function addProxiesToScopePool(scope, scopeId, proxyIds) {
    const normalizedScope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeScope"])(scope);
    const normalizedScopeId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeAssignmentScopeId"])(normalizedScope, scopeId);
    if (normalizedScope !== "global" && !normalizedScopeId) {
        throw new Error("scopeId is required for non-global proxy assignments");
    }
    const unique = [
        ...new Set((proxyIds || []).filter(Boolean))
    ];
    if (unique.length === 0) return 0;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const maxRow = db.prepare("SELECT MAX(position) AS maxPos FROM proxy_assignments WHERE scope = ? AND scope_id IS ?").get(normalizedScope, normalizedScopeId);
    const base = maxRow && typeof maxRow.maxPos === "number" ? maxRow.maxPos + 1 : 0;
    const now = new Date().toISOString();
    const exists = db.prepare("SELECT 1 FROM proxy_assignments WHERE scope = ? AND scope_id IS ? AND proxy_id = ? LIMIT 1");
    const insert = db.prepare(`INSERT INTO proxy_assignments (proxy_id, scope, scope_id, position, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`);
    let added = 0;
    unique.forEach((pid, i)=>{
        if (!exists.get(normalizedScope, normalizedScopeId, pid)) {
            insert.run(pid, normalizedScope, normalizedScopeId, base + i, now, now);
            added++;
        }
    });
    if (added > 0) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$registryGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["bumpProxyRegistryGeneration"])();
    }
    return added;
}
}),
"[project]/src/lib/db/proxyLatency.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Latency-based proxy rotation strategy: picks the candidate with the lowest
// average latency observed in `proxy_logs` over a trailing window. Extracted
// from proxies.ts to keep that frozen god-file under its line-count cap
// (imported directly by src/lib/db/proxies.ts, anti-barrel, #6798).
__turbopack_context__.s([
    "pickByLatency",
    ()=>pickByLatency
]);
const PROXY_LATENCY_WINDOW_HOURS = parseInt(process.env.PROXY_LATENCY_WINDOW_HOURS ?? "3", 10);
// Builds a `"host:port" -> avg_latency_ms` map from proxy_logs rows recorded
// within the trailing PROXY_LATENCY_WINDOW_HOURS window.
function buildLatencyMap(db) {
    const sinceIso = new Date(Date.now() - PROXY_LATENCY_WINDOW_HOURS * 60 * 60 * 1000).toISOString();
    const latencyRows = db.prepare(`SELECT proxy_host, proxy_port, AVG(latency_ms) as avg_latency
       FROM proxy_logs
       WHERE timestamp >= ?
       GROUP BY proxy_host, proxy_port`).all(sinceIso);
    const latencyMap = new Map();
    for (const r of latencyRows){
        if (r.avg_latency !== null && r.avg_latency !== undefined) {
            latencyMap.set(`${r.proxy_host}:${r.proxy_port}`, r.avg_latency);
        }
    }
    return latencyMap;
}
function pickByLatency(db, candidates) {
    const latencyMap = buildLatencyMap(db);
    const sorted = [
        ...candidates
    ].sort((a, b)=>{
        const pA = a;
        const pB = b;
        const keyA = `${pA.host}:${pA.port}`;
        const keyB = `${pB.host}:${pB.port}`;
        const latA = latencyMap.has(keyA) ? latencyMap.get(keyA) : -1;
        const latB = latencyMap.has(keyB) ? latencyMap.get(keyB) : -1;
        return latA - latB;
    });
    return sorted[0];
}
}),
"[project]/src/lib/db/proxies/types.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_PROXY_ROTATION_STRATEGY",
    ()=>DEFAULT_PROXY_ROTATION_STRATEGY,
    "PROXY_ROTATION_STRATEGIES",
    ()=>PROXY_ROTATION_STRATEGIES
]);
const PROXY_ROTATION_STRATEGIES = [
    "round-robin",
    "random",
    "sticky",
    "latency"
];
const DEFAULT_PROXY_ROTATION_STRATEGY = "round-robin";
}),
"[project]/src/lib/db/proxies/rotation.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PROXY_ALIVE_PREDICATE",
    ()=>PROXY_ALIVE_PREDICATE,
    "clearRotationState",
    ()=>clearRotationState,
    "getScopeProxyPool",
    ()=>getScopeProxyPool,
    "getScopeRotationStrategy",
    ()=>getScopeRotationStrategy,
    "normalizeRotationScopeId",
    ()=>normalizeRotationScopeId,
    "normalizeRotationStrategy",
    ()=>normalizeRotationStrategy,
    "resetRotationCursor",
    ()=>resetRotationCursor,
    "resolveProxyForConnectionFromRegistry",
    ()=>resolveProxyForConnectionFromRegistry,
    "resolveProxyForScopeFromRegistry",
    ()=>resolveProxyForScopeFromRegistry
]);
// Proxy scope pool rotation & alive-pool resolution (#6365).
//
// Extracted from ../proxies.ts (#7046 file-size follow-up): this module holds the
// rotation-strategy bookkeeping (cursor persistence, strategy normalization) and the
// read-only alive-pool resolution used by the registry proxy resolvers. It has no
// dependency back on ../proxies.ts — mutators that also need to bump the registry
// generation counter (addProxyToScopePool, removeProxyFromScopePool,
// setScopeRotationStrategy) stay in ../proxies.ts and import the pure helpers here.
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxyLatency$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/proxyLatency.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$types$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/proxies/types.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/proxies/mappers.ts [instrumentation] (ecmascript)");
;
;
;
;
;
function normalizeRotationScopeId(scope, scopeId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeAssignmentScopeId"])(scope, scopeId) ?? "";
}
function clearRotationState(db, scope, normalizedScopeId) {
    db.prepare("DELETE FROM proxy_scope_rotation WHERE scope = ? AND scope_id IS ?").run(scope, normalizedScopeId ?? "");
}
function resetRotationCursor(db, scope, normalizedScopeId) {
    db.prepare("UPDATE proxy_scope_rotation SET cursor = 0, rotated_at = NULL, updated_at = ? WHERE scope = ? AND scope_id IS ?").run(new Date().toISOString(), scope, normalizedScopeId ?? "");
}
function normalizeRotationStrategy(strategy) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$types$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROXY_ROTATION_STRATEGIES"].includes(strategy) ? strategy : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$types$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_PROXY_ROTATION_STRATEGY"];
}
async function getScopeProxyPool(scope, scopeId) {
    const normalizedScope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeScope"])(scope);
    const normalizedScopeId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeAssignmentScopeId"])(normalizedScope, scopeId);
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    return db.prepare("SELECT id, proxy_id, scope, scope_id, position, created_at, updated_at FROM proxy_assignments WHERE scope = ? AND scope_id IS ? ORDER BY position ASC, datetime(created_at) ASC, id ASC").all(normalizedScope, normalizedScopeId).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mapAssignmentRow"]);
}
async function getScopeRotationStrategy(scope, scopeId) {
    const normalizedScope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeScope"])(scope);
    const rotationScopeId = normalizeRotationScopeId(normalizedScope, scopeId);
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT strategy FROM proxy_scope_rotation WHERE scope = ? AND scope_id IS ?").get(normalizedScope, rotationScopeId);
    return normalizeRotationStrategy(row?.strategy);
}
// Read the rotation row for a scope, creating a default one lazily so the
// round-robin cursor has somewhere to live. Best-effort: any write failure leaves
// the caller on the default strategy with an ephemeral cursor.
function getOrCreateRotationRow(db, normalizedScope, rotationScopeId) {
    const row = db.prepare("SELECT strategy, cursor, sticky_window_minutes, rotated_at FROM proxy_scope_rotation WHERE scope = ? AND scope_id IS ?").get(normalizedScope, rotationScopeId);
    if (row) {
        return {
            strategy: normalizeRotationStrategy(row.strategy),
            cursor: Number(row.cursor) || 0,
            stickyWindowMinutes: Number(row.sticky_window_minutes) || 30,
            rotatedAt: typeof row.rotated_at === "string" ? row.rotated_at : null
        };
    }
    const now = new Date().toISOString();
    db.prepare("INSERT OR IGNORE INTO proxy_scope_rotation (scope, scope_id, strategy, cursor, updated_at) VALUES (?, ?, ?, 0, ?)").run(normalizedScope, rotationScopeId, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$types$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_PROXY_ROTATION_STRATEGY"], now);
    return {
        strategy: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$types$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_PROXY_ROTATION_STRATEGY"],
        cursor: 0,
        stickyWindowMinutes: 30,
        rotatedAt: null
    };
}
/**
 * Pick one member from an already-alive candidate list according to the scope's
 * rotation strategy. Assumes `candidates` is non-empty and ordered by position.
 * Round-robin uses (and persists) a monotonic cursor; random uses crypto.randomInt;
 * sticky holds the current member until its window elapses, then advances.
 */ function pickFromCandidates(db, normalizedScope, rotationScopeId, candidates) {
    if (candidates.length === 1) return candidates[0];
    const state = getOrCreateRotationRow(db, normalizedScope, rotationScopeId);
    if (state.strategy === "random") {
        // crypto.randomInt (unbiased, uniform in [0, length)) instead of Math.random —
        // CodeQL js/insecure-randomness flags Math.random flowing into the selected proxy's
        // credentials (a "security context"). Load-balancing selection is not a secret, but
        // crypto.randomInt silences the alert at the source and is unbiased (#6365 follow-up).
        return candidates[(0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomInt"])(candidates.length)];
    }
    if (state.strategy === "latency") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxyLatency$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["pickByLatency"])(db, candidates);
    if (state.strategy === "sticky") {
        const windowMs = state.stickyWindowMinutes * 60_000;
        const lastRotated = state.rotatedAt ? Date.parse(state.rotatedAt) : NaN;
        const expired = !Number.isFinite(lastRotated) || Date.now() - lastRotated >= windowMs;
        let cursor = state.cursor;
        if (expired) {
            cursor = state.cursor + 1;
            db.prepare("UPDATE proxy_scope_rotation SET cursor = ?, rotated_at = ?, updated_at = ? WHERE scope = ? AND scope_id IS ?").run(cursor, new Date().toISOString(), new Date().toISOString(), normalizedScope, rotationScopeId);
        }
        const idx = (cursor % candidates.length + candidates.length) % candidates.length;
        return candidates[idx];
    }
    // round-robin (default): pick at the current cursor, then advance it monotonically.
    const idx = (state.cursor % candidates.length + candidates.length) % candidates.length;
    db.prepare("UPDATE proxy_scope_rotation SET cursor = ?, updated_at = ? WHERE scope = ? AND scope_id IS ?").run(state.cursor + 1, new Date().toISOString(), normalizedScope, rotationScopeId);
    return candidates[idx];
}
// Fetch the alive, position-ordered candidate rows for a (scope, scope_id) pool.
// `scope_id` is matched with `IS` (NULL-safe); pass the query-level scope_id
// (connection id / provider / '__global__' / combo id) — global callers pass null
// to match the historical "any global row" behavior.
function fetchAlivePoolRows(db, scope, scopeIdFilter, matchAnyScopeId) {
    const baseSelect = "SELECT p.id, p.type, p.host, p.port, p.username, p.password, p.notes, p.family, a.position AS __pos, a.id AS __aid " + "FROM proxy_assignments a JOIN proxy_registry p ON p.id = a.proxy_id WHERE a.scope = ? ";
    const order = " ORDER BY a.position ASC, a.id ASC";
    if (matchAnyScopeId) {
        return db.prepare(`${baseSelect}AND ${PROXY_ALIVE_PREDICATE}${order}`).all(scope);
    }
    return db.prepare(`${baseSelect}AND a.scope_id IS ? AND ${PROXY_ALIVE_PREDICATE}${order}`).all(scope, scopeIdFilter);
}
const PROXY_ALIVE_PREDICATE = "(p.status IS NULL OR LOWER(p.status) NOT IN ('inactive','error','disabled','dead','down'))";
// Resolve one scope's alive pool to a single proxy via its rotation strategy.
// Returns the standard registry resolution shape, or null when the pool is empty
// or every member is dead (preserving the #6246 fail-closed contract — a dead
// pool never falls through to direct egress; the caller's guard blocks it).
function resolveScopePoolInternal(db, scope, levelId, options) {
    const rows = fetchAlivePoolRows(db, scope, options.scopeIdFilter ?? null, options.matchAnyScopeId === true);
    if (rows.length === 0) return null;
    const picked = pickFromCandidates(db, scope, options.rotationScopeId, rows);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRegistryProxyResolution"])(picked, scope, levelId);
}
async function resolveProxyForConnectionFromRegistry(connectionId) {
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const account = resolveScopePoolInternal(db, "account", connectionId, {
            rotationScopeId: connectionId,
            scopeIdFilter: connectionId
        });
        if (account) return account;
        const connection = db.prepare("SELECT provider FROM provider_connections WHERE id = ?").get(connectionId);
        if (connection?.provider) {
            const provider = resolveScopePoolInternal(db, "provider", connection.provider, {
                rotationScopeId: connection.provider,
                scopeIdFilter: connection.provider
            });
            if (provider) return provider;
        }
        const global = resolveScopePoolInternal(db, "global", null, {
            rotationScopeId: normalizeRotationScopeId("global", null),
            matchAnyScopeId: true
        });
        if (global) return global;
        return null;
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes("no such table")) return null;
        throw error;
    }
}
async function resolveProxyForScopeFromRegistry(scope, scopeId) {
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const normalizedScope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeScope"])(scope);
        if (normalizedScope === "global") {
            return resolveScopePoolInternal(db, "global", null, {
                rotationScopeId: normalizeRotationScopeId("global", null),
                matchAnyScopeId: true
            });
        }
        const normalizedScopeId = scopeId || null;
        if (!normalizedScopeId) return null;
        return resolveScopePoolInternal(db, normalizedScope, normalizedScopeId, {
            rotationScopeId: normalizeRotationScopeId(normalizedScope, normalizedScopeId),
            scopeIdFilter: normalizedScopeId
        });
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes("no such table")) return null;
        throw error;
    }
}
}),
"[project]/src/lib/db/proxies.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addProxyToScopePool",
    ()=>addProxyToScopePool,
    "assignProxyToScope",
    ()=>assignProxyToScope,
    "bulkAssignProxyToScope",
    ()=>bulkAssignProxyToScope,
    "createProxy",
    ()=>createProxy,
    "createProxyAndAssign",
    ()=>createProxyAndAssign,
    "deleteProxyById",
    ()=>deleteProxyById,
    "getProxyAssignments",
    ()=>getProxyAssignments,
    "getProxyById",
    ()=>getProxyById,
    "getProxyHealthStats",
    ()=>getProxyHealthStats,
    "getProxyWhereUsed",
    ()=>getProxyWhereUsed,
    "listProxies",
    ()=>listProxies,
    "migrateLegacyProxyConfigToRegistry",
    ()=>migrateLegacyProxyConfigToRegistry,
    "removeProxyFromScopePool",
    ()=>removeProxyFromScopePool,
    "resolveProxyForProvider",
    ()=>resolveProxyForProvider,
    "setScopeRotationStrategy",
    ()=>setScopeRotationStrategy,
    "updateProxy",
    ()=>updateProxy,
    "updateProxyAndAssign",
    ()=>updateProxyAndAssign,
    "upsertProxy",
    ()=>upsertProxy
]);
// Convention: when type is a relay (vercel | deno | cloudflare), the `notes` column stores JSON
// { relayAuth: "<token>" } used by proxyFetch.ts to route requests through the relay edge function
// (Vercel Edge, Deno Deploy, or Cloudflare Workers) instead of an undici ProxyAgent. All relay
// types share the exact same x-relay-target / x-relay-path / x-relay-auth header spec; only the
// deployment surface differs.
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/proxies/mappers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$guards$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/proxies/guards.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$registryGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/proxies/registryGeneration.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxySubscriptions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/proxySubscriptions.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$rotation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/proxies/rotation.ts [instrumentation] (ecmascript)");
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
// Mutate legacy proxyConfig rows directly so these writes stay inside the same
// SQLite transaction as the proxy registry row and assignment upsert.
function clearLegacyProxyForAssignment(db, assignment) {
    const normalizedScope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeScope"])(assignment.scope);
    const scopeId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeAssignmentScopeId"])(normalizedScope, assignment.scopeId);
    const level = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toLegacyProxyLevel"])(normalizedScope);
    const writeProxyConfig = db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('proxyConfig', ?, ?)");
    if (level === "global") {
        const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'proxyConfig' AND key = 'global'").get();
        if (!row) return "absent";
        try {
            if (typeof row.value === "string" && JSON.parse(row.value) === null) return "absent";
        } catch  {
        // Malformed global proxy config still needs to be overwritten with null.
        }
        writeProxyConfig.run("global", JSON.stringify(null));
        return "cleared";
    }
    if (!scopeId) return "absent";
    const mapKey = `${level}s`;
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'proxyConfig' AND key = ?").get(mapKey);
    if (!row) return "absent";
    let map = {};
    let shouldWrite = false;
    if (typeof row.value === "string") {
        try {
            const parsed = JSON.parse(row.value);
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                map = parsed;
            } else {
                shouldWrite = true;
            }
        } catch  {
            shouldWrite = true;
        }
    }
    if (Object.prototype.hasOwnProperty.call(map, scopeId)) {
        delete map[scopeId];
        shouldWrite = true;
    }
    if (!shouldWrite) return "absent";
    writeProxyConfig.run(mapKey, JSON.stringify(map));
    return "cleared";
}
function insertProxyRow(db, id, payload, now) {
    db.prepare(`INSERT INTO proxy_registry
      (id, name, type, host, port, username, password, region, notes, status, source, family, subscription_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(id, payload.name, payload.type, payload.host, Number(payload.port), payload.username || "", payload.password || "", payload.region || null, payload.notes || null, payload.status || "active", payload.source || "manual", payload.family || "auto", payload.subscriptionId ?? null, now, now);
}
function updateProxyRow(db, id, existing, payload, now) {
    const incomingUsername = typeof payload.username === "string" ? payload.username.trim() : undefined;
    const incomingPassword = typeof payload.password === "string" ? payload.password.trim() : undefined;
    const merged = {
        ...existing,
        ...payload,
        // Omitted credentials mean preserve; explicitly provided blanks clear stored auth.
        username: incomingUsername === undefined ? existing.username : incomingUsername,
        password: incomingPassword === undefined ? existing.password : incomingPassword,
        // subscription_id: only override when the caller explicitly passes it (string|null);
        // otherwise preserve whatever the existing row already carries.
        subscriptionId: payload.subscriptionId === undefined ? existing.subscriptionId : payload.subscriptionId,
        updatedAt: now
    };
    db.prepare(`UPDATE proxy_registry
       SET name = ?, type = ?, host = ?, port = ?, username = ?, password = ?, region = ?, notes = ?, status = ?, source = ?, family = ?, subscription_id = ?, updated_at = ?
     WHERE id = ?`).run(merged.name, merged.type, merged.host, Number(merged.port), merged.username || "", merged.password || "", merged.region || null, merged.notes || null, merged.status || "active", merged.source || "manual", merged.family || "auto", merged.subscriptionId ?? null, merged.updatedAt, id);
}
function upsertAssignmentRow(db, assignment, proxyId, now) {
    const normalizedScope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeScope"])(assignment.scope);
    const normalizedScopeId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeAssignmentScopeId"])(normalizedScope, assignment.scopeId);
    if (normalizedScope !== "global" && !normalizedScopeId) {
        throw new Error("scopeId is required for non-global proxy assignments");
    }
    // Single-assignment (replace) semantics: since #6365 lifted UNIQUE(scope,
    // scope_id) to allow proxy POOLS, this path keeps the legacy behavior where a
    // scope resolves to exactly one proxy — clear any existing pool and set a
    // 1-element pool at position 0. Pools are built explicitly via
    // addProxyToScopePool().
    replaceScopeWithSingleProxy(db, normalizedScope, normalizedScopeId, proxyId, now);
}
// Replace whatever proxies are attached to (scope, scope_id) with a single proxy
// at position 0. Uses `IS` for the scope_id match so a NULL scope_id compares
// correctly (global stores '__global__', but non-global combos may be null).
function replaceScopeWithSingleProxy(db, normalizedScope, normalizedScopeId, proxyId, now) {
    db.prepare("DELETE FROM proxy_assignments WHERE scope = ? AND scope_id IS ?").run(normalizedScope, normalizedScopeId);
    db.prepare(`INSERT INTO proxy_assignments (proxy_id, scope, scope_id, position, created_at, updated_at)
     VALUES (?, ?, ?, 0, ?, ?)`).run(proxyId, normalizedScope, normalizedScopeId, now, now);
}
function getAssignmentRow(db, scope, scopeId) {
    const normalizedScope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeScope"])(scope);
    const normalizedScopeId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeAssignmentScopeId"])(normalizedScope, scopeId);
    const row = db.prepare("SELECT id, proxy_id, scope, scope_id, position, created_at, updated_at FROM proxy_assignments WHERE scope = ? AND scope_id IS ?").get(normalizedScope, normalizedScopeId);
    return row ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mapAssignmentRow"])(row) : null;
}
async function listProxies(options) {
    const includeSecrets = options?.includeSecrets === true;
    const limit = options?.limit;
    const offset = options?.offset ?? 0;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    let sql = "SELECT id, name, type, host, port, username, password, region, notes, status, source, family, subscription_id, created_at, updated_at FROM proxy_registry ORDER BY datetime(updated_at) DESC, name ASC";
    const params = [];
    if (limit !== undefined) {
        sql += " LIMIT ? OFFSET ?";
        params.push(limit, offset);
    }
    const rows = db.prepare(sql).all(...params);
    const total = db.prepare("SELECT count(*) as cnt FROM proxy_registry").get().cnt;
    const proxies = rows.map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mapProxyRow"]);
    return {
        items: includeSecrets ? proxies : proxies.map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["redactProxySecrets"]),
        total
    };
}
async function getProxyById(id, options) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    return getProxyRowById(db, id, options);
}
function getProxyRowById(db, id, options) {
    const includeSecrets = options?.includeSecrets === true;
    const row = db.prepare("SELECT id, name, type, host, port, username, password, region, notes, status, source, family, subscription_id, created_at, updated_at FROM proxy_registry WHERE id = ?").get(id);
    if (!row) return null;
    const proxy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mapProxyRow"])(row);
    return includeSecrets ? proxy : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["redactProxySecrets"])(proxy);
}
function getProxyRowByIdOrThrow(db, id, options) {
    const proxy = getProxyRowById(db, id, options);
    if (!proxy) {
        throw new Error(`Failed to read proxy after mutation: ${id}`);
    }
    return proxy;
}
async function createProxy(payload) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])();
    const now = new Date().toISOString();
    insertProxyRow(db, id, payload, now);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$registryGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["bumpProxyRegistryGeneration"])();
    return getProxyById(id, {
        includeSecrets: false
    });
}
async function upsertProxy(payload) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const host = (payload.host || "").trim();
    const port = Number(payload.port);
    const username = (payload.username || "").trim();
    const existing = db.prepare("SELECT id FROM proxy_registry WHERE host = ? AND port = ? AND username = ? LIMIT 1").get(host, port, username);
    if (existing?.id) {
        const updated = await updateProxy(existing.id, payload);
        return {
            proxy: updated,
            action: "updated"
        };
    }
    const created = await createProxy(payload);
    return {
        proxy: created,
        action: "created"
    };
}
async function updateProxy(id, payload) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const existing = await getProxyById(id, {
        includeSecrets: true
    });
    if (!existing) return null;
    updateProxyRow(db, id, existing, payload, new Date().toISOString());
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$registryGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["bumpProxyRegistryGeneration"])();
    return getProxyById(id, {
        includeSecrets: false
    });
}
async function createProxyAndAssign(payload, assignment) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])();
    const now = new Date().toISOString();
    const tx = db.transaction(()=>{
        insertProxyRow(db, id, payload, now);
        upsertAssignmentRow(db, assignment, id, now);
        const legacyClearStatus = clearLegacyProxyForAssignment(db, assignment);
        return {
            legacyClearStatus,
            proxy: getProxyRowByIdOrThrow(db, id, {
                includeSecrets: false
            }),
            assignment: getAssignmentRow(db, assignment.scope, assignment.scopeId)
        };
    });
    const result = tx();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$registryGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["bumpProxyRegistryGeneration"])();
    if (result.legacyClearStatus === "cleared") {
        // Dynamic import avoids a static proxies.ts -> settings.ts cycle; settings.ts
        // imports registry helpers for proxy resolution.
        const { bumpProxyConfigGeneration } = await __turbopack_context__.A("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript, async loader)");
        bumpProxyConfigGeneration();
    }
    return {
        proxy: result.proxy,
        assignment: result.assignment
    };
}
async function updateProxyAndAssign(id, payload, assignment) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const now = new Date().toISOString();
    const tx = db.transaction(()=>{
        const existing = getProxyRowById(db, id, {
            includeSecrets: true
        });
        if (!existing) return null;
        updateProxyRow(db, id, existing, payload, now);
        upsertAssignmentRow(db, assignment, id, now);
        const legacyClearStatus = clearLegacyProxyForAssignment(db, assignment);
        return {
            legacyClearStatus,
            proxy: getProxyRowByIdOrThrow(db, id, {
                includeSecrets: false
            }),
            assignment: getAssignmentRow(db, assignment.scope, assignment.scopeId)
        };
    });
    const result = tx();
    if (!result) return null;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$registryGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["bumpProxyRegistryGeneration"])();
    if (result.legacyClearStatus === "cleared") {
        // Dynamic import avoids a static proxies.ts -> settings.ts cycle; settings.ts
        // imports registry helpers for proxy resolution.
        const { bumpProxyConfigGeneration } = await __turbopack_context__.A("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript, async loader)");
        bumpProxyConfigGeneration();
    }
    return {
        proxy: result.proxy,
        assignment: result.assignment
    };
}
async function getProxyAssignments(filters) {
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        if (filters?.proxyId) {
            return db.prepare("SELECT id, proxy_id, scope, scope_id, position, created_at, updated_at FROM proxy_assignments WHERE proxy_id = ? ORDER BY scope, scope_id").all(filters.proxyId).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mapAssignmentRow"]);
        }
        if (filters?.scope) {
            return db.prepare("SELECT id, proxy_id, scope, scope_id, position, created_at, updated_at FROM proxy_assignments WHERE scope = ? ORDER BY scope_id").all((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeScope"])(filters.scope)).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mapAssignmentRow"]);
        }
        return db.prepare("SELECT id, proxy_id, scope, scope_id, position, created_at, updated_at FROM proxy_assignments ORDER BY scope, scope_id").all().map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mapAssignmentRow"]);
    } catch (error) {
        // Fix #1706: Gracefully handle missing proxy_assignments table on fresh
        // Electron installs where migration 004 hasn't run yet.
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes("no such table")) return [];
        throw error;
    }
}
async function getProxyWhereUsed(proxyId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT id, proxy_id, scope, scope_id, position, created_at, updated_at FROM proxy_assignments WHERE proxy_id = ? ORDER BY scope, scope_id").all(proxyId).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mapAssignmentRow"]);
    return {
        count: rows.length,
        assignments: rows
    };
}
async function assignProxyToScope(scope, scopeId, proxyId) {
    const normalizedScope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeScope"])(scope);
    const normalizedScopeId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeAssignmentScopeId"])(normalizedScope, scopeId);
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    if (!proxyId) {
        db.prepare("DELETE FROM proxy_assignments WHERE scope = ? AND scope_id IS ?").run(normalizedScope, normalizedScopeId);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$rotation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["clearRotationState"])(db, normalizedScope, normalizedScopeId);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$registryGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["bumpProxyRegistryGeneration"])();
        return null;
    }
    const proxy = await getProxyById(proxyId, {
        includeSecrets: true
    });
    if (!proxy) {
        const err = new Error(`Proxy not found: ${proxyId}`);
        err.status = 404;
        throw err;
    }
    const now = new Date().toISOString();
    // Replace semantics (#6365): a plain assignProxyToScope always yields a
    // 1-element pool. Reset any round-robin cursor so the fresh single assignment
    // starts clean. Multi-proxy pools are built via addProxyToScopePool().
    replaceScopeWithSingleProxy(db, normalizedScope, normalizedScopeId, proxyId, now);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$rotation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resetRotationCursor"])(db, normalizedScope, normalizedScopeId);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$registryGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["bumpProxyRegistryGeneration"])();
    return getAssignmentRow(db, normalizedScope, normalizedScopeId);
}
async function addProxyToScopePool(scope, scopeId, proxyId) {
    const normalizedScope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeScope"])(scope);
    const normalizedScopeId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeAssignmentScopeId"])(normalizedScope, scopeId);
    if (normalizedScope !== "global" && !normalizedScopeId) {
        throw new Error("scopeId is required for non-global proxy assignments");
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const proxy = await getProxyById(proxyId, {
        includeSecrets: true
    });
    if (!proxy) {
        const err = new Error(`Proxy not found: ${proxyId}`);
        err.status = 404;
        throw err;
    }
    const existing = db.prepare("SELECT id FROM proxy_assignments WHERE scope = ? AND scope_id IS ? AND proxy_id = ? LIMIT 1").get(normalizedScope, normalizedScopeId, proxyId);
    if (!existing) {
        const now = new Date().toISOString();
        const maxRow = db.prepare("SELECT MAX(position) AS maxPos FROM proxy_assignments WHERE scope = ? AND scope_id IS ?").get(normalizedScope, normalizedScopeId);
        const nextPosition = maxRow && typeof maxRow.maxPos === "number" ? maxRow.maxPos + 1 : 0;
        db.prepare(`INSERT INTO proxy_assignments (proxy_id, scope, scope_id, position, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`).run(proxyId, normalizedScope, normalizedScopeId, nextPosition, now, now);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$registryGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["bumpProxyRegistryGeneration"])();
    }
    const row = db.prepare("SELECT id, proxy_id, scope, scope_id, position, created_at, updated_at FROM proxy_assignments WHERE scope = ? AND scope_id IS ? AND proxy_id = ? LIMIT 1").get(normalizedScope, normalizedScopeId, proxyId);
    return row ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mapAssignmentRow"])(row) : null;
}
async function removeProxyFromScopePool(scope, scopeId, proxyId) {
    const normalizedScope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeScope"])(scope);
    const normalizedScopeId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeAssignmentScopeId"])(normalizedScope, scopeId);
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const result = db.prepare("DELETE FROM proxy_assignments WHERE scope = ? AND scope_id IS ? AND proxy_id = ?").run(normalizedScope, normalizedScopeId, proxyId);
    if (result.changes > 0) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$registryGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["bumpProxyRegistryGeneration"])();
    }
    return result.changes > 0;
}
async function setScopeRotationStrategy(scope, scopeId, strategy, options) {
    const normalizedScope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeScope"])(scope);
    const rotationScopeId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$rotation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeRotationScopeId"])(normalizedScope, scopeId);
    const normalizedStrategy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$rotation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeRotationStrategy"])(strategy);
    const now = new Date().toISOString();
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const stickyWindow = options?.stickyWindowMinutes !== undefined && Number.isFinite(options.stickyWindowMinutes) ? Math.max(1, Math.floor(options.stickyWindowMinutes)) : null;
    if (stickyWindow !== null) {
        db.prepare(`INSERT INTO proxy_scope_rotation (scope, scope_id, strategy, sticky_window_minutes, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(scope, scope_id)
       DO UPDATE SET strategy = excluded.strategy, sticky_window_minutes = excluded.sticky_window_minutes, updated_at = excluded.updated_at`).run(normalizedScope, rotationScopeId, normalizedStrategy, stickyWindow, now);
    } else {
        db.prepare(`INSERT INTO proxy_scope_rotation (scope, scope_id, strategy, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(scope, scope_id)
       DO UPDATE SET strategy = excluded.strategy, updated_at = excluded.updated_at`).run(normalizedScope, rotationScopeId, normalizedStrategy, now);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$registryGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["bumpProxyRegistryGeneration"])();
    return normalizedStrategy;
}
async function deleteProxyById(id, options) {
    const force = options?.force === true;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const usage = await getProxyWhereUsed(id);
    if (!force && usage.count > 0) {
        const err = new Error("Proxy is still assigned. Remove assignments first or use force=true");
        err.status = 409;
        err.code = "proxy_in_use";
        throw err;
    }
    if (force && usage.count > 0) {
        db.prepare("DELETE FROM proxy_assignments WHERE proxy_id = ?").run(id);
    }
    const result = db.prepare("DELETE FROM proxy_registry WHERE id = ?").run(id);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$registryGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["bumpProxyRegistryGeneration"])();
    return result.changes > 0;
}
async function migrateLegacyProxyConfigToRegistry(options) {
    const force = options?.force === true;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const existingCountRow = db.prepare("SELECT COUNT(*) AS cnt FROM proxy_registry").get();
    const existingCount = Number(existingCountRow?.cnt || 0);
    if (!force && existingCount > 0) {
        return {
            migrated: 0,
            skipped: true,
            reason: "registry_not_empty"
        };
    }
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'proxyConfig'").all();
    const raw = {};
    for (const row of rows){
        if (!row?.key || typeof row.value !== "string") continue;
        try {
            raw[row.key] = JSON.parse(row.value);
        } catch  {
        // ignore malformed legacy entry
        }
    }
    let migrated = 0;
    if (raw.global) {
        const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["coerceProxyPayload"])(raw.global, "Legacy Global Proxy");
        if (payload) {
            const created = await createProxy(payload);
            if (created?.id) {
                await assignProxyToScope("global", null, created.id);
                migrated++;
            }
        }
    }
    for (const [providerId, proxyValue] of Object.entries(raw.providers || {})){
        const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["coerceProxyPayload"])(proxyValue, `Legacy Provider Proxy (${providerId})`);
        if (!payload) continue;
        const created = await createProxy(payload);
        if (created?.id) {
            await assignProxyToScope("provider", providerId, created.id);
            migrated++;
        }
    }
    for (const [comboId, proxyValue] of Object.entries(raw.combos || {})){
        const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["coerceProxyPayload"])(proxyValue, `Legacy Combo Proxy (${comboId})`);
        if (!payload) continue;
        const created = await createProxy(payload);
        if (created?.id) {
            await assignProxyToScope("combo", comboId, created.id);
            migrated++;
        }
    }
    for (const [connectionId, proxyValue] of Object.entries(raw.keys || {})){
        const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["coerceProxyPayload"])(proxyValue, `Legacy Account Proxy (${connectionId})`);
        if (!payload) continue;
        const created = await createProxy(payload);
        if (created?.id) {
            await assignProxyToScope("account", connectionId, created.id);
            migrated++;
        }
    }
    return {
        migrated,
        skipped: false
    };
}
async function getProxyHealthStats(options) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const hours = Math.max(1, Math.min(24 * 30, Number(options?.hours || 24)));
    const sinceIso = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    const rows = db.prepare(`SELECT
         p.id as proxy_id,
         p.name as proxy_name,
         p.type as proxy_type,
         p.host as proxy_host,
         p.port as proxy_port,
         COUNT(l.id) as total_requests,
         SUM(CASE WHEN l.status = 'success' THEN 1 ELSE 0 END) as success_count,
         SUM(CASE WHEN l.status = 'error' THEN 1 ELSE 0 END) as error_count,
         SUM(CASE WHEN l.status = 'timeout' THEN 1 ELSE 0 END) as timeout_count,
         AVG(CASE WHEN l.latency_ms IS NOT NULL THEN l.latency_ms END) as avg_latency_ms,
         MAX(l.timestamp) as last_seen_at
       FROM proxy_registry p
       LEFT JOIN proxy_logs l
         ON l.proxy_host = p.host
        AND l.proxy_type = p.type
        AND l.proxy_port = p.port
        AND l.timestamp >= ?
       GROUP BY p.id, p.name, p.type, p.host, p.port
       ORDER BY p.name ASC`).all(sinceIso);
    return rows.map((row)=>{
        const total = Number(row.total_requests || 0);
        const success = Number(row.success_count || 0);
        const error = Number(row.error_count || 0);
        const timeout = Number(row.timeout_count || 0);
        const successRate = total > 0 ? Math.round(success / total * 10000) / 100 : null;
        return {
            proxyId: String(row.proxy_id || ""),
            name: String(row.proxy_name || ""),
            type: String(row.proxy_type || "http"),
            host: String(row.proxy_host || ""),
            port: Number(row.proxy_port || 0),
            totalRequests: total,
            successCount: success,
            errorCount: error,
            timeoutCount: timeout,
            successRate,
            avgLatencyMs: row.avg_latency_ms === null || row.avg_latency_ms === undefined ? null : Math.round(Number(row.avg_latency_ms)),
            lastSeenAt: row.last_seen_at ? String(row.last_seen_at) : null
        };
    });
}
async function bulkAssignProxyToScope(scope, scopeIds, proxyId) {
    const uniqueScopeIds = [
        ...new Set((scopeIds || []).map((id)=>String(id).trim()).filter(Boolean))
    ];
    const failed = [];
    let updated = 0;
    if (scope === "global") {
        await assignProxyToScope("global", null, proxyId);
        return {
            updated: 1,
            failed: []
        };
    }
    for (const scopeId of uniqueScopeIds){
        try {
            await assignProxyToScope(scope, scopeId, proxyId);
            updated++;
        } catch (error) {
            failed.push({
                scopeId,
                reason: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }
    return {
        updated,
        failed
    };
}
async function resolveProxyForProvider(providerId) {
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$guards$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isGlobalProxyEnabled"])(db)) return null;
        // Resolve by specificity across both storage backends. The GUI Custom tab
        // still writes provider/global proxies to the legacy config, while Saved
        // Proxy uses the registry. A registry-global fallback must not shadow a
        // more-specific legacy provider proxy (#2601).
        const registryProvider = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$rotation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveProxyForScopeFromRegistry"])("provider", providerId);
        if (registryProvider?.proxy) return registryProvider.proxy;
        // Fallback: honor the legacy per-provider / global proxy config (set via
        // /api/settings/proxy?level=provider&id=...). The proxy registry only tracks
        // explicit assignments; without this fallback the OAuth token exchange and
        // token-refresh paths ignore a proxy configured the legacy way and connect
        // directly — which on a VPS trips Anthropic's IP rate limit (#2456).
        // resolveProxyForConnection already has this fallback; mirror it here.
        // Dynamic import avoids a static cycle (settings.ts imports from proxies.ts).
        const { getProxyForLevel } = await __turbopack_context__.A("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript, async loader)");
        const legacyProvider = await getProxyForLevel("provider", providerId);
        if (legacyProvider && typeof legacyProvider === "object" && legacyProvider.host) {
            return {
                type: legacyProvider.type,
                host: legacyProvider.host,
                port: legacyProvider.port,
                username: legacyProvider.username,
                password: legacyProvider.password
            };
        }
        const registryGlobal = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$rotation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveProxyForScopeFromRegistry"])("global");
        if (registryGlobal?.proxy) return registryGlobal.proxy;
        const legacyGlobal = await getProxyForLevel("global");
        if (legacyGlobal && typeof legacyGlobal === "object" && legacyGlobal.host) {
            return {
                type: legacyGlobal.type,
                host: legacyGlobal.host,
                port: legacyGlobal.port,
                username: legacyGlobal.username,
                password: legacyGlobal.password
            };
        }
        return null;
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes("no such table")) return null;
        throw error;
    }
}
}),
"[project]/src/lib/db/settings/shared.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * db/settings/shared.ts — Foundational types and helpers shared across settings leaf modules.
 */ __turbopack_context__.s([
    "toRecord",
    ()=>toRecord
]);
function toRecord(value) {
    return value && typeof value === "object" ? value : {};
}
}),
"[project]/src/lib/db/settings/noAuthProxyFallback.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "resolveNoAuthSharedProviderProxy",
    ()=>resolveNoAuthSharedProviderProxy
]);
/**
 * db/settings/noAuthProxyFallback.ts
 *
 * #6272 — no-auth providers (mimocode, opencode, ...) are dispatched with a single
 * hardcoded, provider-agnostic connectionId ("noauth" — SYNTHETIC_NOAUTH_CONNECTION_ID
 * in src/sse/services/auth.ts). No `provider_connections` row ever has id="noauth", so
 * `resolveProxyForConnection()` in ../settings.ts can never populate `connectionRecord`
 * for these providers, and its provider-level proxy lookup (Steps 6/8) only runs when
 * `connectionRecord` is present — a proxy assigned via Settings -> Providers -> mimocode
 * (or any other no-auth provider) was therefore silently unreachable.
 *
 * This is a best-effort fallback invoked only when `connectionRecord` could not be
 * found: it scans the known no-auth provider ids for a configured provider-level
 * proxy (registry first, then legacy `proxyConfig.providers`) and returns the first
 * match. It intentionally does not try to disambiguate which no-auth provider issued
 * the request (the shared connectionId carries no such information) — in practice at
 * most one no-auth provider has a provider-level proxy assigned at a time.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/noauth.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/proxies.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$rotation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/proxies/rotation.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
// Mirrors settings.ts's withFamilyDefault: legacy proxyConfig entries predate the
// IPv6-only `family` directive, so default it to "auto" when missing.
function withFamilyDefault(value) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        const record = value;
        if (typeof record.family === "string") return record;
        return {
            ...record,
            family: "auto"
        };
    }
    return value;
}
async function resolveOneNoAuthProviderProxy(providerId, legacyProviders) {
    const registryProvider = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$rotation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveProxyForScopeFromRegistry"])("provider", providerId);
    if (registryProvider?.proxy) return registryProvider;
    const legacyProxy = legacyProviders?.[providerId];
    if (legacyProxy) {
        return {
            proxy: withFamilyDefault(legacyProxy),
            level: "provider",
            levelId: providerId
        };
    }
    return null;
}
async function resolveNoAuthSharedProviderProxy(legacyProviders, providerId) {
    if (providerId) return resolveOneNoAuthProviderProxy(providerId, legacyProviders);
    for (const providerId of Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["NOAUTH_PROVIDERS"])){
        const resolved = await resolveOneNoAuthProviderProxy(providerId, legacyProviders);
        if (resolved) return resolved;
    }
    return null;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/db/settings/pricing.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getPricing",
    ()=>getPricing,
    "getPricingForModel",
    ()=>getPricingForModel,
    "getPricingWithSources",
    ()=>getPricingWithSources,
    "resetAllPricing",
    ()=>resetAllPricing,
    "resetPricing",
    ()=>resetPricing,
    "updatePricing",
    ()=>updatePricing
]);
/**
 * db/settings/pricing.ts — Pricing data CRUD (user overrides, LiteLLM sync, models.dev sync).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/settings/shared.ts [instrumentation] (ecmascript)");
;
;
;
;
;
function readPricingNamespace(db, namespace) {
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = ?").all(namespace);
    const pricing = {};
    for (const row of rows){
        const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(row);
        const key = typeof record.key === "string" ? record.key : null;
        const rawValue = typeof record.value === "string" ? record.value : null;
        if (!key || rawValue === null) continue;
        try {
            pricing[key] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(JSON.parse(rawValue));
        } catch  {
        // Corrupted data — skip silently, fallback to lower layers
        }
    }
    return pricing;
}
function mergePricingLayers(layers) {
    const mergedPricing = {};
    for (const layer of layers){
        for (const [provider, models] of Object.entries(layer)){
            if (!mergedPricing[provider]) {
                mergedPricing[provider] = {
                    ...models
                };
                continue;
            }
            for (const [model, pricing] of Object.entries(models)){
                mergedPricing[provider][model] = mergedPricing[provider][model] ? {
                    ...mergedPricing[provider][model] || {},
                    ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(pricing)
                } : pricing;
            }
        }
    }
    return mergedPricing;
}
function buildPricingSourceMap(layers) {
    const sourceMap = {};
    const mergedPricing = mergePricingLayers([
        layers.defaults,
        layers.litellm,
        layers.modelsDev,
        layers.user
    ]);
    for (const [provider, models] of Object.entries(mergedPricing)){
        sourceMap[provider] = {};
        for (const model of Object.keys(models)){
            if (layers.user[provider]?.[model]) {
                sourceMap[provider][model] = "user";
            } else if (layers.modelsDev[provider]?.[model]) {
                sourceMap[provider][model] = "modelsDev";
            } else if (layers.litellm[provider]?.[model]) {
                sourceMap[provider][model] = "litellm";
            } else {
                sourceMap[provider][model] = "default";
            }
        }
    }
    return sourceMap;
}
async function getPricingLayers() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    // Layer 1: Hardcoded defaults (lowest priority)
    const { getDefaultPricing } = await __turbopack_context__.A("[project]/src/shared/constants/pricing.ts [instrumentation] (ecmascript, async loader)");
    return {
        defaults: getDefaultPricing(),
        litellm: readPricingNamespace(db, "pricing_synced"),
        modelsDev: readPricingNamespace(db, "models_dev_pricing"),
        user: readPricingNamespace(db, "pricing")
    };
}
async function getPricing() {
    const layers = await getPricingLayers();
    // Merge: defaults → LiteLLM → models.dev → user (each layer overrides the previous)
    return mergePricingLayers([
        layers.defaults,
        layers.litellm,
        layers.modelsDev,
        layers.user
    ]);
}
async function getPricingWithSources() {
    const layers = await getPricingLayers();
    return {
        pricing: mergePricingLayers([
            layers.defaults,
            layers.litellm,
            layers.modelsDev,
            layers.user
        ]),
        sourceMap: buildPricingSourceMap(layers)
    };
}
async function getPricingForModel(provider, model) {
    const pricing = await getPricing();
    const findKeyInsensitive = (obj, key)=>{
        if (!obj || !key) return undefined;
        const lowerKey = key.toLowerCase();
        for (const [k, v] of Object.entries(obj)){
            if (k.toLowerCase() === lowerKey) return v;
        }
        return undefined;
    };
    const pLower = (provider || "").toLowerCase();
    let providerPricing = findKeyInsensitive(pricing, pLower);
    if (!providerPricing) {
        const alias = findKeyInsensitive(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"], pLower);
        if (alias) providerPricing = findKeyInsensitive(pricing, alias);
    }
    if (!providerPricing) {
        for (const [id, mappedAlias] of Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"])){
            if (typeof mappedAlias === "string" && mappedAlias.toLowerCase() === pLower) {
                providerPricing = findKeyInsensitive(pricing, id);
                if (providerPricing) break;
            }
        }
    }
    if (!providerPricing) {
        const np = pLower.replace(/-cn$/, "");
        if (np && np !== pLower) {
            providerPricing = findKeyInsensitive(pricing, np);
        }
    }
    if (!providerPricing) return null;
    const mLower = (model || "").toLowerCase();
    let modelPricing = findKeyInsensitive(providerPricing, mLower);
    if (!modelPricing) {
        const hyphenModel = mLower.replace(/\./g, "-");
        modelPricing = findKeyInsensitive(providerPricing, hyphenModel);
    }
    return modelPricing || null;
}
async function updatePricing(pricingData) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const insert = db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('pricing', ?, ?)");
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'pricing'").all();
    const existing = {};
    for (const row of rows){
        const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(row);
        const key = typeof record.key === "string" ? record.key : null;
        const rawValue = typeof record.value === "string" ? record.value : null;
        if (!key || rawValue === null) continue;
        existing[key] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(JSON.parse(rawValue));
    }
    const tx = db.transaction(()=>{
        for (const [provider, models] of Object.entries(pricingData)){
            insert.run(provider, JSON.stringify({
                ...existing[provider] || {},
                ...models
            }));
        }
    });
    tx();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("pricing"); // Bust the pricing read cache
    const updated = {};
    const allRows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'pricing'").all();
    for (const row of allRows){
        const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(row);
        const key = typeof record.key === "string" ? record.key : null;
        const rawValue = typeof record.value === "string" ? record.value : null;
        if (!key || rawValue === null) continue;
        updated[key] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(JSON.parse(rawValue));
    }
    return updated;
}
async function resetPricing(provider, model) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    if (model) {
        const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'pricing' AND key = ?").get(provider);
        if (row) {
            const rowRecord = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(row);
            const value = typeof rowRecord.value === "string" ? rowRecord.value : "{}";
            const models = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(JSON.parse(value));
            delete models[model];
            if (Object.keys(models).length === 0) {
                db.prepare("DELETE FROM key_value WHERE namespace = 'pricing' AND key = ?").run(provider);
            } else {
                db.prepare("UPDATE key_value SET value = ? WHERE namespace = 'pricing' AND key = ?").run(JSON.stringify(models), provider);
            }
        }
    } else {
        db.prepare("DELETE FROM key_value WHERE namespace = 'pricing' AND key = ?").run(provider);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    const allRows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'pricing'").all();
    const result = {};
    for (const row of allRows){
        const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(row);
        const key = typeof record.key === "string" ? record.key : null;
        const rawValue = typeof record.value === "string" ? record.value : null;
        if (!key || rawValue === null) continue;
        result[key] = JSON.parse(rawValue);
    }
    return result;
}
async function resetAllPricing() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("DELETE FROM key_value WHERE namespace = 'pricing'").run();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return {};
}
}),
"[project]/src/lib/db/settings/lkgp.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearAllLKGP",
    ()=>clearAllLKGP,
    "getLKGP",
    ()=>getLKGP,
    "setLKGP",
    ()=>setLKGP
]);
/**
 * db/settings/lkgp.ts — Last Known Good Provider (LKGP) persistence.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
;
async function getLKGP(comboName, modelId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const key = `${comboName}:${modelId}`;
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'lkgp' AND key = ?").get(key);
    if (!row?.value) return null;
    try {
        const parsed = JSON.parse(row.value);
        if (typeof parsed === "object" && parsed !== null && "provider" in parsed) {
            return parsed;
        }
        return {
            provider: String(parsed)
        };
    } catch  {
        return {
            provider: row.value
        };
    }
}
async function setLKGP(comboName, modelId, providerId, connectionId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const key = `${comboName}:${modelId}`;
    const value = {
        provider: providerId
    };
    if (connectionId) value.connectionId = connectionId;
    db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('lkgp', ?, ?)").run(key, JSON.stringify(value));
}
function clearAllLKGP() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("DELETE FROM key_value WHERE namespace = 'lkgp'").run();
}
}),
"[project]/src/lib/db/settings/cacheMetrics.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCacheMetrics",
    ()=>getCacheMetrics,
    "getCacheTrend",
    ()=>getCacheTrend,
    "resetCacheMetrics",
    ()=>resetCacheMetrics,
    "updateCacheMetrics",
    ()=>updateCacheMetrics
]);
/**
 * db/settings/cacheMetrics.ts — Cache control metrics (computed from usage_history on-the-fly).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
;
async function getCacheMetrics() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    try {
        // Aggregate totals from usage_history
        const totalsRow = db.prepare(`
      SELECT
        COUNT(*) as totalRequests,
        SUM(tokens_input) as totalInputTokens,
        SUM(tokens_cache_read) as totalCachedTokens,
        SUM(tokens_cache_creation) as totalCacheCreationTokens
      FROM usage_history
      WHERE tokens_cache_read > 0 OR tokens_cache_creation > 0
    `).get();
        // Get all requests count (including those without cache activity)
        const allRequestsRow = db.prepare(`
      SELECT COUNT(*) as totalRequests
      FROM usage_history
    `).get();
        // Aggregate by provider
        const byProviderRows = db.prepare(`
      SELECT
        provider,
        COUNT(*) as totalRequests,
        SUM(CASE WHEN tokens_cache_read > 0 OR tokens_cache_creation > 0 THEN 1 ELSE 0 END) as cachedRequests,
        SUM(CASE WHEN tokens_cache_read > 0 OR tokens_cache_creation > 0 THEN tokens_input ELSE 0 END) as inputTokens,
        SUM(tokens_cache_read) as cachedTokens,
        SUM(tokens_cache_creation) as cacheCreationTokens
      FROM usage_history
      WHERE provider IS NOT NULL
      GROUP BY provider
      HAVING cachedRequests > 0
    `).all();
        // Aggregate by combo strategy (direct requests stored as 'direct')
        const byStrategyRows = db.prepare(`
      SELECT
        COALESCE(combo_strategy, 'direct') as strategy,
        COUNT(*) as requests,
        SUM(tokens_input) as inputTokens,
        SUM(tokens_cache_read) as cachedTokens,
        SUM(tokens_cache_creation) as cacheCreationTokens
      FROM usage_history
      WHERE (tokens_cache_read > 0 OR tokens_cache_creation > 0)
      GROUP BY combo_strategy
    `).all();
        const tokensSaved = totalsRow?.totalCachedTokens || 0;
        const AVG_INPUT_PRICE_PER_MILLION = 3;
        const CACHE_DISCOUNT = 0.9;
        const estimatedCostSaved = Math.round(tokensSaved / 1_000_000 * AVG_INPUT_PRICE_PER_MILLION * CACHE_DISCOUNT * 100) / 100;
        // Build byProvider object
        const byProvider = {};
        for (const row of byProviderRows){
            byProvider[row.provider] = {
                requests: row.cachedRequests,
                totalRequests: row.totalRequests,
                cachedRequests: row.cachedRequests,
                inputTokens: row.inputTokens || 0,
                cachedTokens: row.cachedTokens || 0,
                cacheCreationTokens: row.cacheCreationTokens || 0
            };
        }
        // Build byStrategy object
        const byStrategy = {};
        for (const row of byStrategyRows){
            byStrategy[row.strategy] = {
                requests: row.requests,
                inputTokens: row.inputTokens || 0,
                cachedTokens: row.cachedTokens || 0,
                cacheCreationTokens: row.cacheCreationTokens || 0
            };
        }
        return {
            totalRequests: allRequestsRow?.totalRequests || totalsRow?.totalRequests || 0,
            requestsWithCacheControl: totalsRow?.totalRequests || 0,
            totalInputTokens: totalsRow?.totalInputTokens || 0,
            totalCachedTokens: totalsRow?.totalCachedTokens || 0,
            totalCacheCreationTokens: totalsRow?.totalCacheCreationTokens || 0,
            tokensSaved,
            estimatedCostSaved,
            byProvider,
            byStrategy,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error("Failed to fetch cache metrics from usage_history:", error);
        return {
            totalRequests: 0,
            requestsWithCacheControl: 0,
            totalInputTokens: 0,
            totalCachedTokens: 0,
            totalCacheCreationTokens: 0,
            tokensSaved: 0,
            estimatedCostSaved: 0,
            byProvider: {},
            byStrategy: {},
            lastUpdated: new Date().toISOString()
        };
    }
}
async function updateCacheMetrics(_metrics) {
    // No-op: metrics are now computed from usage_history on-the-fly
    // The usage_history table is the single source of truth
    return getCacheMetrics();
}
async function getCacheTrend(hours = 24) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    try {
        const rows = db.prepare(`
        SELECT
          strftime('%Y-%m-%dT%H:00:00Z', timestamp) as hour,
          COUNT(*) as requests,
          SUM(CASE WHEN tokens_cache_read > 0 OR tokens_cache_creation > 0 THEN 1 ELSE 0 END) as cachedRequests,
          SUM(tokens_input) as inputTokens,
          SUM(tokens_cache_read) as cachedTokens,
          SUM(tokens_cache_creation) as cacheCreationTokens
        FROM usage_history
        WHERE timestamp >= datetime('now', ?)
        GROUP BY hour
        ORDER BY hour ASC
      `).all(`-${hours} hours`);
        return rows.map((r)=>({
                timestamp: r.hour,
                requests: r.requests,
                cachedRequests: r.cachedRequests,
                inputTokens: r.inputTokens || 0,
                cachedTokens: r.cachedTokens || 0,
                cacheCreationTokens: r.cacheCreationTokens || 0
            }));
    } catch (error) {
        console.error("Failed to fetch cache trend:", error);
        return [];
    }
}
async function resetCacheMetrics() {
    // No-op: cache metrics are computed from usage_history.
    console.warn("resetCacheMetrics is deprecated - cache metrics are now computed from usage_history");
    return getCacheMetrics();
}
}),
"[project]/src/lib/db/settings.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "SETTINGS_REVISION_KEY",
    ()=>SETTINGS_REVISION_KEY,
    "SettingsRevisionConflictError",
    ()=>SettingsRevisionConflictError,
    "bumpProxyConfigGeneration",
    ()=>bumpProxyConfigGeneration,
    "deleteProxyForLevel",
    ()=>deleteProxyForLevel,
    "getProxyConfig",
    ()=>getProxyConfig,
    "getProxyForLevel",
    ()=>getProxyForLevel,
    "getSettings",
    ()=>getSettings,
    "getSettingsRevision",
    ()=>getSettingsRevision,
    "isCloudEnabled",
    ()=>isCloudEnabled,
    "resolveProxyForConnection",
    ()=>resolveProxyForConnection,
    "setProxyConfig",
    ()=>setProxyConfig,
    "setProxyForLevel",
    ()=>setProxyForLevel,
    "updateSettings",
    ()=>updateSettings
]);
/**
 * db/settings.js — Settings, pricing, and proxy config.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/encryption.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/proxies.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$registryGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/proxies/registryGeneration.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$rotation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/proxies/rotation.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/combos/steps.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$bodySize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/bodySize.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$responsesPreviousResponseId$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/responsesPreviousResponseId.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/settings/shared.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2f$noAuthProxyFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/settings/noAuthProxyFallback.ts [instrumentation] (ecmascript)");
// ──────────────── Re-exports from leaf modules ────────────────
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2f$pricing$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/settings/pricing.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2f$lkgp$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/settings/lkgp.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2f$cacheMetrics$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/settings/cacheMetrics.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2f$noAuthProxyFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2f$noAuthProxyFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
const PROXY_RESOLUTION_CACHE_MAX_ENTRIES = 100;
function isTruthyEnvFlag(value) {
    return typeof value === "string" && /^(1|true|yes|on)$/i.test(value.trim());
}
let proxyConfigGeneration = 0;
const proxyResolutionCache = new Map();
function bumpProxyConfigGeneration() {
    proxyConfigGeneration++;
    proxyResolutionCache.clear();
}
function cacheProxyResolution(connectionId, generation, registryGeneration, result) {
    if (generation !== proxyConfigGeneration) return;
    if (registryGeneration !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$registryGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getProxyRegistryGeneration"])()) return;
    if (proxyResolutionCache.size >= PROXY_RESOLUTION_CACHE_MAX_ENTRIES) {
        const oldestKey = proxyResolutionCache.keys().next().value;
        if (oldestKey) proxyResolutionCache.delete(oldestKey);
    }
    proxyResolutionCache.set(connectionId, {
        generation,
        registryGeneration,
        result
    });
}
function toProxyMap(value) {
    return value && typeof value === "object" ? value : {};
}
function toProxyValue(value) {
    if (value === null || typeof value === "string") return value;
    if (value && typeof value === "object") return value;
    return null;
}
// Legacy proxyConfig store (key_value namespace 'proxyConfig') predates the
// IPv6-only `family` directive, so its object configs have no family field.
// Default to "auto" so the family marker rides along the cascade end-to-end
// (consumed by proxyConfigToUrl). String configs are returned unchanged.
function withFamilyDefault(value) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        const record = value;
        if (typeof record.family === "string") return record;
        return {
            ...record,
            family: "auto"
        };
    }
    return value;
}
const SETTINGS_REVISION_KEY = "_settingsRevision";
class SettingsRevisionConflictError extends Error {
    currentRevision;
    code;
    constructor(currentRevision){
        super("Settings revision mismatch"), this.currentRevision = currentRevision, this.code = "SETTINGS_REVISION_CONFLICT";
        this.name = "SettingsRevisionConflictError";
    }
}
function readSettingsRevision(db) {
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'settings' AND key = ?").get(SETTINGS_REVISION_KEY);
    if (!row?.value) return 0;
    try {
        const parsed = JSON.parse(row.value);
        return typeof parsed === "number" && Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
    } catch  {
        return 0;
    }
}
async function getSettingsRevision() {
    return readSettingsRevision((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])());
}
/**
 * #7274: read-fallback for the codexSessionAffinityTtlMs -> sessionAffinityTtlMs
 * rename. Migration 124 already backfills the new key from any pre-existing
 * old-key row for the common case, but this covers callers reading settings
 * before that migration has had a chance to run (or any drift between the
 * two). Only applies when the generic key was never explicitly persisted —
 * an operator-set `sessionAffinityTtlMs` (including an explicit 0) always wins.
 * Extracted to a leaf helper so `getSettings()` stays under the max-lines-per-
 * function ratchet.
 */ function applySessionAffinityLegacyFallback(settings) {
    if (settings.sessionAffinityTtlMs === undefined) {
        settings.sessionAffinityTtlMs = typeof settings.codexSessionAffinityTtlMs === "number" ? settings.codexSessionAffinityTtlMs : 0;
    }
}
async function getSettings() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'settings'").all();
    const settings = {
        cloudEnabled: true,
        tailscaleEnabled: false,
        tailscaleUrl: "",
        stickyRoundRobinLimit: 3,
        disableSessionStickiness: false,
        promptCacheAffinityEnabled: true,
        comboStrategy: "fallback",
        comboStickyRoundRobinLimit: null,
        providerStrategies: {},
        // Per-operator quota row visibility (dashboard usage tab). Keyed by
        // provider id → { hidden: [<quota visibility key>] }. Independent of the
        // model catalog's isHidden/isDeleted flags (collectHiddenQuotaModelIds in
        // ProviderLimits/utils.tsx) — this is a personal view preference, not an
        // admin model-catalog edit. Ported from upstream decolua/9router#2371.
        quotaVisibility: {},
        requestRetry: 3,
        maxRetryIntervalSec: 30,
        antigravitySignatureCacheMode: "enabled",
        requireLogin: true,
        oidcEnabled: false,
        oidcIssuer: "",
        oidcClientId: "",
        oidcClientSecret: "",
        oidcScopes: [
            "openid",
            "profile",
            "email"
        ],
        oidcRedirectPath: "/api/auth/oidc/callback",
        oidcAllowedSubjects: [],
        mcpEnabled: false,
        a2aEnabled: false,
        hiddenSidebarItems: [],
        hiddenSidebarGroupLabels: [],
        sidebarSectionOrder: [],
        sidebarItemOrder: {},
        sidebarActivePreset: null,
        hideEndpointCloudflaredTunnel: false,
        hideEndpointTailscaleFunnel: false,
        hideEndpointNgrokTunnel: false,
        preferClaudeCodeForUnprefixedClaudeModels: isTruthyEnvFlag(process.env.OMNIROUTE_PREFER_CLAUDE_CODE_FOR_UNPREFIXED_CLAUDE_MODELS),
        // Opt-in (default "off"): short-circuits Claude Code's `--permission-mode auto`
        // internal security-classifier request with a synthetic `<block>no</block>` ALLOW
        // response, without calling the upstream provider. See
        // open-sse/handlers/chatCore/claudeClassifierCompat.ts for the detector + builder.
        claudeClassifierCompat: "off",
        autoRefreshProviderQuota: false,
        credentialRedactionEnabled: false,
        autoRefreshProviderQuotaInterval: 180,
        comboConfigMode: "guided",
        comboAutoPromoteEnabled: false,
        codexServiceTier: {
            enabled: false
        },
        claudeFastMode: {
            enabled: false,
            supportedModels: [
                "claude-fable-5",
                "claude-opus-5",
                "claude-opus-4-8",
                "claude-opus-4-7",
                "claude-opus-4-6"
            ]
        },
        // #7274: renamed from codexSessionAffinityTtlMs — session affinity now
        // applies to any provider, not just Codex. No default here on purpose:
        // the read-fallback below only kicks in while `sessionAffinityTtlMs` has
        // never been explicitly persisted, so it can tell "never configured"
        // apart from "operator explicitly set 0" on the new key.
        responsesPreviousResponseIdMode: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$responsesPreviousResponseId$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_RESPONSES_PREVIOUS_RESPONSE_ID_MODE"],
        alwaysPreserveClientCache: "auto",
        idempotencyWindowMs: 5000,
        wsAuth: false,
        maxBodySizeMb: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$bodySize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["requestBodyLimitMbFromEnv"])(process.env.MAX_BODY_SIZE_BYTES),
        debugMode: true,
        // Opt-in diagnostic: when true, the chat handler emits a `log.debug("TOOLS", …)`
        // line per request summarizing tool count + MCP/hosted/client source breakdown.
        logToolSources: false,
        // LOCAL_ONLY manage-scope bypass policy defaults (T-011 / spec §Data Model).
        // Preserves PR #2473 behaviour on migration — the bypass starts ENABLED
        // for `/api/mcp/` so existing manage-scope Bearer clients keep working.
        // Operators flip the kill-switch to false (or drop the prefix) via the
        // Settings UI; the change hot-reloads through `applyRuntimeSettings` →
        // `applyAuthzBypassSection` → `getAuthzBypassSnapshot()`.
        localOnlyManageScopeBypassEnabled: true,
        localOnlyManageScopeBypassPrefixes: [
            "/api/mcp/"
        ],
        customBannedSignals: [],
        proxyEnabled: true,
        perKeyProxyEnabled: false,
        customSystemPromptEnabled: false,
        customSystemPrompt: "",
        // #6316: Opt-in filter that hides paid-only models from the /v1/models catalog.
        // Uses isFreeModel() from src/shared/utils/freeModels.ts to detect free entries
        // (`:free` suffix, zero-price pricing, or FREE_MODEL_BUDGETS membership). Default
        // false preserves prior behaviour; opt-in only.
        hidePaidModels: false,
        // #9418: Opt-in filter that hides auto/* virtual combos from the /v1/models catalog.
        // User-defined combos are unaffected; routing still works for hidden ids sent explicitly.
        hideAutoCombos: false,
        // #9418: Opt-in filter that hides no-think/* gateway variants from the /v1/models catalog.
        // Routing still works for hidden ids sent explicitly.
        hideNoThinkVariants: false,
        // #6977: Opt-in per-connection auto-ping that warms a Codex OAuth connection's
        // quota window right after it resets, so the first real request doesn't land in
        // a cold window. `connections` maps connection id -> enabled. Default empty map
        // (nobody opted in) — the scheduler is a no-op until an operator flips a
        // connection on, since pinging burns a small amount of real quota (Hard Rule #20
        // spirit: never mutate/consume on the operator's behalf by default).
        codexAutoPing: {
            connections: {}
        }
    };
    for (const row of rows){
        const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(row);
        const key = typeof record.key === "string" ? record.key : null;
        const rawValue = typeof record.value === "string" ? record.value : null;
        if (!key || rawValue === null || key.startsWith("_")) continue;
        try {
            settings[key] = JSON.parse(rawValue);
        } catch  {
            settings[key] = rawValue;
        }
    }
    if (typeof settings.oidcClientSecret === "string") {
        settings.oidcClientSecret = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["decrypt"])(settings.oidcClientSecret) ?? "";
    }
    applySessionAffinityLegacyFallback(settings);
    // Auto-complete onboarding for pre-configured deployments (Docker/VM)
    // If INITIAL_PASSWORD is set via env, this is a headless deploy — skip the wizard
    if (!settings.setupComplete && process.env.INITIAL_PASSWORD) {
        settings.setupComplete = true;
        settings.requireLogin = true;
        db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('settings', 'setupComplete', 'true')").run();
        db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('settings', 'requireLogin', 'true')").run();
    }
    return settings;
}
async function updateSettings(updates, options) {
    // Detect first-time setup completion before we overwrite settings.
    let setupJustCompleted = false;
    if (updates.setupComplete === true) {
        try {
            const prev = await getSettings();
            setupJustCompleted = prev.setupComplete !== true;
        } catch  {
            setupJustCompleted = true;
        }
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const insert = db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('settings', ?, ?)");
    const tx = db.transaction(()=>{
        const currentRevision = readSettingsRevision(db);
        if (options?.expectedRevision !== undefined && options.expectedRevision !== currentRevision) {
            throw new SettingsRevisionConflictError(currentRevision);
        }
        for (const [key, value] of Object.entries(updates)){
            const toStore = key === "oidcClientSecret" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["encrypt"])(value) : value;
            insert.run(key, JSON.stringify(toStore));
        }
        insert.run(SETTINGS_REVISION_KEY, JSON.stringify(currentRevision + 1));
    });
    tx();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("settings"); // Bust the read cache immediately
    // Bust proxy resolution cache when proxy toggle settings change
    const PROXY_TOGGLE_KEYS = [
        "proxyEnabled",
        "perKeyProxyEnabled"
    ];
    if (Object.keys(updates).some((k)=>PROXY_TOGGLE_KEYS.includes(k))) {
        bumpProxyConfigGeneration();
    }
    const nextSettings = await getSettings();
    try {
        const { applyRuntimeSettings } = await __turbopack_context__.A("[project]/src/lib/config/runtimeSettings.ts [instrumentation] (ecmascript, async loader)");
        await applyRuntimeSettings(nextSettings, {
            source: "settings:update"
        });
    } catch (error) {
        console.warn("[HOT_RELOAD] Failed to apply runtime settings after update:", error instanceof Error ? error.message : error);
    }
    // Onboarding / setup finished → one-shot Codex catalog revalidation (init case).
    if (setupJustCompleted) {
        void __turbopack_context__.A("[project]/src/shared/services/codexCatalogRevalidation.ts [instrumentation] (ecmascript, async loader)").then(({ scheduleCodexCatalogRevalidationAfterInit })=>{
            scheduleCodexCatalogRevalidationAfterInit();
        }).catch(()=>{
        // non-fatal
        });
    }
    return nextSettings;
}
async function isCloudEnabled() {
    const settings = await getSettings();
    return settings.cloudEnabled === true;
}
// ──────────────── Proxy Config ────────────────
const DEFAULT_PROXY_CONFIG = {
    global: null,
    providers: {},
    combos: {},
    keys: {}
};
const ALIAS_TO_PROVIDER_ID = Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"]).reduce((acc, [providerId, alias])=>{
    if (alias) acc[alias] = providerId;
    acc[providerId] = providerId;
    return acc;
}, {});
function resolveProviderAliasOrId(providerOrAlias) {
    if (typeof providerOrAlias !== "string") return providerOrAlias;
    return ALIAS_TO_PROVIDER_ID[providerOrAlias] || providerOrAlias;
}
function getComboModelProvider(modelEntry) {
    const providerOrAlias = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getComboModelProvider"])(modelEntry);
    return providerOrAlias ? resolveProviderAliasOrId(providerOrAlias) : null;
}
function migrateProxyEntry(value) {
    if (!value) return null;
    if (typeof value === "object") {
        const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(value);
        if (record.type) return record;
    }
    if (typeof value !== "string") return null;
    try {
        const url = new URL(value);
        return {
            type: url.protocol.replace(":", "") || "http",
            host: url.hostname,
            port: url.port || (url.protocol === "socks5:" ? "1080" : url.protocol === "https:" ? "443" : "8080"),
            username: url.username ? decodeURIComponent(url.username) : "",
            password: url.password ? decodeURIComponent(url.password) : ""
        };
    } catch  {
        const parts = value.split(":");
        return {
            type: "http",
            host: parts[0] || value,
            port: parts[1] || "8080",
            username: "",
            password: ""
        };
    }
}
async function getProxyConfig() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'proxyConfig'").all();
    const raw = {
        ...DEFAULT_PROXY_CONFIG
    };
    for (const row of rows){
        const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(row);
        const key = typeof record.key === "string" ? record.key : null;
        const rawValue = typeof record.value === "string" ? record.value : null;
        if (!key || rawValue === null) continue;
        raw[key] = JSON.parse(rawValue);
    }
    let migrated = false;
    if (raw.global && typeof raw.global === "string") {
        raw.global = migrateProxyEntry(raw.global);
        migrated = true;
    }
    if (raw.providers) {
        for (const [k, v] of Object.entries(raw.providers)){
            if (typeof v === "string") {
                raw.providers[k] = migrateProxyEntry(v);
                migrated = true;
            }
        }
    }
    if (migrated) {
        const insert = db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('proxyConfig', ?, ?)");
        if (raw.global !== undefined) insert.run("global", JSON.stringify(raw.global));
        if (raw.providers) insert.run("providers", JSON.stringify(raw.providers));
    }
    return raw;
}
async function getProxyForLevel(level, id) {
    const config = await getProxyConfig();
    if (level === "global") return config.global || null;
    const map = toProxyMap(config[level + "s"] || config[level] || {});
    return (id ? map[id] : null) || null;
}
async function setProxyForLevel(level, id, proxy) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const config = await getProxyConfig();
    if (level === "global") {
        config.global = proxy || null;
        db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('proxyConfig', 'global', ?)").run(JSON.stringify(config.global));
    } else {
        const mapKey = level + "s";
        const map = toProxyMap(config[mapKey] || {});
        if (proxy && id) {
            map[id] = proxy;
        } else {
            if (id) delete map[id];
        }
        config[mapKey] = map;
        db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('proxyConfig', ?, ?)").run(mapKey, JSON.stringify(map));
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    bumpProxyConfigGeneration();
    return config;
}
async function deleteProxyForLevel(level, id) {
    return setProxyForLevel(level, id, null);
}
async function resolveProxyForConnection(connectionId, apiKeyId, providerId) {
    const cacheKey = providerId ? `${connectionId}:${apiKeyId || ""}:${providerId}` : apiKeyId ? `${connectionId}:${apiKeyId}` : connectionId;
    const startGeneration = proxyConfigGeneration;
    const startRegistryGeneration = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$registryGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getProxyRegistryGeneration"])();
    const cached = proxyResolutionCache.get(cacheKey);
    if (cached && cached.generation === startGeneration && cached.registryGeneration === startRegistryGeneration) {
        return cached.result;
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    // Step 1: Check global proxyEnabled setting
    // Read only the proxyEnabled key for performance instead of loading all settings.
    let globalProxyEnabled = true;
    try {
        const proxyEnabledRow = db.prepare("SELECT value FROM key_value WHERE namespace = 'settings' AND key = 'proxyEnabled'").get();
        if (proxyEnabledRow?.value) {
            globalProxyEnabled = JSON.parse(proxyEnabledRow.value) !== false;
        }
    } catch  {
    // Default to true on read error
    }
    if (!globalProxyEnabled) {
        const result = {
            proxy: null,
            level: "direct",
            levelId: null
        };
        // Do not cache the "direct" result when global toggle is off so that
        // toggling it back on takes effect immediately without a generation bump.
        return result;
    }
    let connectionRecord = null;
    let connectionProvider = null;
    let connectionProxyEnabled = true;
    let connectionPerKeyProxyEnabled = false;
    const row = db.prepare("SELECT provider, proxy_enabled, per_key_proxy_enabled FROM provider_connections WHERE id = ?").get(connectionId);
    if (row) {
        connectionRecord = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(row);
        connectionProvider = typeof connectionRecord.provider === "string" ? connectionRecord.provider : null;
        connectionProxyEnabled = connectionRecord.proxy_enabled !== 0;
        connectionPerKeyProxyEnabled = connectionRecord.per_key_proxy_enabled === 1;
    }
    // A connection-level Proxy Off is explicit: it must bypass every stored proxy
    // source for this connection, including account, provider, global, and automatic
    // fallback candidates from the proxy pool.
    if (connectionRecord && !connectionProxyEnabled) {
        const result = {
            proxy: null,
            level: "direct",
            levelId: null
        };
        cacheProxyResolution(cacheKey, startGeneration, startRegistryGeneration, result);
        return result;
    }
    // Step 1.5: Check global perKeyProxyEnabled setting
    let globalPerKeyProxyEnabled = false;
    try {
        const perKeyRow = db.prepare("SELECT value FROM key_value WHERE namespace = 'settings' AND key = 'perKeyProxyEnabled'").get();
        if (perKeyRow?.value) {
            globalPerKeyProxyEnabled = JSON.parse(perKeyRow.value) !== false;
        }
    } catch  {
    // Default to false on read error
    }
    const config = await getProxyConfig();
    // Step 2: API key-level proxy (only if per-key proxy is enabled globally or per-connection)
    if (apiKeyId) {
        // Check if per-key proxy is allowed: the global toggle is a true override —
        // when it is off, no connection's per-key assignment may apply, regardless
        // of that connection's own per_key_proxy_enabled flag (#8385).
        const perKeyEnabled = globalPerKeyProxyEnabled && connectionPerKeyProxyEnabled;
        if (perKeyEnabled) {
            try {
                const apiKeyRow = db.prepare("SELECT proxy_id FROM api_keys WHERE id = ?").get(apiKeyId);
                if (apiKeyRow?.proxy_id) {
                    const proxyRow = db.prepare("SELECT p.type, p.host, p.port, p.username, p.password, p.family FROM proxy_registry p WHERE p.id = ?").get(apiKeyRow.proxy_id);
                    if (proxyRow) {
                        const result = {
                            proxy: {
                                type: proxyRow.type,
                                host: proxyRow.host,
                                port: proxyRow.port,
                                username: proxyRow.username,
                                password: proxyRow.password,
                                family: typeof proxyRow.family === "string" ? proxyRow.family : "auto"
                            },
                            level: "apiKey",
                            levelId: apiKeyId,
                            source: "api_key"
                        };
                        cacheProxyResolution(cacheKey, startGeneration, startRegistryGeneration, result);
                        return result;
                    }
                }
            } catch  {
            // Fall through to existing resolution
            }
        }
    }
    // Step 3: Account-level registry
    const registryAccount = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$rotation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveProxyForScopeFromRegistry"])("account", connectionId);
    if (registryAccount?.proxy) {
        cacheProxyResolution(cacheKey, startGeneration, startRegistryGeneration, registryAccount);
        return registryAccount;
    }
    // Step 4: Legacy key-level
    if (connectionId && config.keys?.[connectionId]) {
        const result = {
            proxy: withFamilyDefault(config.keys[connectionId]),
            level: "key",
            levelId: connectionId
        };
        cacheProxyResolution(cacheKey, startGeneration, startRegistryGeneration, result);
        return result;
    }
    // Step 5: Use the connection's provider for provider/combo scoped proxies.
    if (connectionRecord) {
        // Step 6: Provider-level registry (only if proxy_enabled)
        if (connectionProvider && connectionProxyEnabled) {
            const registryProvider = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$rotation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveProxyForScopeFromRegistry"])("provider", connectionProvider);
            if (registryProvider?.proxy) {
                cacheProxyResolution(cacheKey, startGeneration, startRegistryGeneration, registryProvider);
                return registryProvider;
            }
        }
        // Step 7: Combo-level (only if proxy_enabled). For every combo whose model
        // list references this connection's provider, check the modern registry
        // (proxy_assignments, scope='combo') first — this is the assignment the
        // dashboard's Combo "Set Proxy" modal actually writes to (#7149, where the
        // registry write path and this read path had diverged, leaving combo-level
        // proxy assignment completely inert). Fall back to the legacy in-memory
        // combos map for any pre-existing legacy data.
        if (connectionProvider && connectionProxyEnabled) {
            const combos = db.prepare("SELECT id, data FROM combos").all();
            for (const comboRow of combos){
                const comboRecord = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(comboRow);
                const comboId = typeof comboRecord.id === "string" ? comboRecord.id : null;
                if (!comboId) continue;
                try {
                    const comboRaw = typeof comboRecord.data === "string" ? comboRecord.data : null;
                    if (!comboRaw) continue;
                    const combo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(JSON.parse(comboRaw));
                    const comboModels = Array.isArray(combo.models) ? combo.models : [];
                    const usesProvider = comboModels.some((entry)=>getComboModelProvider(entry) === connectionProvider);
                    if (!usesProvider) continue;
                    const registryCombo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$rotation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveProxyForScopeFromRegistry"])("combo", comboId);
                    if (registryCombo?.proxy) {
                        cacheProxyResolution(cacheKey, startGeneration, startRegistryGeneration, registryCombo);
                        return registryCombo;
                    }
                    if (config.combos?.[comboId]) {
                        const result = {
                            proxy: withFamilyDefault(config.combos[comboId]),
                            level: "combo",
                            levelId: comboId
                        };
                        cacheProxyResolution(cacheKey, startGeneration, startRegistryGeneration, result);
                        return result;
                    }
                } catch  {
                // Ignore malformed combo records during proxy resolution.
                }
            }
        }
        // Step 8: Legacy provider-level (only if proxy_enabled)
        if (connectionProvider && connectionProxyEnabled && config.providers?.[connectionProvider]) {
            const result = {
                proxy: withFamilyDefault(config.providers[connectionProvider]),
                level: "provider",
                levelId: connectionProvider
            };
            cacheProxyResolution(cacheKey, startGeneration, startRegistryGeneration, result);
            return result;
        }
    }
    // Step 8.5 (#6272): no-auth providers (mimocode, opencode, ...) share a single
    // synthetic connectionId that never matches a `provider_connections` row, so
    // `connectionRecord` above is null and Steps 5-8 (which require it) never run for
    // them — a provider-level proxy assigned to a no-auth provider was silently
    // ignored. Best-effort fallback: scan the known no-auth provider ids directly.
    if (!connectionRecord) {
        const noAuthFallback = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2f$noAuthProxyFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveNoAuthSharedProviderProxy"])(config.providers, providerId);
        if (noAuthFallback) {
            cacheProxyResolution(cacheKey, startGeneration, startRegistryGeneration, noAuthFallback);
            return noAuthFallback;
        }
    }
    // Step 9: Global registry
    const registryGlobal = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$rotation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveProxyForScopeFromRegistry"])("global");
    if (registryGlobal?.proxy) {
        cacheProxyResolution(cacheKey, startGeneration, startRegistryGeneration, registryGlobal);
        return registryGlobal;
    }
    // Step 10: Legacy global
    if (config.global) {
        const result = {
            proxy: withFamilyDefault(config.global),
            level: "global",
            levelId: null
        };
        cacheProxyResolution(cacheKey, startGeneration, startRegistryGeneration, result);
        return result;
    }
    // Step 11: Auto-selection fallback (only when global proxy is enabled)
    try {
        const { selectWorkingProxyFallback } = await __turbopack_context__.A("[project]/open-sse/utils/proxyFallback.ts [instrumentation] (ecmascript, async loader)");
        const fallback = await selectWorkingProxyFallback(connectionId);
        if (fallback) {
            // Auto-selected proxies are probed via a URL roundtrip that drops any
            // per-registry family policy, so default the family marker to "auto"
            // (no IPv6-only enforcement) when the fallback object omits it.
            const normalizedFallback = fallback.proxy && typeof fallback.proxy === "object" ? {
                ...fallback,
                proxy: withFamilyDefault(fallback.proxy)
            } : fallback;
            cacheProxyResolution(cacheKey, startGeneration, startRegistryGeneration, normalizedFallback);
            return normalizedFallback;
        }
    } catch (err) {
        console.warn({
            err,
            connectionId
        }, "Proxy fallback auto-selection failed");
    }
    // Step 12: Return direct
    return {
        proxy: null,
        level: "direct",
        levelId: null
    };
}
async function setProxyConfig(config) {
    if (config.level !== undefined) {
        const level = typeof config.level === "string" ? config.level : "global";
        const id = typeof config.id === "string" ? config.id : null;
        const proxy = config.proxy || null;
        return setProxyForLevel(level, id, proxy);
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const current = await getProxyConfig();
    const insert = db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('proxyConfig', ?, ?)");
    const tx = db.transaction(()=>{
        if (config.global !== undefined) {
            current.global = toProxyValue(config.global);
            insert.run("global", JSON.stringify(current.global));
        }
        for (const mapKey of [
            "providers",
            "combos",
            "keys"
        ]){
            if (config[mapKey]) {
                const merged = {
                    ...toProxyMap(current[mapKey]),
                    ...toProxyMap(config[mapKey])
                };
                for (const [k, v] of Object.entries(merged)){
                    if (!v) delete merged[k];
                }
                current[mapKey] = merged;
                insert.run(mapKey, JSON.stringify(merged));
            }
        }
    });
    tx();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    bumpProxyConfigGeneration();
    return current;
}
;
;
;
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/db/providers/columns.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/db/providers/deletion.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/apiKeyRotator.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningRoutingRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/reasoningRoutingRules.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providers/columns.ts [instrumentation] (ecmascript)");
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
// Purge account-scoped proxy_assignments for the deleted connections (#9232):
// orphan assignments otherwise keep routing to provider_connections that no
// longer exist. scope='account' lives in exactly this one place.
function _deleteAccountProxyAssignments(db, ids) {
    if (ids.length === 0) return;
    const placeholders = ids.map(()=>"?").join(",");
    db.prepare(`DELETE FROM proxy_assignments WHERE scope = 'account' AND scope_id IN (${placeholders})`).run(...ids);
}
async function deleteProviderConnection(id) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const existing = db.prepare("SELECT provider FROM provider_connections WHERE id = ?").get(id);
    if (!existing) return false;
    db.transaction(()=>{
        _deleteAccountProxyAssignments(db, [
            id
        ]);
        db.prepare("DELETE FROM quota_snapshots WHERE connection_id = ?").run(id);
        db.prepare("DELETE FROM provider_connections WHERE id = ?").run(id);
    })();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["removeConnectionHealth"])(id);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["removeConnectionIndex"])(id);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bumpProxyConfigGeneration"])();
    const existingRecord = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(existing);
    const providerId = typeof existingRecord.provider === "string" ? existingRecord.provider : String(existingRecord.provider || "");
    reorderConnections(db, providerId);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("connections"); // Bust connections read cache
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningRoutingRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateReasoningRoutingRuleCache"])();
    return true;
}
async function deleteProviderConnections(ids) {
    if (ids.length === 0) return 0;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const deletedCount = db.transaction(()=>{
        const placeholders = ids.map(()=>"?").join(",");
        db.prepare(`DELETE FROM quota_snapshots WHERE connection_id IN (${placeholders})`).run(...ids);
        _deleteAccountProxyAssignments(db, ids);
        const result = db.prepare(`DELETE FROM provider_connections WHERE id IN (${placeholders})`).run(...ids);
        return result.changes ?? 0;
    })();
    for (const id of ids){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["removeConnectionHealth"])(id);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["removeConnectionIndex"])(id);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("connections");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningRoutingRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateReasoningRoutingRuleCache"])();
    return deletedCount;
}
async function deleteProviderConnectionsByProvider(providerId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const connectionIds = db.prepare("SELECT id FROM provider_connections WHERE provider = ?").all(providerId).map((row)=>{
        const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(row);
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
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["removeConnectionHealth"])(connectionId);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["removeConnectionIndex"])(connectionId);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("connections");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningRoutingRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateReasoningRoutingRuleCache"])();
    return result.changes;
}
async function reorderProviderConnections(providerId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    reorderConnections(db, providerId);
}
function reorderConnections(db, providerId) {
    const rows = db.prepare("SELECT id, priority, updated_at FROM provider_connections WHERE provider = ? ORDER BY priority ASC, updated_at DESC").all(providerId);
    const update = db.prepare("UPDATE provider_connections SET priority = ? WHERE id = ?");
    rows.forEach((row, index)=>{
        const current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(row);
        update.run(index + 1, current.id);
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/db/webSessionDedup.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/usage/accountIdentity.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/db/providers/usageIdentityReconciliation.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "reconcileCodexUsageHistory",
    ()=>reconcileCodexUsageHistory
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$accountIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/accountIdentity.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$webSessionDedup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/webSessionDedup.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providers/columns.ts [instrumentation] (ecmascript)");
;
;
;
function nonEmptyString(value) {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed || null;
}
function isSafeCodexIdentityEnrichment(existing, merged) {
    const oldProviderData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$webSessionDedup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseProviderSpecificData"])(existing.provider_specific_data) || {};
    const newProviderData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$webSessionDedup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseProviderSpecificData"])(merged.providerSpecificData) || {};
    const oldUserId = nonEmptyString(oldProviderData.chatgptUserId);
    const newUserId = nonEmptyString(newProviderData.chatgptUserId);
    const oldWorkspaceId = nonEmptyString(oldProviderData.workspaceId);
    const newWorkspaceId = nonEmptyString(newProviderData.workspaceId);
    const oldEmail = nonEmptyString(existing.email);
    const newEmail = nonEmptyString(merged.email);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toStringOrNull"])(existing.provider) === "codex" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toStringOrNull"])(existing.auth_type) === "oauth" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toStringOrNull"])(merged.provider) === "codex" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toStringOrNull"])(merged.authType) === "oauth" && oldUserId === null && newUserId !== null && (oldWorkspaceId === null || oldWorkspaceId === newWorkspaceId) && (oldEmail === null || oldEmail === newEmail);
}
function reconcileCodexUsageHistory(db, input) {
    const oldIdentity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$accountIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveUsageAccountIdentity"])(input.existing);
    const newIdentity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$accountIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveUsageAccountIdentity"])(input.merged);
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
"[project]/src/lib/db/providers/migrations.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/caseMapping.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/encryption.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
;
;
;
;
function autoMigrateLegacyEncryptedConnections() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT * FROM provider_connections").all();
    let migratedCount = 0;
    for (const row of rows){
        const camelRow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["rowToCamel"])(row);
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
                const { updated, value } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["migrateLegacyEncryptedString"])(camelRow[field]);
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
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("connections");
        console.log(`[DB] Auto-migrated ${migratedCount} connection(s) to new static-salt encryption.`);
    }
    return migratedCount;
}
function getGheCopilotHosts() {
    const hosts = new Set();
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
"[project]/src/lib/db/providerNodeSelect.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/db/providers/nodes.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist-node/v4.js [instrumentation] (ecmascript) <export default as v4>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/caseMapping.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providerNodeSelect$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providerNodeSelect.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providers/columns.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
async function getProviderNodes(filter = {}, limit, offset) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
    return db.prepare(sql).all(params).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["rowToCamel"]);
}
function getProviderNodesCount(filter = {}) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT * FROM provider_nodes WHERE id = ?").get(id);
    return row ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["rowToCamel"])(row) : null;
}
async function resolveProviderNodeForConnection(idOrType) {
    const exact = await getProviderNodeById(idOrType);
    if (exact) return exact;
    const all = await getProviderNodes();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providerNodeSelect$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["selectProviderNodeForConnection"])(idOrType, all);
}
async function createProviderNode(data) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const now = new Date().toISOString();
    const customHeadersJson = data.customHeaders ? JSON.stringify(data.customHeaders) : null;
    const node = {
        id: data.id || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("nodes");
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const existing = db.prepare("SELECT * FROM provider_nodes WHERE id = ?").get(id);
    if (!existing) return null;
    const merged = {
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["rowToCamel"])(existing)),
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("nodes");
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const existing = db.prepare("SELECT * FROM provider_nodes WHERE id = ?").get(id);
    if (!existing) return null;
    db.prepare("DELETE FROM provider_nodes WHERE id = ?").run(id);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("nodes");
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["rowToCamel"])(existing);
}
}),
"[project]/src/lib/db/providers/rateLimit.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
// T13: Format a reset countdown as a human-readable string ("2h 35m" / "4m 30s").
// The implementation lives in the client-safe formatting utils so client
// components (e.g. CoolingConnectionsPanel) can import it without pulling this
// server-only DB module (better-sqlite3/ioredis) into the browser bundle.
// Re-exported here for existing server-side callers and the db/providers barrel.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/formatting.ts [instrumentation] (ecmascript)");
;
;
function setConnectionRateLimitUntil(connectionId, until) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("UPDATE provider_connections SET rate_limited_until = ?, updated_at = ? WHERE id = ?").run(until, new Date().toISOString(), connectionId);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("connections");
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT rate_limited_until FROM provider_connections WHERE id = ?").get(connectionId);
    if (!row?.rate_limited_until) return false;
    return Date.now() < row.rate_limited_until;
}
function getRateLimitedConnections(provider) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("connections");
    return {
        cleared: toReset.length
    };
}
;
}),
"[project]/src/lib/db/providers.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist-node/v4.js [instrumentation] (ecmascript) <export default as v4>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/caseMapping.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/encryption.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$lazyConnectionView$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providers/lazyConnectionView.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$deletion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providers/deletion.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/requestDefaults.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$webSessionDedup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/webSessionDedup.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$utils$2f$codexConnectionSelection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/oauth/utils/codexConnectionSelection.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$usageIdentityReconciliation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providers/usageIdentityReconciliation.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providers/columns.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$migrations$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providers/migrations.ts [instrumentation] (ecmascript)");
// ──────────────── Re-exports from leaf modules ────────────────
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$nodes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providers/nodes.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$rateLimit$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers/rateLimit.ts [instrumentation] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$deletion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$deletion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
    const raw = useCache ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedRawProviderConnections"])(filter) : await getRawProviderConnections(filter, limit, offset, columns);
    return raw.map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$lazyConnectionView$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createLazyRowProxy"]);
}
async function getRawProviderConnections(filter = {}, limit, offset, columns) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
        const camelRow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["rowToCamel"])(r);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withNullableRateLimitOverrides"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withNullableQuotaWindowThresholds"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withNullableMaxConcurrent"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["cleanNulls"])(camelRow), camelRow), camelRow), camelRow);
    });
}
function getProviderConnectionsCount(filter = {}) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT * FROM provider_connections WHERE id = ?").get(id);
    if (!row) return null;
    const camelRow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["rowToCamel"])(row);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["decryptConnectionFields"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withNullableRateLimitOverrides"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withNullableQuotaWindowThresholds"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withNullableMaxConcurrent"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["cleanNulls"])(camelRow), camelRow), camelRow), camelRow));
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
    const newCredKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$webSessionDedup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["webSessionCredentialKey"])(normalizedProviderSpecificData);
    if (!newCredKey) return null;
    const cookieRows = db.prepare("SELECT * FROM provider_connections WHERE provider = ? AND auth_type = 'cookie'").all(provider);
    for (const row of cookieRows){
        const psd = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$webSessionDedup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseProviderSpecificData"])(row.provider_specific_data);
        if (psd && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$webSessionDedup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["webSessionCredentialKey"])(psd) === newCredKey) return row;
    }
    return null;
}
async function createProviderConnection(data) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const now = new Date().toISOString();
    const normalizedProviderSpecificData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeProviderSpecificData"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toStringOrNull"])(data.provider), data.providerSpecificData);
    let existing = null;
    let promotedCodexIdentity = false;
    const providerSpecificData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(data.providerSpecificData);
    const workspaceId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toStringOrNull"])(providerSpecificData.workspaceId);
    const chatgptUserId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toStringOrNull"])(providerSpecificData.chatgptUserId);
    if (data.authType === "oauth" && data.provider === "codex" && chatgptUserId) {
        const strongSql = workspaceId ? "SELECT * FROM provider_connections WHERE provider = ? AND auth_type = 'oauth' AND json_extract(provider_specific_data, '$.workspaceId') = ? AND json_extract(provider_specific_data, '$.chatgptUserId') = ?" : "SELECT * FROM provider_connections WHERE provider = ? AND auth_type = 'oauth' AND (json_extract(provider_specific_data, '$.workspaceId') IS NULL OR json_extract(provider_specific_data, '$.workspaceId') = '') AND json_extract(provider_specific_data, '$.chatgptUserId') = ?";
        existing = (workspaceId ? db.prepare(strongSql).get(data.provider, workspaceId, chatgptUserId) : db.prepare(strongSql).get(data.provider, chatgptUserId)) || null;
        if (!existing && workspaceId) {
            const workspaceMatches = db.prepare(`SELECT * FROM provider_connections
           WHERE provider = ? AND auth_type = 'oauth'
             AND json_extract(provider_specific_data, '$.workspaceId') = ?
           ORDER BY created_at`).all(data.provider, workspaceId);
            existing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$utils$2f$codexConnectionSelection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["pickCodexConnectionForUser"])(workspaceMatches, chatgptUserId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toStringOrNull"])(data.email));
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
            const incomingUsername = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toStringOrNull"])(providerSpecificData.username);
            const emailMatches = db.prepare("SELECT * FROM provider_connections WHERE provider = ? AND auth_type = 'oauth' AND email = ?").all(data.provider, data.email);
            existing = emailMatches.find((row)=>{
                const existingUsername = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toStringOrNull"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$webSessionDedup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseProviderSpecificData"])(row.provider_specific_data)?.username);
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
                const decrypted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["decryptConnectionFields"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["rowToCamel"])(row)));
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toStringOrNull"])(decrypted.apiKey)?.trim() === newApiKey) {
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
        const existingId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toStringOrNull"])(existing.id);
        if (!existingId) return null;
        const rawExisting = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["rowToCamel"])(existing));
        const decryptedExisting = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["decryptConnectionFields"])({
            ...rawExisting
        });
        const merged = {
            ...decryptedExisting,
            ...data,
            updatedAt: now
        };
        merged.providerSpecificData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeProviderSpecificData"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toStringOrNull"])(merged.provider), merged.providerSpecificData);
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
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$usageIdentityReconciliation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["reconcileCodexUsageHistory"])(db, {
                    connectionId: existingId,
                    existing,
                    merged,
                    matchedExistingCodexByWorkspace: true
                });
            }
            _updateConnectionRow(db, existingId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["encryptConnectionFields"])(persistence));
        })();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withNullableRateLimitOverrides"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withNullableQuotaWindowThresholds"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withNullableMaxConcurrent"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["cleanNulls"])(merged), merged), merged), merged);
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
        const maxPriority = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumberOrZero"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(max).maxP);
        connectionPriority = maxPriority + 1;
    }
    const connection = {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
        provider: data.provider,
        authType: data.authType || "oauth",
        name: connectionName,
        priority: connectionPriority,
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdAt: now,
        updatedAt: now,
        proxyEnabled: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBooleanColumn"])(data.proxyEnabled, true),
        perKeyProxyEnabled: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBooleanColumn"])(data.perKeyProxyEnabled, false),
        quotaVisible: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBooleanColumn"])(data.quotaVisible, true)
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
        connection.quotaWindowThresholds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeQuotaWindowThresholds"])(connection.quotaWindowThresholds);
    }
    // Same sanitization for rateLimitOverrides — keep in-memory representation
    // in sync with what gets persisted.
    if ("rateLimitOverrides" in connection) {
        connection.rateLimitOverrides = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeRateLimitOverrides"])(connection.rateLimitOverrides);
    }
    _insertConnectionRow(db, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["encryptConnectionFields"])({
        ...connection
    }));
    const providerId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toStringOrNull"])(data.provider);
    if (providerId) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$deletion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["reorderConnections"])(db, providerId);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("connections"); // Bust connections read cache
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withNullableRateLimitOverrides"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withNullableQuotaWindowThresholds"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withNullableMaxConcurrent"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["cleanNulls"])(connection), connection), connection), connection);
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
        proxyEnabled: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBooleanColumn"])(conn.proxyEnabled, true) ? 1 : 0,
        perKeyProxyEnabled: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBooleanColumn"])(conn.perKeyProxyEnabled, false) ? 1 : 0,
        quotaVisible: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBooleanColumn"])(conn.quotaVisible, true) ? 1 : 0,
        quotaWindowThresholdsJson: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["serializeJsonField"])(conn.quotaWindowThresholds),
        rateLimitOverridesJson: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["serializeJsonField"])(conn.rateLimitOverrides),
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
        quotaWindowThresholdsJson: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["serializeJsonField"])(data.quotaWindowThresholds),
        proxyEnabled: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBooleanColumn"])(data.proxyEnabled, true) ? 1 : 0,
        perKeyProxyEnabled: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBooleanColumn"])(data.perKeyProxyEnabled, false) ? 1 : 0,
        quotaVisible: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBooleanColumn"])(data.quotaVisible, true) ? 1 : 0,
        rateLimitOverridesJson: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["serializeJsonField"])(data.rateLimitOverrides),
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const existing = db.prepare("SELECT * FROM provider_connections WHERE id = ?").get(id);
    if (!existing) return null;
    const merged = {
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["rowToCamel"])(existing)),
        ...data,
        updatedAt: new Date().toISOString()
    };
    merged.providerSpecificData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeProviderSpecificData"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toStringOrNull"])(merged.provider), merged.providerSpecificData);
    // Mirror the sanitization the create path applies — keep the returned
    // object in lockstep with what we persist.
    if ("quotaWindowThresholds" in merged) {
        const sanitized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeQuotaWindowThresholds"])(merged.quotaWindowThresholds);
        // For updates we always carry the key forward (even as null) so the read
        // path surfaces the cleared state to callers that just patched it.
        merged.quotaWindowThresholds = sanitized;
    }
    if ("rateLimitOverrides" in merged) {
        merged.rateLimitOverrides = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeRateLimitOverrides"])(merged.rateLimitOverrides);
    }
    const existingRecord = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(existing);
    db.transaction(()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$usageIdentityReconciliation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["reconcileCodexUsageHistory"])(db, {
            connectionId: id,
            existing: existingRecord,
            merged
        });
        _updateConnectionRow(db, id, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["encryptConnectionFields"])({
            ...merged
        }));
    })();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("connections"); // Bust connections read cache
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bumpProxyConfigGeneration"])();
    if (data.priority !== undefined) {
        const existingRecord = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(existing);
        const providerId = typeof existingRecord.provider === "string" ? existingRecord.provider : String(existingRecord.provider || "");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$deletion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["reorderConnections"])(db, providerId);
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withNullableRateLimitOverrides"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withNullableQuotaWindowThresholds"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withNullableMaxConcurrent"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["cleanNulls"])(merged), merged), merged), merged);
}
async function clearConnectionErrorIfUnchanged(id, expected) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("connections");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bumpProxyConfigGeneration"])();
    }
    return applied;
}
async function touchConnectionLastUsed(id, consecutiveUseCount) {
    if (!id) return;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("connections");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bumpProxyConfigGeneration"])();
}
async function cleanupProviderConnections() {
    return 0;
}
async function getDistinctGroups() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare('SELECT DISTINCT "group" FROM provider_connections WHERE "group" IS NOT NULL ORDER BY "group"').all();
    return rows.map((r)=>String(r.group ?? "")).filter(Boolean);
}
;
;
;
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/usage/usageHistory/helpers.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * Pure, stateless helpers extracted from usageHistory.ts.
 * No DB access, no module-level state — safe to import anywhere.
 */ // #7879: re-export the canonical helper so existing consumers of this module
// keep importing `toNumber` from here unchanged.
__turbopack_context__.s([
    "MAX_PREVIEW_ARRAY_ITEMS",
    ()=>MAX_PREVIEW_ARRAY_ITEMS,
    "MAX_PREVIEW_DEPTH",
    ()=>MAX_PREVIEW_DEPTH,
    "MAX_PREVIEW_OBJECT_KEYS",
    ()=>MAX_PREVIEW_OBJECT_KEYS,
    "MAX_PREVIEW_STRING",
    ()=>MAX_PREVIEW_STRING,
    "accumulateLatencySample",
    ()=>accumulateLatencySample,
    "asRecord",
    ()=>asRecord,
    "buildLatencyStatsEntry",
    ()=>buildLatencyStatsEntry,
    "createLatencyBucket",
    ()=>createLatencyBucket,
    "mean",
    ()=>mean,
    "normalizeServiceTier",
    ()=>normalizeServiceTier,
    "percentile",
    ()=>percentile,
    "resolvePositiveOption",
    ()=>resolvePositiveOption,
    "stdDev",
    ()=>stdDev,
    "toStringOrNull",
    ()=>toStringOrNull,
    "truncatePendingPreview",
    ()=>truncatePendingPreview
]);
;
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toStringOrNull(value) {
    return typeof value === "string" && value.trim().length > 0 ? value : null;
}
function normalizeServiceTier(value) {
    const tier = typeof value === "string" ? value.trim().toLowerCase() : "";
    if (tier === "priority" || tier === "fast") return "priority";
    if (tier === "flex") return "flex";
    return "standard";
}
function percentile(sortedValues, p) {
    if (sortedValues.length === 0) return 0;
    if (sortedValues.length === 1) return sortedValues[0];
    const bounded = Math.max(0, Math.min(1, p));
    const idx = Math.round((sortedValues.length - 1) * bounded);
    return sortedValues[idx] ?? sortedValues[sortedValues.length - 1];
}
function stdDev(values, avg) {
    if (values.length <= 1) return 0;
    const variance = values.reduce((acc, v)=>acc + (v - avg) ** 2, 0) / values.length;
    return Math.sqrt(Math.max(0, variance));
}
function mean(values) {
    return values.length > 0 ? values.reduce((acc, n)=>acc + n, 0) / values.length : 0;
}
function resolvePositiveOption(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : fallback;
}
function accumulateLatencySample(buckets, latencyMs, ttftMs, tokensOutput, isSuccess) {
    if (latencyMs <= 0) return;
    buckets.allLatencies.push(latencyMs);
    if (ttftMs > 0) buckets.allTtfts.push(ttftMs);
    if (tokensOutput > 0) buckets.allTps.push(tokensOutput / (latencyMs / 1000));
    if (!isSuccess) return;
    buckets.successfulLatencies.push(latencyMs);
    if (ttftMs > 0) buckets.successfulTtfts.push(ttftMs);
    if (tokensOutput > 0) buckets.successfulTps.push(tokensOutput / (latencyMs / 1000));
}
function createLatencyBucket(provider, model) {
    return {
        provider,
        model,
        totalRequests: 0,
        successfulRequests: 0,
        successfulLatencies: [],
        allLatencies: [],
        successfulTtfts: [],
        allTtfts: [],
        successfulTps: [],
        allTps: []
    };
}
function buildLatencyStatsEntry(key, bucket, minSamples, windowHours) {
    const useSuccessful = bucket.successfulLatencies.length >= minSamples;
    const baseLatencies = useSuccessful ? bucket.successfulLatencies : bucket.allLatencies;
    if (baseLatencies.length < minSamples) return null;
    const baseTtfts = useSuccessful ? bucket.successfulTtfts : bucket.allTtfts;
    const baseTps = useSuccessful ? bucket.successfulTps : bucket.allTps;
    const sorted = [
        ...baseLatencies
    ].sort((a, b)=>a - b);
    const avg = mean(sorted);
    const successRate = bucket.totalRequests > 0 ? bucket.successfulRequests / bucket.totalRequests : 0;
    return {
        provider: bucket.provider,
        model: bucket.model,
        key,
        totalRequests: bucket.totalRequests,
        successfulRequests: bucket.successfulRequests,
        successRate,
        avgLatencyMs: Math.round(avg),
        p50LatencyMs: Math.round(percentile(sorted, 0.5)),
        p95LatencyMs: Math.round(percentile(sorted, 0.95)),
        p99LatencyMs: Math.round(percentile(sorted, 0.99)),
        latencyStdDev: Math.round(stdDev(sorted, avg)),
        windowHours,
        avgTtftMs: Math.round(mean(baseTtfts)),
        avgE2ELatencyMs: Math.round(avg),
        avgTokensPerSecond: Math.round(mean(baseTps) * 100) / 100
    };
}
const MAX_PREVIEW_DEPTH = 6;
const MAX_PREVIEW_STRING = 1200;
const MAX_PREVIEW_ARRAY_ITEMS = 12;
const MAX_PREVIEW_OBJECT_KEYS = 24;
function truncatePendingPreview(value, depth = 0) {
    if (depth >= MAX_PREVIEW_DEPTH) {
        return "[TRUNCATED_DEPTH]";
    }
    if (typeof value === "string") {
        return value.length > MAX_PREVIEW_STRING ? `${value.slice(0, MAX_PREVIEW_STRING)}...` : value;
    }
    if (Array.isArray(value)) {
        const preview = value.slice(0, MAX_PREVIEW_ARRAY_ITEMS).map((item)=>truncatePendingPreview(item, depth + 1));
        if (value.length > MAX_PREVIEW_ARRAY_ITEMS) {
            preview.push({
                _truncatedItems: value.length - MAX_PREVIEW_ARRAY_ITEMS
            });
        }
        return preview;
    }
    if (!value || typeof value !== "object") {
        return value;
    }
    const entries = Object.entries(value);
    const truncatedEntries = entries.slice(0, MAX_PREVIEW_OBJECT_KEYS).map(([key, entryValue])=>[
            key,
            truncatePendingPreview(entryValue, depth + 1)
        ]);
    const preview = Object.fromEntries(truncatedEntries);
    if (entries.length > MAX_PREVIEW_OBJECT_KEYS) {
        preview._truncatedKeys = entries.length - MAX_PREVIEW_OBJECT_KEYS;
    }
    return preview;
}
}),
"[project]/src/lib/usage/completedRequestDetails.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearCompletedDetails",
    ()=>clearCompletedDetails,
    "getCompletedDetails",
    ()=>getCompletedDetails,
    "maybeEnrichCompletedDetail",
    ()=>maybeEnrichCompletedDetail,
    "scheduleCompletedDetailCleanup",
    ()=>scheduleCompletedDetailCleanup,
    "storeCompletedDetail",
    ()=>storeCompletedDetail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
;
const COMPLETED_DETAIL_TTL_MS = 120_000;
const MAX_COMPLETED_DETAILS = 256;
const completedDetails = new Map();
const completedDetailTimers = new Map();
function deleteCompletedDetail(id) {
    completedDetails.delete(id);
    const existingTimer = completedDetailTimers.get(id);
    if (existingTimer) {
        clearTimeout(existingTimer);
        completedDetailTimers.delete(id);
    }
}
function trimCompletedDetails() {
    while(completedDetails.size > MAX_COMPLETED_DETAILS){
        const oldestId = completedDetails.keys().next().value;
        if (!oldestId) break;
        deleteCompletedDetail(oldestId);
    }
}
function getCompletedDetails() {
    return completedDetails;
}
function storeCompletedDetail(detail) {
    completedDetails.set(detail.id, detail);
    trimCompletedDetails();
}
function scheduleCompletedDetailCleanup(id) {
    const existingTimer = completedDetailTimers.get(id);
    if (existingTimer) clearTimeout(existingTimer);
    const timer = setTimeout(()=>{
        completedDetails.delete(id);
        completedDetailTimers.delete(id);
    }, COMPLETED_DETAIL_TTL_MS);
    timer.unref?.();
    completedDetailTimers.set(id, timer);
}
function clearCompletedDetails() {
    for (const timer of completedDetailTimers.values())clearTimeout(timer);
    completedDetailTimers.clear();
    completedDetails.clear();
}
function maybeEnrichCompletedDetail(updated, connectionId) {
    void (async ()=>{
        try {
            const missingProvider = updated.providerResponse === undefined || updated.providerResponse === null;
            const missingClient = updated.clientResponse === undefined || updated.clientResponse === null;
            if (!missingProvider && !missingClient) return;
            const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
            const sinceIso = new Date(Date.now() - 30_000).toISOString();
            const rows = db.prepare(`SELECT artifact_relpath FROM call_logs WHERE connection_id = ? AND model = ? AND timestamp >= ? ORDER BY timestamp DESC LIMIT 5`).all(connectionId, updated.model, sinceIso);
            for (const row of rows){
                if (!row.artifact_relpath) continue;
                const { readCallArtifact } = await __turbopack_context__.A("[project]/src/lib/usage/callLogArtifacts.ts [instrumentation] (ecmascript, async loader)");
                const art = readCallArtifact(row.artifact_relpath);
                if (art.state !== "ready" || !art.artifact) continue;
                const pipeline = art.artifact.pipeline;
                if (missingProvider && pipeline?.providerResponse) {
                    updated.providerResponse = pipeline.providerResponse;
                }
                if (missingClient && pipeline?.clientResponse) {
                    updated.clientResponse = pipeline.clientResponse;
                }
                if (missingProvider && art.artifact.responseBody || missingClient && art.artifact.responseBody) {
                    if (missingProvider) updated.providerResponse = art.artifact.responseBody;
                    if (missingClient) updated.clientResponse = art.artifact.responseBody;
                }
                if (updated.providerResponse || updated.clientResponse) {
                    if (completedDetails.has(updated.id)) storeCompletedDetail(updated);
                    break;
                }
            }
        } catch (e) {
            try {
                console.warn("[usageHistory] failed to enrich completed detail from artifacts:", e && (e.message || e));
            } catch  {}
        }
    })();
}
}),
"[project]/src/lib/usage/migrations.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "CALL_LOGS_DIR",
    ()=>CALL_LOGS_DIR,
    "LOG_ARCHIVES_DIR",
    ()=>LOG_ARCHIVES_DIR,
    "archiveLegacyRequestLogs",
    ()=>archiveLegacyRequestLogs,
    "migrateLegacyUsageFiles",
    ()=>migrateLegacyUsageFiles,
    "migrateUsageJsonToSqlite",
    ()=>migrateUsageJsonToSqlite,
    "shouldPersistToDisk",
    ()=>shouldPersistToDisk
]);
// @ts-nocheck
/**
 * Usage Migrations — extracted from usageDb.js (T-15)
 *
 * Handles legacy file migration (.data → data/), JSON → SQLite migration,
 * and one-time archival of legacy request log layouts into a zip backup.
 *
 * @module lib/usage/migrations
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$yazl$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/yazl/index.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dataPaths.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logEnv.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logPayloads.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/piiSanitizer.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogArtifacts.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$accountIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/accountIdentity.ts [instrumentation] (ecmascript)");
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
const shouldPersistToDisk = !__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] && !__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isBuildPhase"];
const LEGACY_DATA_DIR = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getLegacyDotDataDir"])();
const CALL_LOGS_DIR = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DATA_DIR"], "call_logs");
const LOG_ARCHIVES_DIR = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DATA_DIR"], "log_archives");
const LEGACY_LAYOUT_MARKER = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] || !LOG_ARCHIVES_DIR ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(LOG_ARCHIVES_DIR, "legacy-request-logs.json");
const CURRENT_REQUEST_LOGS_DIR = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DATA_DIR"], "logs");
const CURRENT_REQUEST_SUMMARY_FILE = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DATA_DIR"], "log.txt");
// Legacy paths
const LEGACY_DB_FILE = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] || !LEGACY_DATA_DIR ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(LEGACY_DATA_DIR, "usage.json");
const LEGACY_CALL_LOGS_DB_FILE = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] || !LEGACY_DATA_DIR ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(LEGACY_DATA_DIR, "call_logs.json");
// Current-location JSON files (for migration into SQLite)
const USAGE_JSON_FILE = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DATA_DIR"], "usage.json");
const CALL_LOGS_JSON_FILE = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DATA_DIR"], "call_logs.json");
function buildLegacyRequestSummary(requestType, requestBody) {
    if (requestType !== "search" || !requestBody || typeof requestBody !== "object") return null;
    const record = requestBody;
    const summary = {};
    if (typeof record.query === "string" && record.query.trim().length > 0) {
        summary.query = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizePII"])(record.query).text;
    }
    const filters = Object.fromEntries(Object.entries(record).filter(([key])=>key !== "query" && key !== "provider"));
    if (Object.keys(filters).length > 0) {
        summary.filters = filters;
    }
    return Object.keys(summary).length > 0 ? JSON.stringify(summary) : null;
}
function copyIfMissing(fromPath, toPath, label) {
    if (!fromPath || !toPath) return;
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(fromPath) || __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(toPath)) return;
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].statSync(fromPath).isDirectory()) {
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].cpSync(fromPath, toPath, {
            recursive: true
        });
    } else {
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].copyFileSync(fromPath, toPath);
    }
    console.log(`[usageDb] Migrated ${label}: ${fromPath} -> ${toPath}`);
}
function containsLegacyCallLogLayout(dirPath) {
    if (!dirPath || !__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(dirPath)) return false;
    try {
        const topLevelEntries = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readdirSync(dirPath);
        for (const topLevelEntry of topLevelEntries){
            const topLevelPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(dirPath, topLevelEntry);
            const stat = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].statSync(topLevelPath);
            if (stat.isFile() && /^\d{6}_.+_\d{3}\.json$/i.test(topLevelEntry)) {
                return true;
            }
            if (!stat.isDirectory()) {
                continue;
            }
            const nestedEntries = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readdirSync(topLevelPath);
            for (const nestedEntry of nestedEntries){
                if (/^\d{6}_.+_\d{3}\.json$/i.test(nestedEntry)) {
                    return true;
                }
            }
        }
    } catch  {
        return false;
    }
    return false;
}
function ensureArchiveDir() {
    if (!LOG_ARCHIVES_DIR) return;
    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(LOG_ARCHIVES_DIR, {
        recursive: true
    });
}
/**
 * Directory the live file logger writes to (`buildLogger()` in
 * `src/shared/utils/logger.ts`), so the legacy-log sweep below never zips-then-deletes
 * a directory it does not own. Since PR #6234 (fix for #6197) the default app log path
 * moved from a `process.cwd()`-anchored location to `DATA_DIR/logs/application/app.log`,
 * landing it inside the same `DATA_DIR/logs` tree this "legacy" migration sweeps (#6799).
 */ function getLiveAppLogDir() {
    try {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].dirname((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAppLogFilePath"])());
    } catch  {
        return null;
    }
}
function listRequestLogArchiveEntries() {
    if (!CURRENT_REQUEST_LOGS_DIR || !__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(CURRENT_REQUEST_LOGS_DIR)) return [];
    const liveAppLogDir = getLiveAppLogDir();
    const entries = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readdirSync(CURRENT_REQUEST_LOGS_DIR);
    const targets = [];
    for (const entry of entries){
        const entryPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(CURRENT_REQUEST_LOGS_DIR, entry);
        if (liveAppLogDir && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isSamePath"])(entryPath, liveAppLogDir)) continue;
        targets.push({
            sourcePath: entryPath,
            archiveRoot: __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].posix.join("data/logs", entry),
            deleteAfterArchive: true
        });
    }
    return targets;
}
function listArchiveTargets() {
    const targets = listRequestLogArchiveEntries();
    if (CURRENT_REQUEST_SUMMARY_FILE && __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(CURRENT_REQUEST_SUMMARY_FILE)) {
        targets.push({
            sourcePath: CURRENT_REQUEST_SUMMARY_FILE,
            archiveRoot: "data/log.txt",
            deleteAfterArchive: true
        });
    }
    if (CALL_LOGS_DIR && containsLegacyCallLogLayout(CALL_LOGS_DIR)) {
        targets.push({
            sourcePath: CALL_LOGS_DIR,
            archiveRoot: "data/call_logs",
            deleteAfterArchive: true
        });
    }
    return targets;
}
function addPathToZip(zipFile, sourcePath, archivePath) {
    const stat = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].statSync(sourcePath);
    if (stat.isDirectory()) {
        const entries = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readdirSync(sourcePath);
        if (entries.length === 0) {
            zipFile.addEmptyDirectory(archivePath);
            return;
        }
        for (const entry of entries){
            addPathToZip(zipFile, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(sourcePath, entry), __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].posix.join(archivePath, entry));
        }
        return;
    }
    zipFile.addFile(sourcePath, archivePath);
}
function createLegacyArchive(targets) {
    return new Promise((resolve, reject)=>{
        if (!LOG_ARCHIVES_DIR) {
            reject(new Error("LOG_ARCHIVES_DIR is not configured"));
            return;
        }
        ensureArchiveDir();
        const timestamp = new Date().toISOString().replace(/[:]/g, "-");
        const archiveFilename = `${timestamp}_legacy-request-logs.zip`;
        const archivePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(LOG_ARCHIVES_DIR, archiveFilename);
        const zipFile = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$yazl$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ZipFile"]();
        const output = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].createWriteStream(archivePath);
        let settled = false;
        // yazl detects a stat->stream size mismatch (a file growing while being zipped, e.g.
        // an actively-written log — #6401) by emitting "error" on the ZipFile instance itself,
        // not on `output`. Left unwired, that "error" event has no listener and Node re-throws
        // it as an uncaughtException that crashes the process. Wiring it here converts that
        // crash into a normal rejection the caller's try/catch already handles.
        const fail = (error)=>{
            if (settled) return;
            settled = true;
            output.destroy();
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].rmSync(archivePath, {
                force: true
            });
            reject(error);
        };
        output.on("close", ()=>{
            if (settled) return;
            settled = true;
            resolve(archiveFilename);
        });
        output.on("error", fail);
        zipFile.on("error", fail);
        zipFile.outputStream.pipe(output);
        try {
            for (const target of targets){
                addPathToZip(zipFile, target.sourcePath, target.archiveRoot);
            }
            zipFile.end();
        } catch (error) {
            fail(error);
        }
    });
}
function writeLegacyLayoutMarker(archiveFilename) {
    if (!LEGACY_LAYOUT_MARKER) return;
    ensureArchiveDir();
    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(LEGACY_LAYOUT_MARKER, JSON.stringify({
        migratedAt: new Date().toISOString(),
        archiveFilename
    }, null, 2));
}
function deleteArchivedTargets(targets) {
    for (const target of targets){
        if (!target.deleteAfterArchive || !__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(target.sourcePath)) {
            continue;
        }
        const stat = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].statSync(target.sourcePath);
        if (stat.isDirectory()) {
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].rmSync(target.sourcePath, {
                recursive: true,
                force: true
            });
        } else {
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].rmSync(target.sourcePath, {
                force: true
            });
        }
    }
}
function migrateLegacyUsageFiles() {
    if (!shouldPersistToDisk || !LEGACY_DATA_DIR) return;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isSamePath"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DATA_DIR"], LEGACY_DATA_DIR)) return;
    try {
        copyIfMissing(LEGACY_DB_FILE, USAGE_JSON_FILE, "usage history");
        copyIfMissing(LEGACY_CALL_LOGS_DB_FILE, CALL_LOGS_JSON_FILE, "call log index");
    } catch (error) {
        console.error("[usageDb] Legacy migration failed:", error.message);
    }
}
async function archiveLegacyRequestLogs() {
    if (!shouldPersistToDisk) return null;
    if (LEGACY_LAYOUT_MARKER && __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(LEGACY_LAYOUT_MARKER)) return null;
    const targets = listArchiveTargets();
    if (targets.length === 0) return null;
    const archiveFilename = await createLegacyArchive(targets);
    deleteArchivedTargets(targets);
    writeLegacyLayoutMarker(archiveFilename);
    console.log(`[usageDb] Archived legacy request logs to ${archiveFilename}`);
    return archiveFilename;
}
function migrateUsageJsonToSqlite() {
    if (!shouldPersistToDisk) return;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    if (USAGE_JSON_FILE && __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(USAGE_JSON_FILE)) {
        try {
            const raw = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(USAGE_JSON_FILE, "utf-8");
            const data = JSON.parse(raw);
            const history = data.history || [];
            if (history.length > 0) {
                console.log(`[usageDb] Migrating ${history.length} usage entries from JSON → SQLite...`);
                const insert = db.prepare(`
          INSERT INTO usage_history (provider, model, connection_id, account_key, account_label,
            account_label_priority, api_key_id, api_key_name, tokens_input, tokens_output,
            tokens_cache_read, tokens_cache_creation, tokens_reasoning, status, success, latency_ms,
            ttft_ms, error_code, combo_strategy, timestamp)
          VALUES (@provider, @model, @connectionId, @accountKey, @accountLabel,
            @accountLabelPriority, @apiKeyId, @apiKeyName, @tokensInput, @tokensOutput,
            @tokensCacheRead, @tokensCacheCreation, @tokensReasoning, @status, @success,
            @latencyMs, @ttftMs, @errorCode, @comboStrategy, @timestamp)
        `);
                const findConnection = db.prepare("SELECT * FROM provider_connections WHERE id = ?");
                const tx = db.transaction(()=>{
                    for (const entry of history){
                        const connectionId = entry.connectionId || entry.connection_id || null;
                        const connection = connectionId ? findConnection.get(connectionId) : null;
                        const fallbackIdentity = connection ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$accountIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveUsageAccountIdentity"])(connection) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$accountIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveOrphanedUsageAccountIdentity"])(entry.provider, connectionId);
                        const identity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$accountIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveImportedUsageAccountIdentity"])(entry, fallbackIdentity);
                        insert.run({
                            provider: entry.provider || null,
                            model: entry.model || null,
                            connectionId,
                            accountKey: identity.accountKey,
                            accountLabel: identity.accountLabel,
                            accountLabelPriority: identity.accountLabelPriority,
                            apiKeyId: entry.apiKeyId || null,
                            apiKeyName: entry.apiKeyName || null,
                            tokensInput: entry.tokens?.input ?? entry.tokens?.prompt_tokens ?? entry.tokens?.in ?? 0,
                            tokensOutput: entry.tokens?.output ?? entry.tokens?.completion_tokens ?? entry.tokens?.out ?? 0,
                            tokensCacheRead: entry.tokens?.cacheRead ?? entry.tokens?.cached_tokens ?? 0,
                            tokensCacheCreation: entry.tokens?.cacheCreation ?? entry.tokens?.cache_creation_input_tokens ?? 0,
                            tokensReasoning: entry.tokens?.reasoning ?? entry.tokens?.reasoning_tokens ?? 0,
                            status: entry.status || null,
                            success: entry.success === false ? 0 : 1,
                            latencyMs: Number.isFinite(Number(entry.latencyMs)) ? Number(entry.latencyMs) : 0,
                            ttftMs: Number.isFinite(Number(entry.timeToFirstTokenMs)) ? Number(entry.timeToFirstTokenMs) : Number.isFinite(Number(entry.latencyMs)) ? Number(entry.latencyMs) : 0,
                            errorCode: entry.errorCode || null,
                            comboStrategy: entry.comboStrategy || entry.combo_strategy || "direct",
                            timestamp: entry.timestamp || new Date().toISOString()
                        });
                    }
                });
                tx();
                console.log(`[usageDb] ✓ Migrated ${history.length} usage entries`);
            }
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].renameSync(USAGE_JSON_FILE, `${USAGE_JSON_FILE}.migrated`);
        } catch (error) {
            console.error("[usageDb] Failed to migrate usage.json:", error.message);
        }
    }
    if (CALL_LOGS_JSON_FILE && __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(CALL_LOGS_JSON_FILE)) {
        try {
            const raw = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(CALL_LOGS_JSON_FILE, "utf-8");
            const data = JSON.parse(raw);
            const logs = data.logs || [];
            if (logs.length > 0) {
                console.log(`[usageDb] Migrating ${logs.length} call log entries from JSON → SQLite...`);
                const insert = db.prepare(`
          INSERT OR IGNORE INTO call_logs (id, timestamp, method, path, status, model, requested_model, provider,
            account, connection_id, duration, tokens_in, tokens_out, source_format, target_format,
            api_key_id, api_key_name, combo_name, combo_step_id, combo_execution_key, error_summary,
            detail_state, artifact_relpath, artifact_size_bytes, artifact_sha256,
            has_request_body, has_response_body, has_pipeline_details, request_summary)
          VALUES (@id, @timestamp, @method, @path, @status, @model, @requestedModel, @provider,
            @account, @connectionId, @duration, @tokensIn, @tokensOut, @sourceFormat, @targetFormat,
            @apiKeyId, @apiKeyName, @comboName, @comboStepId, @comboExecutionKey, @errorSummary,
            @detailState, @artifactRelPath, @artifactSizeBytes, @artifactSha256,
            @hasRequestBody, @hasResponseBody, @hasPipelineDetails, @requestSummary)
        `);
                const tx = db.transaction(()=>{
                    for (const log of logs){
                        const id = log.id || `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
                        const timestamp = log.timestamp || new Date().toISOString();
                        const protectedRequestBody = log.requestBody ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(log.requestBody) : null;
                        const protectedResponseBody = log.responseBody ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(log.responseBody) : null;
                        const protectedError = log.error && typeof log.error === "object" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(log.error) : log.error || null;
                        const detailExpected = protectedRequestBody !== null || protectedResponseBody !== null || protectedError !== null;
                        let detailState = "none";
                        let artifactRelPath = null;
                        let artifactSizeBytes = null;
                        let artifactSha256 = null;
                        if (detailExpected) {
                            const artifact = {
                                schemaVersion: 5,
                                summary: {
                                    id,
                                    timestamp,
                                    method: log.method || "POST",
                                    path: log.path || "/v1/chat/completions",
                                    status: log.status || 0,
                                    model: log.model || "-",
                                    requestedModel: log.requestedModel || null,
                                    provider: log.provider || "-",
                                    account: log.account || "-",
                                    connectionId: log.connectionId || null,
                                    duration: log.duration || 0,
                                    tokens: {
                                        in: log.tokens?.in ?? 0,
                                        out: log.tokens?.out ?? 0,
                                        cacheRead: null,
                                        cacheWrite: null,
                                        reasoning: null
                                    },
                                    requestType: log.requestType || null,
                                    sourceFormat: log.sourceFormat || null,
                                    targetFormat: log.targetFormat || null,
                                    apiKeyId: log.apiKeyId || null,
                                    apiKeyName: log.apiKeyName || null,
                                    comboName: log.comboName || null,
                                    comboStepId: log.comboStepId || null,
                                    comboExecutionKey: log.comboExecutionKey || null
                                },
                                requestBody: protectedRequestBody,
                                responseBody: protectedResponseBody,
                                error: protectedError
                            };
                            const artifactResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["writeCallArtifact"])(artifact);
                            if (artifactResult) {
                                detailState = "ready";
                                artifactRelPath = artifactResult.relPath;
                                artifactSizeBytes = artifactResult.sizeBytes;
                                artifactSha256 = artifactResult.sha256;
                            } else {
                                detailState = "missing";
                            }
                        }
                        insert.run({
                            id,
                            timestamp,
                            method: log.method || "POST",
                            path: log.path || null,
                            status: log.status || 0,
                            model: log.model || null,
                            requestedModel: log.requestedModel || null,
                            provider: log.provider || null,
                            account: log.account || null,
                            connectionId: log.connectionId || null,
                            duration: log.duration || 0,
                            tokensIn: log.tokens?.in ?? 0,
                            tokensOut: log.tokens?.out ?? 0,
                            sourceFormat: log.sourceFormat || null,
                            targetFormat: log.targetFormat || null,
                            apiKeyId: log.apiKeyId || null,
                            apiKeyName: log.apiKeyName || null,
                            comboName: log.comboName || null,
                            comboStepId: log.comboStepId || null,
                            comboExecutionKey: log.comboExecutionKey || log.comboStepId || null,
                            errorSummary: typeof protectedError === "string" ? protectedError.slice(0, 4000) : protectedError ? JSON.stringify(protectedError).slice(0, 4000) : null,
                            detailState,
                            artifactRelPath,
                            artifactSizeBytes,
                            artifactSha256,
                            hasRequestBody: protectedRequestBody ? 1 : 0,
                            hasResponseBody: protectedResponseBody ? 1 : 0,
                            hasPipelineDetails: 0,
                            requestSummary: buildLegacyRequestSummary(log.requestType, protectedRequestBody)
                        });
                    }
                });
                tx();
                console.log(`[usageDb] ✓ Migrated ${logs.length} call log entries`);
            }
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].renameSync(CALL_LOGS_JSON_FILE, `${CALL_LOGS_JSON_FILE}.migrated`);
        } catch (error) {
            console.error("[usageDb] Failed to migrate call_logs.json:", error.message);
        }
    }
}
migrateLegacyUsageFiles();
if (shouldPersistToDisk) {
    try {
        await archiveLegacyRequestLogs();
    } catch (error) {
        console.error("[usageDb] Failed to archive legacy request logs:", error.message);
    }
    try {
        migrateUsageJsonToSqlite();
    } catch  {
    // Best-effort startup migration.
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/src/lib/usage/usageEvents.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Lightweight usage-event bus.
 *
 * Decouples usage recording (usageHistory.ts) from the provider-limits
 * subsystem (providerLimits.ts). usageHistory must NOT import providerLimits:
 * providerLimits pulls in the executors barrel (and the whole translator graph),
 * so a direct or dynamic import from usageHistory expands the type-check surface
 * across modules that have nothing to do with usage recording. usageHistory
 * emits here; providerLimits subscribes at module load.
 *
 * @module lib/usage/usageEvents
 */ __turbopack_context__.s([
    "emitUsageRecorded",
    ()=>emitUsageRecorded,
    "onStatsEvent",
    ()=>onStatsEvent,
    "onUsageRecorded",
    ()=>onUsageRecorded,
    "scheduleStatsEvent",
    ()=>scheduleStatsEvent
]);
const listeners = new Set();
function onUsageRecorded(listener) {
    listeners.add(listener);
    return ()=>{
        listeners.delete(listener);
    };
}
function emitUsageRecorded(provider, connectionId) {
    if (!provider || !connectionId) return;
    for (const listener of listeners){
        try {
            listener(provider, connectionId);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn(`[usageEvents] usage-recorded listener failed: ${message}`);
        }
    }
}
const statsEmitTimers = {
    update: null,
    pending: null
};
const statsListeners = {
    update: new Set(),
    pending: new Set()
};
function onStatsEvent(event, listener) {
    statsListeners[event].add(listener);
    return ()=>{
        statsListeners[event].delete(listener);
    };
}
function scheduleStatsEvent(event, delayMs = 200) {
    if (statsEmitTimers[event] != null) return;
    statsEmitTimers[event] = setTimeout(()=>{
        statsEmitTimers[event] = null;
        for (const listener of statsListeners[event]){
            try {
                listener();
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                console.warn(`[usageEvents] stats listener (${event}) failed: ${message}`);
            }
        }
    }, delayMs);
    // Allow Node.js to exit naturally even if the timer is still pending
    // (avoids keeping the event loop alive for a stray stats notification).
    statsEmitTimers[event]?.unref?.();
}
}),
"[project]/src/lib/usage/tokenAccounting.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatUsageLog",
    ()=>formatUsageLog,
    "getLoggedInputTokens",
    ()=>getLoggedInputTokens,
    "getLoggedOutputTokens",
    ()=>getLoggedOutputTokens,
    "getObservedReasoning",
    ()=>getObservedReasoning,
    "getPromptCacheCreationTokens",
    ()=>getPromptCacheCreationTokens,
    "getPromptCacheCreationTokensOrNull",
    ()=>getPromptCacheCreationTokensOrNull,
    "getPromptCacheReadTokens",
    ()=>getPromptCacheReadTokens,
    "getPromptCacheReadTokensOrNull",
    ()=>getPromptCacheReadTokensOrNull,
    "getReasoningTokens",
    ()=>getReasoningTokens,
    "getReasoningTokensOrNull",
    ()=>getReasoningTokensOrNull
]);
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toFiniteNumber(value) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}
function getPromptTokenDetails(tokens) {
    const tokenRecord = asRecord(tokens);
    const promptDetails = asRecord(tokenRecord.prompt_tokens_details);
    if (Object.keys(promptDetails).length > 0) return promptDetails;
    return asRecord(tokenRecord.input_tokens_details);
}
function getPromptCacheReadTokens(tokens) {
    const tokenRecord = asRecord(tokens);
    const promptDetails = getPromptTokenDetails(tokenRecord);
    return toFiniteNumber(tokenRecord.cacheRead ?? tokenRecord.cache_read_input_tokens ?? tokenRecord.cached_tokens ?? promptDetails.cached_tokens);
}
function getPromptCacheCreationTokens(tokens) {
    const tokenRecord = asRecord(tokens);
    const promptDetails = getPromptTokenDetails(tokenRecord);
    return toFiniteNumber(tokenRecord.cacheCreation ?? tokenRecord.cache_creation_input_tokens ?? promptDetails.cache_creation_tokens);
}
function getLoggedInputTokens(tokens) {
    const tokenRecord = asRecord(tokens);
    if (tokenRecord.input !== undefined && tokenRecord.input !== null) {
        return toFiniteNumber(tokenRecord.input);
    }
    // Prefer prompt_tokens when present: translators normalize provider-specific
    // usage into OpenAI shape there, and may keep input_tokens for compatibility.
    // Treating that input_tokens as raw Claude usage would add cache tokens again.
    if (tokenRecord.prompt_tokens !== undefined && tokenRecord.prompt_tokens !== null) {
        return toFiniteNumber(tokenRecord.prompt_tokens);
    }
    if (tokenRecord.input_tokens !== undefined && tokenRecord.input_tokens !== null) {
        // Anthropic / anthropic-compatible-cc streaming: input_tokens is only the
        // non-cached portion.  The cache counters sit as separate top-level fields
        // (cache_read_input_tokens, cache_creation_input_tokens).  We need to add
        // them to get the true total input.
        return toFiniteNumber(tokenRecord.input_tokens) + toFiniteNumber(tokenRecord.cache_read_input_tokens) + toFiniteNumber(tokenRecord.cache_creation_input_tokens);
    }
    return 0;
}
function getLoggedOutputTokens(tokens) {
    const tokenRecord = asRecord(tokens);
    if (tokenRecord.output !== undefined && tokenRecord.output !== null) {
        return toFiniteNumber(tokenRecord.output);
    }
    return toFiniteNumber(tokenRecord.completion_tokens ?? tokenRecord.output_tokens);
}
function getReasoningTokens(tokens) {
    const tokenRecord = asRecord(tokens);
    const completionDetails = asRecord(tokenRecord.completion_tokens_details);
    return toFiniteNumber(tokenRecord.reasoning ?? tokenRecord.reasoning_tokens ?? completionDetails.reasoning_tokens);
}
// Non-greedy, single-capture, no nested variable-length quantifiers → ReDoS-safe.
const THINK_BLOCK_RE = /<think>([\s\S]*?)<\/think>/gi;
function getObservedReasoning(message) {
    const record = asRecord(message);
    // Explicit reasoning field: `reasoning_content` is the raw provider field;
    // `reasoning` is what sseTextTransform maps it to.
    const explicit = record.reasoning_content ?? record.reasoning;
    if (typeof explicit === "string" && explicit.trim().length > 0) {
        return {
            source: "content",
            chars: explicit.length
        };
    }
    // Inline <think>...</think> blocks embedded in message content.
    const content = record.content;
    if (typeof content === "string" && content.length > 0) {
        let chars = 0;
        for (const match of content.matchAll(THINK_BLOCK_RE)){
            chars += (match[1] ?? "").length;
        }
        if (chars > 0) return {
            source: "think",
            chars
        };
    }
    return {
        source: null,
        chars: 0
    };
}
// ─── Nullable variants ──────────────────────────────────────────────────
// Return `null` when the provider simply doesn't report the field,
// vs `0` when the provider explicitly reported zero.
function hasAnyKey(record, keys) {
    return keys.some((k)=>record[k] !== undefined && record[k] !== null);
}
function getPromptCacheReadTokensOrNull(tokens) {
    const tokenRecord = asRecord(tokens);
    const promptDetails = getPromptTokenDetails(tokenRecord);
    if (hasAnyKey(tokenRecord, [
        "cacheRead",
        "cache_read_input_tokens",
        "cached_tokens"
    ]) || hasAnyKey(promptDetails, [
        "cached_tokens"
    ])) {
        return getPromptCacheReadTokens(tokens);
    }
    return null;
}
function getPromptCacheCreationTokensOrNull(tokens) {
    const tokenRecord = asRecord(tokens);
    const promptDetails = getPromptTokenDetails(tokenRecord);
    if (hasAnyKey(tokenRecord, [
        "cacheCreation",
        "cache_creation_input_tokens"
    ]) || hasAnyKey(promptDetails, [
        "cache_creation_tokens"
    ])) {
        return getPromptCacheCreationTokens(tokens);
    }
    return null;
}
function getReasoningTokensOrNull(tokens) {
    const tokenRecord = asRecord(tokens);
    const completionDetails = asRecord(tokenRecord.completion_tokens_details);
    if (hasAnyKey(tokenRecord, [
        "reasoning",
        "reasoning_tokens"
    ]) || hasAnyKey(completionDetails, [
        "reasoning_tokens"
    ])) {
        return getReasoningTokens(tokens);
    }
    return null;
}
function formatUsageLog(tokens) {
    const input = getLoggedInputTokens(tokens);
    const output = getLoggedOutputTokens(tokens);
    const cacheRead = getPromptCacheReadTokens(tokens);
    const cacheWrite = getPromptCacheCreationTokens(tokens);
    const reasoning = getReasoningTokens(tokens);
    let msg = `in=${input} | out=${output}`;
    if (cacheRead > 0) {
        msg += ` | CR=${cacheRead}`;
    }
    if (cacheWrite > 0) {
        msg += ` | CW=${cacheWrite}`;
    }
    if (reasoning > 0) {
        msg += ` | R=${reasoning}`;
    }
    return msg;
}
}),
"[project]/src/lib/usage/usageHistory.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "appendRequestLog",
    ()=>appendRequestLog,
    "clearPendingRequests",
    ()=>clearPendingRequests,
    "finalizeMostRecentPendingRequest",
    ()=>finalizeMostRecentPendingRequest,
    "finalizePendingRequest",
    ()=>finalizePendingRequest,
    "finalizePendingRequestById",
    ()=>finalizePendingRequestById,
    "getMaxPendingRequestAgeMs",
    ()=>getMaxPendingRequestAgeMs,
    "getModelLatencyStats",
    ()=>getModelLatencyStats,
    "getPendingById",
    ()=>getPendingById,
    "getPendingRequests",
    ()=>getPendingRequests,
    "getRecentLogs",
    ()=>getRecentLogs,
    "getUsageDb",
    ()=>getUsageDb,
    "getUsageHistory",
    ()=>getUsageHistory,
    "saveRequestUsage",
    ()=>saveRequestUsage,
    "sweepStalePendingRequests",
    ()=>sweepStalePendingRequests,
    "trackPendingRequest",
    ()=>trackPendingRequest,
    "updatePendingRequest",
    ()=>updatePendingRequest,
    "updatePendingRequestById",
    ()=>updatePendingRequestById,
    "updatePendingRequestStreamChunks",
    ()=>updatePendingRequestStreamChunks
]);
/**
 * Usage History — extracted from usageDb.js (T-15)
 *
 * Usage tracking: saving, querying, and analytics shim for
 * the usage_history SQLite table.
 *
 * @module lib/usage/usageHistory
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logPayloads.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$accountIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/accountIdentity.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usage/usageHistory/helpers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/numeric.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$completedRequestDetails$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/completedRequestDetails.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/migrations.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageEvents$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/usageEvents.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/tokenAccounting.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
function normalizePendingMetadata(metadata) {
    if (!metadata) return {};
    const normalized = {};
    if (metadata.clientEndpoint !== undefined) {
        normalized.clientEndpoint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(metadata.clientEndpoint) || null;
    }
    if (metadata.providerUrl !== undefined) {
        normalized.providerUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(metadata.providerUrl) || null;
    }
    if (metadata.stage !== undefined) {
        normalized.stage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(metadata.stage) || null;
        normalized.stageUpdatedAt = Date.now();
    }
    if (metadata.stageUpdatedAt !== undefined) {
        normalized.stageUpdatedAt = typeof metadata.stageUpdatedAt === "number" && Number.isFinite(metadata.stageUpdatedAt) ? metadata.stageUpdatedAt : null;
    }
    if (metadata.clientRequest !== undefined) {
        normalized.clientRequest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["truncatePendingPreview"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(metadata.clientRequest));
    }
    if (metadata.providerRequest !== undefined) {
        normalized.providerRequest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["truncatePendingPreview"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(metadata.providerRequest));
    }
    if (metadata.providerResponse !== undefined) {
        normalized.providerResponse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["truncatePendingPreview"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(metadata.providerResponse));
    }
    if (metadata.clientResponse !== undefined) {
        normalized.clientResponse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["truncatePendingPreview"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(metadata.clientResponse));
    }
    if (metadata.status !== undefined) {
        const status = Number(metadata.status);
        normalized.status = Number.isFinite(status) ? status : null;
    }
    if (metadata.error !== undefined) {
        normalized.error = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(metadata.error) || null;
    }
    if (metadata.errorCode !== undefined) {
        normalized.errorCode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(metadata.errorCode) || null;
    }
    if (metadata.correlationId !== undefined) {
        normalized.correlationId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(metadata.correlationId) || null;
    }
    return normalized;
}
// ──────────────── Pending Requests (in-memory) ────────────────
const pendingRequests = {
    byModel: Object.create(null),
    byAccount: Object.create(null),
    details: Object.create(null)
};
/**
 * O(1) ID → PendingRequestDetail lookup map.
 * Populated when a detail is created and cleaned up when it is removed/finalized.
 */ const pendingById = new Map();
const DEFAULT_MAX_PENDING_REQUEST_AGE_MS = 60 * 60 * 1000;
const MAX_PENDING_DETAILS = 5000;
const PENDING_SWEEP_INTERVAL_MS = 5 * 60 * 1000;
let _pendingSweepTimer = null;
function getMaxPendingRequestAgeMs(rawValue = process.env.MAX_PENDING_REQUEST_AGE_MS) {
    const parsed = Number.parseInt(rawValue ?? "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_PENDING_REQUEST_AGE_MS;
}
function ensurePendingSweepTimer() {
    if (_pendingSweepTimer || typeof setInterval !== "function") return;
    _pendingSweepTimer = setInterval(()=>{
        try {
            sweepStalePendingRequests();
        } catch  {
        /* never let the reaper throw on the timer thread */ }
    }, PENDING_SWEEP_INTERVAL_MS);
    // Don't keep the process alive just for the reaper.
    _pendingSweepTimer?.unref?.();
}
function sweepStalePendingRequests(now = Date.now(), maxAgeMs = getMaxPendingRequestAgeMs()) {
    let removed = 0;
    const remove = (detail)=>{
        const modelKey = detail.provider ? `${detail.model} (${detail.provider})` : detail.model;
        pendingById.delete(detail.id);
        if (detail.connectionId && isSafeKey(modelKey)) {
            const bucket = pendingRequests.details[detail.connectionId]?.[modelKey];
            if (bucket) {
                const index = bucket.findIndex((entry)=>entry.id === detail.id);
                if (index >= 0) bucket.splice(index, 1);
            }
            cleanupPendingDetails(detail.connectionId, modelKey);
            decrementPendingCounters(modelKey, detail.connectionId);
        }
        removed++;
    };
    for (const detail of pendingById.values()){
        if (now - detail.startedAt > maxAgeMs) remove(detail);
    }
    // Hard backstop: if entries are still piling up faster than they age out, drop the oldest
    // beyond the cap.
    if (pendingById.size > MAX_PENDING_DETAILS) {
        const overflow = pendingById.size - MAX_PENDING_DETAILS;
        const oldest = [
            ...pendingById.values()
        ].sort((a, b)=>a.startedAt - b.startedAt).slice(0, overflow);
        for (const detail of oldest)remove(detail);
    }
    return removed;
}
/** Prototype-pollution denylist — prevents crafted model/provider names from mutating Object.prototype. */ const UNSAFE_KEYS = new Set([
    "__proto__",
    "constructor",
    "prototype"
]);
function isSafeKey(key) {
    return !UNSAFE_KEYS.has(key);
}
function trackPendingRequest(model, provider, connectionId, started, metadata) {
    const modelKey = provider ? `${model} (${provider})` : model;
    if (!isSafeKey(modelKey)) return;
    const normalizedMetadata = normalizePendingMetadata(metadata);
    // Ensure the orphaned-pending reaper is running once pending tracking is in use.
    if (started) ensurePendingSweepTimer();
    // Use hasOwnProperty guard to prevent prototype pollution via crafted keys
    if (!Object.hasOwn(pendingRequests.byModel, modelKey)) {
        pendingRequests.byModel[modelKey] = 0;
    }
    pendingRequests.byModel[modelKey] = Math.max(0, pendingRequests.byModel[modelKey] + (started ? 1 : -1));
    if (connectionId) {
        if (!Object.hasOwn(pendingRequests.byAccount, connectionId)) {
            pendingRequests.byAccount[connectionId] = Object.create(null);
        }
        if (!Object.hasOwn(pendingRequests.details, connectionId)) {
            pendingRequests.details[connectionId] = Object.create(null);
        }
        if (!Object.hasOwn(pendingRequests.byAccount[connectionId], modelKey)) {
            pendingRequests.byAccount[connectionId][modelKey] = 0;
        }
        pendingRequests.byAccount[connectionId][modelKey] = Math.max(0, pendingRequests.byAccount[connectionId][modelKey] + (started ? 1 : -1));
        const nextCount = pendingRequests.byAccount[connectionId][modelKey];
        if (started && nextCount > 0) {
            if (!pendingRequests.details[connectionId][modelKey]) {
                pendingRequests.details[connectionId][modelKey] = [];
            }
            const now = Date.now();
            const newDetail = {
                // crypto RNG (not Math.random) to satisfy CodeQL js/insecure-randomness —
                // this pending-request id flows into attempt logging; it's a correlation
                // id, not a security secret.
                id: `${now}-${globalThis.crypto.randomUUID().slice(0, 6)}`,
                model,
                provider,
                connectionId,
                startedAt: now,
                ...normalizedMetadata
            };
            pendingRequests.details[connectionId][modelKey].push(newDetail);
            pendingById.set(newDetail.id, newDetail);
            return newDetail.id;
        } else if (!started && nextCount >= 0) {
            if (pendingRequests.details[connectionId]?.[modelKey]?.length) {
                const removed = pendingRequests.details[connectionId][modelKey].shift();
                if (removed) pendingById.delete(removed.id);
            }
            if (!pendingRequests.details[connectionId]?.[modelKey]?.length) {
                delete pendingRequests.details[connectionId]?.[modelKey];
                if (Object.keys(pendingRequests.details[connectionId] || {}).length === 0) {
                    delete pendingRequests.details[connectionId];
                }
            }
        }
    }
}
function updatePendingRequest(model, provider, connectionId, metadata) {
    if (!connectionId) return;
    const modelKey = provider ? `${model} (${provider})` : model;
    if (!isSafeKey(modelKey)) return;
    const details = pendingRequests.details[connectionId]?.[modelKey];
    if (!details?.length) return;
    const lastIdx = details.length - 1;
    Object.assign(details[lastIdx], normalizePendingMetadata(metadata));
}
function updatePendingRequestById(id, metadata) {
    const detail = id ? pendingById.get(id) : null;
    if (!detail) return false;
    Object.assign(detail, normalizePendingMetadata(metadata));
    return true;
}
/**
 * Update the first (oldest) pending request detail and then remove it.
 * Unlike updatePendingRequest which targets the last entry, this is designed
 * for the non-streaming completion path where the oldest entry must be finalized
 * before trackPendingRequest(false) removes it from the FIFO queue.
 */ function decrementPendingCounters(modelKey, connectionId) {
    if (Object.hasOwn(pendingRequests.byModel, modelKey)) {
        pendingRequests.byModel[modelKey] = Math.max(0, pendingRequests.byModel[modelKey] - 1);
        if (pendingRequests.byModel[modelKey] === 0) delete pendingRequests.byModel[modelKey];
    }
    if (Object.hasOwn(pendingRequests.byAccount, connectionId)) {
        if (Object.hasOwn(pendingRequests.byAccount[connectionId], modelKey)) {
            pendingRequests.byAccount[connectionId][modelKey] = Math.max(0, pendingRequests.byAccount[connectionId][modelKey] - 1);
            if (pendingRequests.byAccount[connectionId][modelKey] === 0) {
                delete pendingRequests.byAccount[connectionId][modelKey];
            }
        }
        if (!pendingRequests.byAccount[connectionId] || Object.keys(pendingRequests.byAccount[connectionId]).length === 0) {
            delete pendingRequests.byAccount[connectionId];
        }
    }
}
function cleanupPendingDetails(connectionId, modelKey) {
    if (!pendingRequests.details[connectionId]?.[modelKey]?.length) {
        delete pendingRequests.details[connectionId]?.[modelKey];
    }
    if (!pendingRequests.details[connectionId] || Object.keys(pendingRequests.details[connectionId]).length === 0) {
        delete pendingRequests.details[connectionId];
    }
}
function finalizePendingDetailAt(connectionId, modelKey, index, metadata) {
    if (!isSafeKey(modelKey)) return null;
    const details = pendingRequests.details[connectionId]?.[modelKey];
    if (!details?.length || index < 0 || index >= details.length) return null;
    const completedAt = Date.now();
    const updated = {
        ...details[index],
        ...normalizePendingMetadata(metadata),
        completedAt,
        durationMs: Math.max(0, completedAt - details[index].startedAt)
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$completedRequestDetails$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["storeCompletedDetail"])(updated);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$completedRequestDetails$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["maybeEnrichCompletedDetail"])(updated, connectionId);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$completedRequestDetails$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["scheduleCompletedDetailCleanup"])(updated.id);
    details.splice(index, 1);
    pendingById.delete(updated.id);
    cleanupPendingDetails(connectionId, modelKey);
    decrementPendingCounters(modelKey, connectionId);
    return updated.id;
}
function finalizePendingRequest(model, provider, connectionId, metadata) {
    if (!connectionId) return;
    const modelKey = provider ? `${model} (${provider})` : model;
    finalizePendingDetailAt(connectionId, modelKey, 0, metadata);
}
function finalizePendingRequestById(id, metadata) {
    if (!id) return false;
    const detail = pendingById.get(id);
    if (!detail?.connectionId) return false;
    const modelKey = detail.provider ? `${detail.model} (${detail.provider})` : detail.model;
    if (!isSafeKey(modelKey)) return false;
    const details = pendingRequests.details[detail.connectionId]?.[modelKey];
    const index = details?.findIndex((entry)=>entry.id === id) ?? -1;
    return finalizePendingDetailAt(detail.connectionId, modelKey, index, metadata) !== null;
}
function finalizeMostRecentPendingRequest(model, provider, connectionId, metadata) {
    if (!connectionId) return;
    const modelKey = provider ? `${model} (${provider})` : model;
    if (!isSafeKey(modelKey)) return;
    const details = pendingRequests.details[connectionId]?.[modelKey];
    if (!details?.length) return;
    finalizePendingDetailAt(connectionId, modelKey, details.length - 1, metadata);
}
;
function updatePendingRequestStreamChunks(model, provider, connectionId, streamChunks) {
    if (!connectionId) return;
    const modelKey = provider ? `${model} (${provider})` : model;
    if (!isSafeKey(modelKey)) return;
    const details = pendingRequests.details[connectionId]?.[modelKey];
    if (!details?.length) return;
    details[0].streamChunks = streamChunks;
}
function getPendingRequests() {
    return pendingRequests;
}
function getPendingById() {
    return pendingById;
}
function clearPendingRequests() {
    pendingRequests.byModel = Object.create(null);
    pendingRequests.byAccount = Object.create(null);
    pendingRequests.details = Object.create(null);
    pendingById.clear();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$completedRequestDetails$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["clearCompletedDetails"])();
}
// ──────────────── getUsageDb Shim (backward compat) ────────────────
const MAX_ROWS = 10000;
async function getUsageDb(sinceIso, limit, cursor) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const maxRows = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : MAX_ROWS;
    let rows;
    if (cursor) {
        // Cursor-based pagination (next page after cursor)
        // Use > cursor to get rows after the last timestamp of previous page (ASC order)
        rows = sinceIso ? db.prepare(`SELECT * FROM usage_history WHERE timestamp >= ? AND timestamp > ? ORDER BY timestamp ASC LIMIT ?`).all(sinceIso, cursor, maxRows) : db.prepare(`SELECT * FROM usage_history WHERE timestamp > ? ORDER BY timestamp ASC LIMIT ?`).all(cursor, maxRows);
    } else if (sinceIso) {
        // Initial query with date filter
        rows = db.prepare(`SELECT * FROM usage_history WHERE timestamp >= ? ORDER BY timestamp ASC LIMIT ?`).all(sinceIso, maxRows);
    } else {
        // No filter - get all (with limit)
        rows = db.prepare(`SELECT * FROM usage_history ORDER BY timestamp ASC LIMIT ?`).all(maxRows);
    }
    const history = rows.map((row)=>{
        const r = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["asRecord"])(row);
        return {
            provider: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.provider),
            model: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.model),
            connectionId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.connection_id),
            apiKeyId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.api_key_id),
            apiKeyName: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.api_key_name),
            serviceTier: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["normalizeServiceTier"])(r.service_tier),
            tokens: {
                input: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.tokens_input),
                output: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.tokens_output),
                cacheRead: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.tokens_cache_read),
                cacheCreation: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.tokens_cache_creation),
                reasoning: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.tokens_reasoning)
            },
            status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.status),
            success: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.success) === 1,
            latencyMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.latency_ms),
            timeToFirstTokenMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.ttft_ms),
            errorCode: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.error_code),
            timestamp: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.timestamp)
        };
    });
    // Provide next cursor if we hit the limit (more rows exist)
    const nextCursor = rows.length === maxRows ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["asRecord"])(rows[rows.length - 1]).timestamp) : null;
    return {
        data: {
            history,
            nextCursor
        }
    };
}
async function saveRequestUsage(entry) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["shouldPersistToDisk"]) return;
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const timestamp = entry.timestamp || new Date().toISOString();
        const serviceTier = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["normalizeServiceTier"])(entry.serviceTier ?? entry.service_tier);
        const tokensInput = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getLoggedInputTokens"])(entry.tokens);
        const tokensOutput = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getLoggedOutputTokens"])(entry.tokens);
        const connection = entry.connectionId ? db.prepare("SELECT * FROM provider_connections WHERE id = ?").get(entry.connectionId) : undefined;
        const accountIdentity = connection ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$accountIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveUsageAccountIdentity"])(connection) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$accountIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveOrphanedUsageAccountIdentity"])(entry.provider, entry.connectionId);
        // Dedup guard: skip INSERT when an identical row already exists in the same
        // second. This prevents double-counting when onRequestSuccess fires more
        // than once (e.g. combo routing calling the callback from both the
        // streaming and non-streaming paths for the same underlying request).
        // Keyed on the natural identity of a request: timestamp + provider + model
        // + connectionId + apiKeyId + token counts. If only the endpoint is missing
        // on the existing row, fill it in rather than inserting a duplicate.
        let inserted = false;
        db.transaction(()=>{
            const existing = db.prepare(`SELECT id, endpoint FROM usage_history
           WHERE timestamp = ?
             AND COALESCE(provider, '')     = COALESCE(?, '')
             AND COALESCE(model, '')        = COALESCE(?, '')
             AND COALESCE(connection_id, '') = COALESCE(?, '')
             AND COALESCE(api_key_id, '')   = COALESCE(?, '')
             AND tokens_input  = ?
             AND tokens_output = ?
           ORDER BY id DESC LIMIT 1`).get(timestamp, entry.provider || null, entry.model || null, entry.connectionId || null, entry.apiKeyId || null, tokensInput, tokensOutput);
            if (existing) {
                // Back-fill endpoint if the original row missed it.
                if (!existing.endpoint && entry.endpoint) {
                    db.prepare(`UPDATE usage_history SET endpoint = ? WHERE id = ?`).run(entry.endpoint, existing.id);
                }
                return; // duplicate — do not insert
            }
            db.prepare(`
        INSERT INTO usage_history (provider, model, connection_id, account_key, account_label,
          account_label_priority, api_key_id, api_key_name, tokens_input, tokens_output,
          tokens_cache_read, tokens_cache_creation, tokens_reasoning, service_tier, status, success,
          latency_ms, ttft_ms, error_code, combo_strategy, endpoint, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(entry.provider || null, entry.model || null, entry.connectionId || null, accountIdentity.accountKey, accountIdentity.accountLabel, accountIdentity.accountLabelPriority, entry.apiKeyId || null, entry.apiKeyName || null, tokensInput, tokensOutput, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getPromptCacheReadTokens"])(entry.tokens), (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getPromptCacheCreationTokens"])(entry.tokens), (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getReasoningTokens"])(entry.tokens), serviceTier, entry.status || null, entry.success === false ? 0 : 1, Number.isFinite(Number(entry.latencyMs)) ? Number(entry.latencyMs) : 0, Number.isFinite(Number(entry.timeToFirstTokenMs)) ? Number(entry.timeToFirstTokenMs) : Number.isFinite(Number(entry.latencyMs)) ? Number(entry.latencyMs) : 0, entry.errorCode || null, entry.comboStrategy || entry.combo_strategy || null, entry.endpoint || null, timestamp);
            inserted = true;
        })();
        // Decoupled via the event bus so usageHistory never imports providerLimits
        // (which would pull the executors/translator graph into the type-check surface).
        // Only emit when a row was actually inserted — not on dedup no-ops.
        if (inserted) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageEvents$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["emitUsageRecorded"])(entry.provider, entry.connectionId);
        }
    } catch (error) {
        console.error("Failed to save usage stats:", error);
    }
}
async function getUsageHistory(filter = {}) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    let sql = "SELECT * FROM usage_history";
    const conditions = [];
    const params = {};
    if (filter.provider) {
        conditions.push("provider = @provider");
        params.provider = filter.provider;
    }
    if (filter.model) {
        conditions.push("model = @model");
        params.model = filter.model;
    }
    if (filter.startDate) {
        conditions.push("timestamp >= @startDate");
        params.startDate = new Date(filter.startDate).toISOString();
    }
    if (filter.endDate) {
        conditions.push("timestamp <= @endDate");
        params.endDate = new Date(filter.endDate).toISOString();
    }
    if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
    }
    sql += " ORDER BY timestamp ASC";
    const rows = db.prepare(sql).all(params);
    return rows.map((row)=>{
        const r = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["asRecord"])(row);
        return {
            provider: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.provider),
            model: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.model),
            connectionId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.connection_id),
            apiKeyId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.api_key_id),
            apiKeyName: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.api_key_name),
            serviceTier: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["normalizeServiceTier"])(r.service_tier),
            tokens: {
                input: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.tokens_input),
                output: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.tokens_output),
                cacheRead: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.tokens_cache_read),
                cacheCreation: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.tokens_cache_creation),
                reasoning: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.tokens_reasoning)
            },
            status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.status),
            success: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.success) === 1,
            latencyMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.latency_ms),
            timeToFirstTokenMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.ttft_ms),
            errorCode: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.error_code),
            timestamp: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.timestamp)
        };
    });
}
async function getModelLatencyStats(options = {}) {
    const windowHours = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolvePositiveOption"])(options.windowHours, 24);
    const minSamples = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolvePositiveOption"])(options.minSamples, 1);
    const maxRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolvePositiveOption"])(options.maxRows, 10000);
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const sinceIso = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();
    const conditions = [
        "timestamp >= @sinceIso",
        "provider IS NOT NULL",
        "model IS NOT NULL"
    ];
    const queryParams = {
        sinceIso,
        maxRows
    };
    if (options.provider) {
        conditions.push("provider = @provider");
        queryParams.provider = options.provider;
    }
    if (options.model) {
        conditions.push("model = @model");
        queryParams.model = options.model;
    }
    const rows = db.prepare(`
      SELECT provider, model, success, latency_ms, ttft_ms, tokens_output
      FROM usage_history
      WHERE ${conditions.join(" AND ")}
      ORDER BY timestamp DESC
      LIMIT @maxRows
    `).all(queryParams);
    const grouped = new Map();
    for (const row of rows){
        const provider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(row.provider);
        const model = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(row.model);
        if (!provider || !model) continue;
        const key = `${provider}/${model}`;
        if (!grouped.has(key)) grouped.set(key, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createLatencyBucket"])(provider, model));
        const bucket = grouped.get(key);
        if (!bucket) continue;
        bucket.totalRequests += 1;
        const isSuccess = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.success) !== 0;
        if (isSuccess) bucket.successfulRequests += 1;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["accumulateLatencySample"])(bucket, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.latency_ms), (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.ttft_ms), (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_output), isSuccess);
    }
    const stats = {};
    for (const [key, bucket] of grouped.entries()){
        const entry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildLatencyStatsEntry"])(key, bucket, minSamples, windowHours);
        if (entry) stats[key] = entry;
    }
    return stats;
}
async function appendRequestLog({ model: _model, provider: _provider, connectionId: _connectionId, tokens: _tokens, status: _status }) {
// Deprecated: request summaries now come from SQLite call_logs.
}
async function getRecentLogs(limit = 200) {
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const rows = db.prepare(`
        SELECT timestamp, model, provider, account, tokens_in, tokens_out, status
        FROM call_logs
        ORDER BY timestamp DESC
        LIMIT ?
      `).all(limit);
        return rows.map((row)=>{
            const timestamp = typeof row.timestamp === "string" ? row.timestamp : new Date().toISOString();
            const provider = typeof row.provider === "string" ? row.provider.toUpperCase() : "-";
            const model = typeof row.model === "string" ? row.model : "-";
            const account = typeof row.account === "string" ? row.account : "-";
            const tokensIn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_in);
            const tokensOut = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_out);
            const status = typeof row.status === "number" ? row.status : String(row.status || "-");
            return `${timestamp} | ${model} | ${provider} | ${account} | ${tokensIn} | ${tokensOut} | ${status}`;
        });
    } catch (error) {
        console.error("[usageDb] Failed to read recent call logs:", error instanceof Error ? error.message : String(error));
        return [];
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/usage/pendingRequestScope.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "finalizePendingScope",
    ()=>finalizePendingScope,
    "updatePendingScope",
    ()=>updatePendingScope
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usage/usageHistory.ts [instrumentation] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
function updatePendingScope(scope, metadata) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updatePendingRequestById"])(scope.id || null, metadata)) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updatePendingRequest"])(scope.model, scope.provider, scope.connectionId, metadata);
    }
}
function finalizePendingScope(scope, metadata) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["finalizePendingRequestById"])(scope.id, metadata)) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["finalizePendingRequest"])(scope.model, scope.provider, scope.connectionId, metadata);
    }
}
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
"[project]/src/lib/db/domainState.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "batchSaveCostEntries",
    ()=>batchSaveCostEntries,
    "cleanOldCostEntries",
    ()=>cleanOldCostEntries,
    "deleteAllCircuitBreakerStates",
    ()=>deleteAllCircuitBreakerStates,
    "deleteAllCostData",
    ()=>deleteAllCostData,
    "deleteAllFallbackChains",
    ()=>deleteAllFallbackChains,
    "deleteBudget",
    ()=>deleteBudget,
    "deleteCircuitBreakerState",
    ()=>deleteCircuitBreakerState,
    "deleteCostEntries",
    ()=>deleteCostEntries,
    "deleteFallbackChain",
    ()=>deleteFallbackChain,
    "deleteLockoutState",
    ()=>deleteLockoutState,
    "loadAllBudgets",
    ()=>loadAllBudgets,
    "loadAllCircuitBreakerStates",
    ()=>loadAllCircuitBreakerStates,
    "loadAllFallbackChains",
    ()=>loadAllFallbackChains,
    "loadAllLockedIdentifiers",
    ()=>loadAllLockedIdentifiers,
    "loadBudget",
    ()=>loadBudget,
    "loadBudgetResetLogs",
    ()=>loadBudgetResetLogs,
    "loadCircuitBreakerState",
    ()=>loadCircuitBreakerState,
    "loadCostEntries",
    ()=>loadCostEntries,
    "loadCostEntriesInRange",
    ()=>loadCostEntriesInRange,
    "loadCostTotal",
    ()=>loadCostTotal,
    "loadFallbackChain",
    ()=>loadFallbackChain,
    "loadLockoutState",
    ()=>loadLockoutState,
    "saveBudget",
    ()=>saveBudget,
    "saveBudgetResetLog",
    ()=>saveBudgetResetLog,
    "saveCircuitBreakerState",
    ()=>saveCircuitBreakerState,
    "saveCostEntry",
    ()=>saveCostEntry,
    "saveFallbackChain",
    ()=>saveFallbackChain,
    "saveLockoutState",
    ()=>saveLockoutState
]);
/**
 * Domain State Persistence — Phase 5 Foundation
 *
 * CRUD operations for persisting domain layer state in SQLite.
 * Replaces in-memory Map() storage with durable persistence.
 *
 * Tables: domain_fallback_chains, domain_budgets, domain_cost_history,
 *         domain_lockout_state, domain_circuit_breakers
 *
 * @module lib/db/domainState
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
;
let _budgetSchemaChecked = false;
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
function ensureBudgetSchema() {
    if (_budgetSchemaChecked) return;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const columns = db.prepare("PRAGMA table_info(domain_budgets)").all();
    const columnNames = new Set(columns.map((column)=>{
        const record = asRecord(column);
        return typeof record.name === "string" ? record.name : "";
    }).filter(Boolean));
    if (!columnNames.has("weekly_limit_usd")) {
        db.exec("ALTER TABLE domain_budgets ADD COLUMN weekly_limit_usd REAL DEFAULT 0");
    }
    if (!columnNames.has("reset_interval")) {
        db.exec("ALTER TABLE domain_budgets ADD COLUMN reset_interval TEXT DEFAULT 'daily'");
    }
    if (!columnNames.has("reset_time")) {
        db.exec("ALTER TABLE domain_budgets ADD COLUMN reset_time TEXT DEFAULT '00:00'");
    }
    if (!columnNames.has("budget_reset_at")) {
        db.exec("ALTER TABLE domain_budgets ADD COLUMN budget_reset_at INTEGER");
    }
    if (!columnNames.has("last_budget_reset_at")) {
        db.exec("ALTER TABLE domain_budgets ADD COLUMN last_budget_reset_at INTEGER");
    }
    if (!columnNames.has("warning_emitted_at")) {
        db.exec("ALTER TABLE domain_budgets ADD COLUMN warning_emitted_at INTEGER");
    }
    if (!columnNames.has("warning_period_start")) {
        db.exec("ALTER TABLE domain_budgets ADD COLUMN warning_period_start INTEGER");
    }
    db.exec(`
    CREATE TABLE IF NOT EXISTS domain_budget_reset_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      api_key_id TEXT NOT NULL,
      reset_interval TEXT NOT NULL,
      previous_spend REAL NOT NULL DEFAULT 0,
      reset_at INTEGER NOT NULL,
      next_reset_at INTEGER NOT NULL,
      period_start INTEGER NOT NULL,
      period_end INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_dbrl_key_reset
      ON domain_budget_reset_logs(api_key_id, reset_at DESC);
  `);
    _budgetSchemaChecked = true;
}
function saveFallbackChain(model, chain) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("INSERT OR REPLACE INTO domain_fallback_chains (model, chain) VALUES (?, ?)").run(model, JSON.stringify(chain));
}
function loadFallbackChain(model) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT chain FROM domain_fallback_chains WHERE model = ?").get(model);
    const chain = asRecord(row).chain;
    return typeof chain === "string" ? JSON.parse(chain) : null;
}
function loadAllFallbackChains() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT model, chain FROM domain_fallback_chains").all();
    const result = {};
    for (const row of rows){
        const record = asRecord(row);
        const model = typeof record.model === "string" ? record.model : null;
        const chain = typeof record.chain === "string" ? record.chain : null;
        if (!model || !chain) continue;
        result[model] = JSON.parse(chain);
    }
    return result;
}
function deleteFallbackChain(model) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const info = db.prepare("DELETE FROM domain_fallback_chains WHERE model = ?").run(model);
    return info.changes > 0;
}
function deleteAllFallbackChains() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("DELETE FROM domain_fallback_chains").run();
}
function saveBudget(apiKeyId, config) {
    ensureBudgetSchema();
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare(`INSERT OR REPLACE INTO domain_budgets (
       api_key_id,
       daily_limit_usd,
       weekly_limit_usd,
       monthly_limit_usd,
       warning_threshold,
       reset_interval,
       reset_time,
       budget_reset_at,
       last_budget_reset_at,
       warning_emitted_at,
       warning_period_start
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(apiKeyId, toNumber(config.dailyLimitUsd), toNumber(config.weeklyLimitUsd), toNumber(config.monthlyLimitUsd), toNumber(config.warningThreshold, 0.8), typeof config.resetInterval === "string" ? config.resetInterval : "daily", typeof config.resetTime === "string" ? config.resetTime : "00:00", config.budgetResetAt ?? null, config.lastBudgetResetAt ?? null, config.warningEmittedAt ?? null, config.warningPeriodStart ?? null);
}
function loadBudget(apiKeyId) {
    ensureBudgetSchema();
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT * FROM domain_budgets WHERE api_key_id = ?").get(apiKeyId);
    const record = asRecord(row);
    if (!row) return null;
    return {
        dailyLimitUsd: toNumber(record.daily_limit_usd),
        weeklyLimitUsd: toNumber(record.weekly_limit_usd),
        monthlyLimitUsd: toNumber(record.monthly_limit_usd),
        warningThreshold: toNumber(record.warning_threshold, 0.8),
        resetInterval: typeof record.reset_interval === "string" ? record.reset_interval : "daily",
        resetTime: typeof record.reset_time === "string" ? record.reset_time : "00:00",
        budgetResetAt: toNumber(record.budget_reset_at, 0) || null,
        lastBudgetResetAt: toNumber(record.last_budget_reset_at, 0) || null,
        warningEmittedAt: toNumber(record.warning_emitted_at, 0) || null,
        warningPeriodStart: toNumber(record.warning_period_start, 0) || null
    };
}
function loadAllBudgets() {
    ensureBudgetSchema();
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT * FROM domain_budgets ORDER BY api_key_id").all();
    const result = {};
    for (const row of rows){
        const record = asRecord(row);
        const apiKeyId = typeof record.api_key_id === "string" ? record.api_key_id : "";
        if (!apiKeyId) continue;
        result[apiKeyId] = {
            dailyLimitUsd: toNumber(record.daily_limit_usd),
            weeklyLimitUsd: toNumber(record.weekly_limit_usd),
            monthlyLimitUsd: toNumber(record.monthly_limit_usd),
            warningThreshold: toNumber(record.warning_threshold, 0.8),
            resetInterval: typeof record.reset_interval === "string" ? record.reset_interval : "daily",
            resetTime: typeof record.reset_time === "string" ? record.reset_time : "00:00",
            budgetResetAt: toNumber(record.budget_reset_at, 0) || null,
            lastBudgetResetAt: toNumber(record.last_budget_reset_at, 0) || null,
            warningEmittedAt: toNumber(record.warning_emitted_at, 0) || null,
            warningPeriodStart: toNumber(record.warning_period_start, 0) || null
        };
    }
    return result;
}
function saveBudgetResetLog(entry) {
    ensureBudgetSchema();
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare(`INSERT INTO domain_budget_reset_logs
       (api_key_id, reset_interval, previous_spend, reset_at, next_reset_at, period_start, period_end)
     VALUES (?, ?, ?, ?, ?, ?, ?)`).run(entry.apiKeyId, entry.resetInterval, entry.previousSpend, entry.resetAt, entry.nextResetAt, entry.periodStart, entry.periodEnd);
}
function loadBudgetResetLogs(apiKeyId, limit = 10) {
    ensureBudgetSchema();
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    return db.prepare(`SELECT id, api_key_id, reset_interval, previous_spend, reset_at, next_reset_at, period_start, period_end
       FROM domain_budget_reset_logs
       WHERE api_key_id = ?
       ORDER BY reset_at DESC
       LIMIT ?`).all(apiKeyId, Math.max(1, Math.floor(limit))).map((row)=>{
        const record = asRecord(row);
        return {
            id: toNumber(record.id),
            apiKeyId: typeof record.api_key_id === "string" ? record.api_key_id : "",
            resetInterval: typeof record.reset_interval === "string" ? record.reset_interval : "daily",
            previousSpend: toNumber(record.previous_spend),
            resetAt: toNumber(record.reset_at),
            nextResetAt: toNumber(record.next_reset_at),
            periodStart: toNumber(record.period_start),
            periodEnd: toNumber(record.period_end)
        };
    }).filter((entry)=>entry.apiKeyId.length > 0);
}
function deleteBudget(apiKeyId) {
    ensureBudgetSchema();
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("DELETE FROM domain_budgets WHERE api_key_id = ?").run(apiKeyId);
    db.prepare("DELETE FROM domain_budget_reset_logs WHERE api_key_id = ?").run(apiKeyId);
}
function saveCostEntry(apiKeyId, cost, timestamp = Date.now()) {
    ensureBudgetSchema();
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("INSERT INTO domain_cost_history (api_key_id, cost, timestamp) VALUES (?, ?, ?)").run(apiKeyId, cost, timestamp);
}
function batchSaveCostEntries(entries) {
    ensureBudgetSchema();
    if (!Array.isArray(entries) || entries.length === 0) return;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const stmt = db.prepare("INSERT INTO domain_cost_history (api_key_id, cost, timestamp) VALUES (?, ?, ?)");
    const tx = db.transaction((rows)=>{
        for (const entry of rows){
            stmt.run(entry.apiKeyId, entry.cost, entry.timestamp);
        }
    });
    tx(entries);
}
function loadCostTotal(apiKeyId, sinceTimestamp) {
    ensureBudgetSchema();
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT COALESCE(SUM(cost), 0) AS total FROM domain_cost_history WHERE api_key_id = ? AND timestamp >= ?").get(apiKeyId, sinceTimestamp);
    return Number(row?.total || 0);
}
function loadCostEntries(apiKeyId, sinceTimestamp) {
    ensureBudgetSchema();
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    return db.prepare("SELECT cost, timestamp FROM domain_cost_history WHERE api_key_id = ? AND timestamp >= ? ORDER BY timestamp").all(apiKeyId, sinceTimestamp);
}
function loadCostEntriesInRange(apiKeyId, sinceTimestamp, untilTimestamp) {
    ensureBudgetSchema();
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    return db.prepare(`SELECT cost, timestamp
       FROM domain_cost_history
       WHERE api_key_id = ? AND timestamp >= ? AND timestamp < ?
       ORDER BY timestamp`).all(apiKeyId, sinceTimestamp, untilTimestamp);
}
function cleanOldCostEntries(olderThanTimestamp) {
    ensureBudgetSchema();
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const info = db.prepare("DELETE FROM domain_cost_history WHERE timestamp < ?").run(olderThanTimestamp);
    return info.changes;
}
function deleteCostEntries(apiKeyId) {
    ensureBudgetSchema();
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("DELETE FROM domain_cost_history WHERE api_key_id = ?").run(apiKeyId);
}
function deleteAllCostData() {
    ensureBudgetSchema();
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("DELETE FROM domain_cost_history").run();
    db.prepare("DELETE FROM domain_budgets").run();
    db.prepare("DELETE FROM domain_budget_reset_logs").run();
}
function saveLockoutState(identifier, state) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare(`INSERT OR REPLACE INTO domain_lockout_state (identifier, attempts, locked_until)
     VALUES (?, ?, ?)`).run(identifier, JSON.stringify(state.attempts), state.lockedUntil);
}
function loadLockoutState(identifier) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT * FROM domain_lockout_state WHERE identifier = ?").get(identifier);
    if (!row) return null;
    const record = asRecord(row);
    const attemptsRaw = typeof record.attempts === "string" ? record.attempts : "[]";
    const lockedUntilRaw = record.locked_until;
    return {
        attempts: JSON.parse(attemptsRaw),
        lockedUntil: typeof lockedUntilRaw === "number" ? lockedUntilRaw : null
    };
}
function deleteLockoutState(identifier) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("DELETE FROM domain_lockout_state WHERE identifier = ?").run(identifier);
}
function loadAllLockedIdentifiers() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const now = Date.now();
    return db.prepare("SELECT identifier, locked_until FROM domain_lockout_state WHERE locked_until IS NOT NULL AND locked_until > ?").all(now).map((row)=>{
        const record = asRecord(row);
        return {
            identifier: typeof record.identifier === "string" ? record.identifier : "",
            lockedUntil: toNumber(record.locked_until)
        };
    }).filter((row)=>row.identifier.length > 0);
}
function saveCircuitBreakerState(name, cbState) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare(`INSERT OR REPLACE INTO domain_circuit_breakers (name, state, failure_count, last_failure_time, options)
     VALUES (?, ?, ?, ?, ?)`).run(name, cbState.state, cbState.failureCount, cbState.lastFailureTime, cbState.options ? JSON.stringify(cbState.options) : null);
}
function loadCircuitBreakerState(name) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT * FROM domain_circuit_breakers WHERE name = ?").get(name);
    if (!row) return null;
    const record = asRecord(row);
    const options = typeof record.options === "string" ? JSON.parse(record.options) : null;
    return {
        state: typeof record.state === "string" ? record.state : "CLOSED",
        failureCount: toNumber(record.failure_count),
        lastFailureTime: toNumber(record.last_failure_time, 0) || null,
        options
    };
}
function loadAllCircuitBreakerStates() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    return db.prepare("SELECT name, state, failure_count, last_failure_time FROM domain_circuit_breakers").all().map((row)=>{
        const record = asRecord(row);
        return {
            name: typeof record.name === "string" ? record.name : "",
            state: typeof record.state === "string" ? record.state : "CLOSED",
            failureCount: toNumber(record.failure_count),
            lastFailureTime: toNumber(record.last_failure_time, 0) || null
        };
    }).filter((row)=>row.name.length > 0);
}
function deleteCircuitBreakerState(name) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("DELETE FROM domain_circuit_breakers WHERE name = ?").run(name);
}
function deleteAllCircuitBreakerStates() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("DELETE FROM domain_circuit_breakers").run();
}
}),
"[project]/src/lib/db/creditBalance.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAllPersistedCreditBalances",
    ()=>getAllPersistedCreditBalances,
    "getPersistedCreditBalance",
    ()=>getPersistedCreditBalance,
    "persistCreditBalance",
    ()=>persistCreditBalance
]);
/**
 * Antigravity GOOGLE_ONE_AI credit balance persistence.
 *
 * Stores last-known credit balances in the `key_value` table so they survive
 * server restarts. The in-memory `creditBalanceCache` in the executor is the
 * primary source at runtime; this module provides the fallback read/write layer.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
;
const NAMESPACE = "antigravityCreditBalance";
function parseJson(raw) {
    try {
        return JSON.parse(raw);
    } catch  {
        return null;
    }
}
function getPersistedCreditBalance(accountId) {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isBuildPhase"] || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"]) return null;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = ? AND key = ?").get(NAMESPACE, accountId);
    if (!row?.value) return null;
    const parsed = parseJson(row.value);
    if (!parsed || typeof parsed.balance !== "number") return null;
    return parsed.balance;
}
function getAllPersistedCreditBalances() {
    const result = new Map();
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isBuildPhase"] || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"]) return result;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = ?").all(NAMESPACE);
    for (const row of rows){
        const parsed = parseJson(row.value);
        if (parsed && typeof parsed.balance === "number") {
            result.set(row.key, parsed.balance);
        }
    }
    return result;
}
function persistCreditBalance(accountId, balance) {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isBuildPhase"] || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"]) return;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const entry = {
        balance,
        updatedAt: new Date().toISOString()
    };
    db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES (?, ?, ?)").run(NAMESPACE, accountId, JSON.stringify(entry));
}
}),
"[project]/src/lib/db/models/shared.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/db/models/synced.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normalizeSyncedAvailableModels",
    ()=>normalizeSyncedAvailableModels
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$github$2f$retiredModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/github/retiredModels.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/shared.ts [instrumentation] (ecmascript)");
;
;
function normalizeSyncedAvailableModel(model) {
    const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["asRecord"])(model);
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.id) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.name) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.model);
    if (!id) return null;
    const name = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.name) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.displayName) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.model) || id;
    const supportedEndpoints = Array.isArray(record.supportedEndpoints) ? Array.from(new Set(record.supportedEndpoints.map((endpoint)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNonEmptyString"])(endpoint)).filter((endpoint)=>Boolean(endpoint)))).sort() : undefined;
    return {
        id,
        name,
        source: "imported",
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.apiFormat) ? {
            apiFormat: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.apiFormat)
        } : {},
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.targetFormat) ? {
            targetFormat: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.targetFormat)
        } : {},
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.upstreamProtocol) ? {
            upstreamProtocol: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.upstreamProtocol)
        } : {},
        ...supportedEndpoints && supportedEndpoints.length > 0 ? {
            supportedEndpoints
        } : {},
        ...Array.isArray(record.supportedThinkingEfforts) ? {
            supportedThinkingEfforts: record.supportedThinkingEfforts.filter((effort)=>typeof effort === "string" && effort.length > 0)
        } : {},
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.defaultThinkingEffort) ? {
            defaultThinkingEffort: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.defaultThinkingEffort)
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
        if (normalized && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$github$2f$retiredModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isRetiredGitHubCopilotModelId"])(providerId, normalized.id)) {
            deduped.set(normalized.id, normalized);
        }
    }
    return Array.from(deduped.values());
}
}),
"[project]/src/lib/db/models/compat.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
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
/** db/models/compat.ts — model-compat overrides (normalizeToolCallId, per-protocol flags, upstream headers). */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelCompat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/modelCompat.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$upstreamHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/upstreamHeaders.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/shared.ts [instrumentation] (ecmascript)");
;
;
;
;
;
/** Built-in / alias models: tool-call + developer-role flags without a full custom row */ const MODEL_COMPAT_NAMESPACE = "modelCompatOverrides";
;
function isCompatProtocolKey(p) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelCompat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["MODEL_COMPAT_PROTOCOL_KEYS"].includes(p);
}
const UPSTREAM_HEADERS_MAX = 16;
const UPSTREAM_HEADER_NAME_MAX = 128;
const UPSTREAM_HEADER_VALUE_MAX = 4096;
function isValidUpstreamHeaderName(k) {
    if (!k || k.length > UPSTREAM_HEADER_NAME_MAX) return false;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$upstreamHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isForbiddenUpstreamHeaderName"])(k)) return false;
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = ? AND key = ?").get(MODEL_COMPAT_NAMESPACE, providerId);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKeyValue"])(row).value;
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch  {
        return [];
    }
}
function writeCompatList(providerId, list) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    if (list.length === 0) {
        db.prepare("DELETE FROM key_value WHERE namespace = ? AND key = ?").run(MODEL_COMPAT_NAMESPACE, providerId);
    } else {
        db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES (?, ?, ?)").run(MODEL_COMPAT_NAMESPACE, providerId, JSON.stringify(list));
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
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
"[project]/src/lib/db/models/aliases.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
/** db/models/aliases.ts — model alias CRUD (modelAliases namespace, providerAliases namespace). */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/shared.ts [instrumentation] (ecmascript)");
;
;
;
async function getModelAliases() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'modelAliases'").all();
    const result = {};
    for (const row of rows){
        const { key, value } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKeyValue"])(row);
        if (!key || value === null) continue;
        result[key] = JSON.parse(value);
    }
    return result;
}
async function setModelAlias(alias, model) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('modelAliases', ?, ?)").run(alias, JSON.stringify(model));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
}
async function deleteModelAlias(alias) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("DELETE FROM key_value WHERE namespace = 'modelAliases' AND key = ?").run(alias);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
}
function getProviderAliases(providerId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'providerAliases' AND key = ?").get(providerId);
    const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKeyValue"])(row).value;
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('providerAliases', ?, ?)").run(providerId, JSON.stringify(current));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
}
function removeProviderAlias(providerId, alias) {
    const current = getProviderAliases(providerId);
    if (!(alias in current)) return;
    delete current[alias];
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    if (Object.keys(current).length === 0) {
        db.prepare("DELETE FROM key_value WHERE namespace = 'providerAliases' AND key = ?").run(providerId);
    } else {
        db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('providerAliases', ?, ?)").run(providerId, JSON.stringify(current));
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
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
"[project]/src/lib/db/models/mitmAlias.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getMitmAlias",
    ()=>getMitmAlias,
    "setMitmAliasAll",
    ()=>setMitmAliasAll
]);
/** db/models/mitmAlias.ts — MITM alias CRUD (mitmAlias namespace). */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/shared.ts [instrumentation] (ecmascript)");
;
;
;
async function getMitmAlias(toolName) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    if (toolName) {
        const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'mitmAlias' AND key = ?").get(toolName);
        const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKeyValue"])(row).value;
        return value ? JSON.parse(value) : {};
    }
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'mitmAlias'").all();
    const result = {};
    for (const row of rows){
        const { key, value } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKeyValue"])(row);
        if (!key || value === null) continue;
        result[key] = JSON.parse(value);
    }
    return result;
}
async function setMitmAliasAll(toolName, mappings) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('mitmAlias', ?, ?)").run(toolName, JSON.stringify(mappings || {}));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
}
}),
"[project]/src/lib/db/models.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$github$2f$retiredModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/github/retiredModels.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/shared.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$synced$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/synced.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/models/compat.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$aliases$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/aliases.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$mitmAlias$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/mitmAlias.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    if (providerId) {
        const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'customModels' AND key = ?").get(providerId);
        const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKeyValue"])(row).value;
        return value ? JSON.parse(value) : [];
    }
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'customModels'").all();
    const result = {};
    for (const row of rows){
        const { key, value } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKeyValue"])(row);
        if (!key || value === null) continue;
        result[key] = JSON.parse(value);
    }
    return result;
}
async function getAllCustomModels() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'customModels'").all();
    const result = {};
    for (const row of rows){
        const { key, value } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKeyValue"])(row);
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'customModels' AND key = ?").get(providerId);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKeyValue"])(row).value;
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return merged;
}
async function deleteImportedCustomModels(providerId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'customModels' AND key = ?").get(providerId);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKeyValue"])(row).value;
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
    for (const modelId of removedIds)(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["removeModelCompatOverride"])(providerId, modelId);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return removedIds;
}
async function removeCustomModel(providerId, modelId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'customModels' AND key = ?").get(providerId);
    if (!row) return false;
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKeyValue"])(row).value;
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["removeModelCompatOverride"])(providerId, modelId);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return true;
}
async function getSyncedAvailableModelsForConnection(providerId, connectionId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const key = `${providerId}:${connectionId}`;
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'syncedAvailableModels' AND key = ?").get(key);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKeyValue"])(row).value;
    if (!value) return [];
    try {
        const models = JSON.parse(value);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$synced$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeSyncedAvailableModels"])(models, providerId);
    } catch  {
        return [];
    }
}
async function getSyncedAvailableModels(providerId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'syncedAvailableModels' AND key LIKE ?").all(`${providerId}:%`);
    const map = new Map();
    for (const row of rows){
        const { key, value } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKeyValue"])(row);
        if (!key || value === null) continue;
        const models = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$synced$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeSyncedAvailableModels"])(JSON.parse(value), providerId);
        for (const m of models){
            if (m.id) map.set(m.id, m);
        }
    }
    return Array.from(map.values());
}
async function getSyncedAvailableModelsByConnection(providerId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const prefix = `${providerId}:`;
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'syncedAvailableModels' AND key LIKE ?").all(`${prefix}%`);
    const result = {};
    for (const row of rows){
        const { key, value } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKeyValue"])(row);
        if (!key || value === null || !key.startsWith(prefix)) continue;
        try {
            const connectionId = key.slice(prefix.length);
            result[connectionId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$synced$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeSyncedAvailableModels"])(JSON.parse(value), providerId);
        } catch  {
        // Ignore malformed legacy entries.
        }
    }
    return result;
}
async function getAllSyncedAvailableModels() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'syncedAvailableModels'").all();
    // Group by providerId (before the colon)
    const byProvider = new Map();
    for (const row of rows){
        const { key, value } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKeyValue"])(row);
        if (!key || value === null) continue;
        const providerId = key.split(":")[0];
        if (!byProvider.has(providerId)) byProvider.set(providerId, new Map());
        const models = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$synced$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeSyncedAvailableModels"])(JSON.parse(value), providerId);
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
    return rows.map((row)=>row.provider).filter((provider)=>typeof provider === "string" && provider.length > 0).filter((provider)=>!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$github$2f$retiredModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isRetiredGitHubCopilotModelId"])(provider, modelId));
}
async function replaceSyncedAvailableModelsForConnection(providerId, connectionId, models) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const key = `${providerId}:${connectionId}`;
    // #3199: drop ids the operator DELETED (trash) so a re-fetch does not re-import
    // a model that was explicitly removed.
    // #3782: key ONLY on the distinct `isDeleted` marker — NOT on `isHidden`.
    // Eye/visibility-hidden models (`isHidden:true`, no `isDeleted`) must stay in
    // the synced store so they remain listed-but-hidden across re-syncs instead of
    // churning back on through the managed-alias path ("Auto Sync Enabling all
    // Models"). See getModelIsDeleted for the legacy-row caveat.
    const normalizedModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$synced$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeSyncedAvailableModels"])(models, providerId).filter((m)=>!getModelIsDeleted(providerId, m.id));
    if (normalizedModels.length === 0) {
        db.prepare("DELETE FROM key_value WHERE namespace = 'syncedAvailableModels' AND key = ?").run(key);
    } else {
        db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('syncedAvailableModels', ?, ?)").run(key, JSON.stringify(normalizedModels));
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    // Return the full unioned list for the provider
    return getSyncedAvailableModels(providerId);
}
async function removeSyncedAvailableModel(providerId, modelId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const prefix = `${providerId}:`;
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'syncedAvailableModels' AND key LIKE ?").all(`${prefix}%`);
    let removedAny = false;
    const removeModel = db.transaction(()=>{
        for (const row of rows){
            const { key, value } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKeyValue"])(row);
            if (!key || value === null) continue;
            let parsedModels;
            try {
                parsedModels = JSON.parse(value);
            } catch (error) {
                console.warn(`[DB] Skipping malformed syncedAvailableModels entry for key ${key}:`, error);
                continue;
            }
            const models = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$synced$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeSyncedAvailableModels"])(parsedModels, providerId);
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
        if (removedAny) (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    });
    removeModel();
    return removedAny;
}
async function deleteSyncedAvailableModelsForConnection(providerId, connectionId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const key = `${providerId}:${connectionId}`;
    db.prepare("DELETE FROM key_value WHERE namespace = 'syncedAvailableModels' AND key = ?").run(key);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return getSyncedAvailableModels(providerId);
}
async function cleanupProviderModelsAfterConnectionDelete(providerId, connectionId) {
    const remainingSyncedModels = await deleteSyncedAvailableModelsForConnection(providerId, connectionId);
    const remainingConnections = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderConnectionsCount"])({
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const keyPrefix = `${providerId}:`;
    const result = db.prepare("DELETE FROM key_value WHERE namespace = 'syncedAvailableModels' AND substr(key, 1, ?) = ?").run(keyPrefix.length, keyPrefix);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return Number(result.changes || 0);
}
async function pruneStaleSyncedAvailableModelsForProvider(providerId, allowedConnectionIds) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    if (allowedConnectionIds.length === 0) {
        return deleteSyncedAvailableModelsForProvider(providerId);
    }
    const placeholders = allowedConnectionIds.map(()=>"?").join(",");
    const keyPrefix = `${providerId}:`;
    const allowedKeys = allowedConnectionIds.map((id)=>`${providerId}:${id}`);
    const result = db.prepare(`DELETE FROM key_value WHERE namespace = 'syncedAvailableModels' AND key LIKE ? AND key NOT IN (${placeholders})`).run(`${keyPrefix}%`, ...allowedKeys);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'customModels' AND key = ?").get(providerId);
    if (!row) return null;
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKeyValue"])(row).value;
    if (!value) return null;
    const models = JSON.parse(value);
    const index = models.findIndex((m)=>m.id === modelId);
    if (index === -1) return null;
    const current = models[index];
    const currentCompat = current.compatByProtocol;
    let mergedCompat = currentCompat;
    if (updates.compatByProtocol !== undefined && typeof updates.compatByProtocol === "object" && updates.compatByProtocol !== null && !Array.isArray(updates.compatByProtocol)) {
        mergedCompat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["deepMergeCompatByProtocol"])(currentCompat, updates.compatByProtocol);
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["compatByProtocolHasEntries"])(mergedCompat)) mergedCompat = undefined;
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
        if (mergedCompat && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["compatByProtocolHasEntries"])(mergedCompat)) {
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
            const s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sanitizeUpstreamHeadersMap"])(uh);
            if (Object.keys(s).length === 0) delete next.upstreamHeaders;
            else next.upstreamHeaders = s;
        }
    }
    models[index] = next;
    db.prepare("UPDATE key_value SET value = ? WHERE namespace = 'customModels' AND key = ?").run(JSON.stringify(models), providerId);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return next;
}
/** Single custom model row from key_value customModels, or null */ function getCustomModelRow(providerId, modelId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'customModels' AND key = ?").get(providerId);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKeyValue"])(row).value;
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
    const protocol = sourceFormat && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCompatProtocolKey"])(sourceFormat) ? sourceFormat : null;
    if (m) {
        if (protocol) {
            const pc = m.compatByProtocol?.[protocol];
            if (pc && Object.prototype.hasOwnProperty.call(pc, "normalizeToolCallId")) {
                return Boolean(pc.normalizeToolCallId);
            }
        }
        return Boolean(m.normalizeToolCallId);
    }
    const co = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["readCompatList"])(providerId).find((e)=>e.id === modelId);
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
    const protocol = sourceFormat && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCompatProtocolKey"])(sourceFormat) ? sourceFormat : null;
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
    const co = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["readCompatList"])(providerId).find((e)=>e.id === modelId);
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
    const co = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["readCompatList"])(providerId).find((e)=>e.id === modelId);
    return Boolean(co?.isHidden);
}
function getHiddenModelsByProvider() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
    const co = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["readCompatList"])(providerId).find((e)=>e.id === modelId);
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
    const list = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["readCompatList"])(providerId);
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
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["writeCompatList"])(providerId, list);
        return;
    }
    if (idx < 0) return;
    if (Object.keys(list[idx]).length <= 1) {
        // Only `id` left; drop the entry entirely.
        const filtered = list.filter((_, i)=>i !== idx);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["writeCompatList"])(providerId, filtered);
        return;
    }
    delete list[idx].isHidden;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["writeCompatList"])(providerId, list);
}
function readUpstreamFromJsonRecord(row, key) {
    if (!row) return undefined;
    const raw = row[key];
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
    const s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sanitizeUpstreamHeadersMap"])(raw);
    return Object.keys(s).length > 0 ? s : undefined;
}
function getModelUpstreamExtraHeaders(providerId, modelId, sourceFormat) {
    const protocol = sourceFormat && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCompatProtocolKey"])(sourceFormat) ? sourceFormat : null;
    const m = getCustomModelRow(providerId, modelId);
    const base = {};
    if (m) {
        const fromModel = readUpstreamFromJsonRecord(m, "upstreamHeaders");
        if (fromModel) Object.assign(base, fromModel);
        if (protocol) {
            const pc = m.compatByProtocol?.[protocol];
            const fromProto = pc?.upstreamHeaders;
            if (fromProto && typeof fromProto === "object") {
                Object.assign(base, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sanitizeUpstreamHeadersMap"])(fromProto));
            }
        }
        return base;
    }
    const co = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["readCompatList"])(providerId).find((e)=>e.id === modelId);
    if (co?.upstreamHeaders) {
        Object.assign(base, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sanitizeUpstreamHeadersMap"])(co.upstreamHeaders));
    }
    if (protocol && co?.compatByProtocol?.[protocol]?.upstreamHeaders) {
        Object.assign(base, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sanitizeUpstreamHeadersMap"])(co.compatByProtocol[protocol].upstreamHeaders));
    }
    return base;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
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
];

//# sourceMappingURL=src_lib_0qiyvi7._.js.map