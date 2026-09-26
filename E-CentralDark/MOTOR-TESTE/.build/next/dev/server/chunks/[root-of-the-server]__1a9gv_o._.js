module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/node:module [external] (node:module, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:module", () => require("node:module"));

module.exports = mod;
}),
"[externals]/node:fs [external] (node:fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs", () => require("node:fs"));

module.exports = mod;
}),
"[project]/src/lib/db/adapters/betterSqliteAdapter.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/db/adapters/bunSqliteAdapter.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/db/adapters/nodeSqliteShared.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[externals]/bun:sqlite [external] (bun:sqlite, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("bun:sqlite", () => require("bun:sqlite"));

module.exports = mod;
}),
"[project]/src/lib/db/adapters/driverFactory.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$adapters$2f$betterSqliteAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/adapters/betterSqliteAdapter.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$adapters$2f$bunSqliteAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/adapters/bunSqliteAdapter.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$adapters$2f$nodeSqliteShared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/adapters/nodeSqliteShared.ts [app-route] (ecmascript)");
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
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$adapters$2f$bunSqliteAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createBunSqliteAdapter"])(db, filePath);
            } catch (err) {
                logSwallowedDriverError("bun:sqlite", err);
            }
        }
        // better-sqlite3: rápido, nativo — skip em Bun
        if (!process.versions.bun) {
            try {
                const BetterSqlite = load("better-sqlite3");
                const db = new BetterSqlite(filePath, options);
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$adapters$2f$betterSqliteAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createBetterSqliteAdapter"])(db);
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
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$adapters$2f$nodeSqliteShared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createNodeSqliteAdapterFromDatabase"])(db, filePath);
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
        const { createSqlJsAdapter } = await __turbopack_context__.A("[project]/src/lib/db/adapters/sqljsAdapter.ts [app-route] (ecmascript, async loader)");
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
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/src/lib/db/probeUtils.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
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
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[project]/src/types/databaseSettings.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Database performance optimization settings stored in SQLite key-value pairs.
 * User-configurable aggregation, retention, and optimization settings.
 */ __turbopack_context__.s([
    "DEFAULT_DATABASE_SETTINGS",
    ()=>DEFAULT_DATABASE_SETTINGS
]);
const DEFAULT_DATABASE_SETTINGS = {
    logs: {
        detailedLogsEnabled: false,
        callLogPipelineEnabled: false,
        maxDetailSizeKb: 10,
        ringBufferSize: 500
    },
    backup: {
        autoBackupEnabled: false,
        autoBackupFrequency: "never",
        keepLastNBackups: 5
    },
    cache: {
        semanticCacheEnabled: true,
        semanticCacheMaxSize: 100,
        semanticCacheTTL: 1800000,
        promptCacheEnabled: true,
        promptCacheStrategy: "auto",
        alwaysPreserveClientCache: "auto",
        // Keep in sync with CATALOG_CACHE_TTL_MS_DEFAULT
        // (src/app/api/v1/models/catalogCache.ts) — this value is what actually takes
        // effect, since catalog.ts reads it as `dbSettings.cache?.modelCatalogCacheTtlMs
        // ?? CATALOG_CACHE_TTL_MS_DEFAULT` and the `??` never falls through while a
        // default is declared here. Guarded by tests/unit/v1-models-catalog-ttl.test.ts.
        modelCatalogCacheTtlMs: 60_000
    },
    retention: {
        quotaSnapshots: 7,
        compressionAnalytics: 30,
        mcpAudit: 30,
        a2aEvents: 30,
        callLogs: 30,
        usageHistory: 30,
        memoryEntries: 30,
        domainCostHistory: 30,
        compressionCacheStats: 30,
        xpAuditLog: 30,
        compressionRunTelemetry: 30,
        autoCleanupEnabled: true
    },
    aggregation: {
        enabled: true,
        rawDataRetentionDays: 30,
        granularity: "daily"
    },
    optimization: {
        autoVacuumMode: "FULL",
        scheduledVacuum: "weekly",
        vacuumHour: 2,
        pageSize: 4096,
        cacheSize: 65536,
        optimizeOnStartup: true
    }
};
}),
"[project]/src/shared/utils/testProcess.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isAutomatedTestProcess",
    ()=>isAutomatedTestProcess,
    "isBuildProcess",
    ()=>isBuildProcess
]);
/**
 * "Am I running under an automated test runner?" — one answer, one place.
 *
 * Eleven subsystems each carried their own copy of this check, and every copy decided it with
 * `process.argv.some((arg) => arg.includes("test"))`. That substring test is wrong in a way that is
 * easy to miss and expensive to hit: `'latest'.includes('test') === true`. Any argv carrying a
 * `latest` segment — a release symlink (`/opt/app/latest/server.js`), an npm/npx cache path, a
 * `--model=latest` flag — silently flipped the process into "test mode", and the subsystems gated on
 * it turned themselves off without a word. The worst of them is `src/lib/db/backup.ts`:
 * `isSqliteAutoBackupDisabled()` returns true, so SQLite auto-backup simply never runs. Same class of
 * silent disable for migrations, cloud sync, the health checks and quota recovery.
 *
 * Matching rules:
 *  - env first (`NODE_ENV=test`, `VITEST`) — unchanged behaviour.
 *  - argv: `test`/`tests` only as a WHOLE token delimited by a path separator, dot or dash — so
 *    `--test`, `tests/unit/x.test.ts` and `src/x.test.ts` match, while `latest`, `protest`,
 *    `contest` and `attestation` do not.
 *  - argv: known runner binaries (vitest/jest/mocha/ava/tap), which have no delimiter before "test".
 *
 * argv and env are parameters rather than globals so the behaviour is testable: under a test runner
 * the globals always say "test", which is exactly why the substring bug could never be caught.
 */ /** `test`/`tests` as a whole token: `--test`, `/tests/`, `.test.ts` — but never `latest`/`protest`. */ const TEST_TOKEN_RE = /(^|[\\/.-])tests?([\\/.-]|$)/i;
/** Runner binaries: no delimiter precedes "test" in "vitest", so they need their own rule. */ const TEST_RUNNER_RE = /(^|[\\/])(vitest|jest|mocha|ava|tap)(\.[cm]?js)?$/i;
function isAutomatedTestProcess(// execArgv too: `node --test x.js` puts `--test` in execArgv, not argv (modelLockoutSettings was the
// only copy that remembered to look there — now every caller gets it).
argv = typeof process !== "undefined" ? [
    ...process.argv,
    ...process.execArgv
] : [], env = typeof process !== "undefined" ? process.env : {}) {
    if (env.NODE_ENV === "test") return true;
    if (env.VITEST !== undefined) return true;
    // Defensive: tolerate a non-array argv (e.g. a caller passing arguments out
    // of order) instead of throwing `argv.some is not a function` — this check
    // gates production behavior (auto-backup, migrations, cloud sync…), so it
    // must never crash the process it's protecting.
    if (!Array.isArray(argv)) return false;
    return argv.some((arg)=>typeof arg === "string" && (TEST_TOKEN_RE.test(arg) || TEST_RUNNER_RE.test(arg)));
}
function isBuildProcess(env = process.env) {
    return typeof process !== "undefined" && env.NEXT_PHASE === "phase-production-build";
}
}),
"[project]/src/lib/db/migrationRunner/constants.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/db/migrationRunner/extraDirs.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/db/migrationRunner.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/databaseSettings.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/testProcess.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$migrationRunner$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/migrationRunner/constants.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$migrationRunner$2f$extraDirs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/migrationRunner/extraDirs.ts [app-route] (ecmascript)");
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
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$migrationRunner$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["OPTIONAL_FTS5_MIGRATION_VERSIONS"].has(migration.version);
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
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(MIGRATIONS_DIR)) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$migrationRunner$2f$extraDirs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getExtraMigrationFiles"])();
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
        const liveNames = names.filter((name)=>!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$migrationRunner$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SUPERSEDED_DUPLICATE_MIGRATIONS"].some((sup)=>sup.version === version && sup.name === name));
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
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$migrationRunner$2f$extraDirs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getExtraMigrationFiles"])()
    ];
}
function filterSupersededDuplicateMigrations(files) {
    return files.filter((file)=>{
        const superseded = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$migrationRunner$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SUPERSEDED_DUPLICATE_MIGRATIONS"].find((migration)=>migration.version === file.version && migration.name === file.name);
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
    for (const sentinel of __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$migrationRunner$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PHYSICAL_SCHEMA_SENTINELS"]){
        if (hasTable(db, sentinel.tableName)) {
            return {
                version: sentinel.version,
                description: sentinel.description
            };
        }
    }
    const hasInitialSchema = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$migrationRunner$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["INITIAL_SCHEMA_SENTINELS"].every((tableName)=>hasTable(db, tableName));
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
    for (const compatibility of __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$migrationRunner$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RENAMED_MIGRATION_COMPATIBILITY"]){
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
    for (const legacy of __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$migrationRunner$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["LEGACY_VERSION_SLOT_MIGRATIONS"]){
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
    const isTestEnvironment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAutomatedTestProcess"])();
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
        for (const [section, values] of Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"])){
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
"[project]/src/lib/db/healthCheck.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "runDbHealthCheck",
    ()=>runDbHealthCheck
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/combos/steps.ts [app-route] (ecmascript)");
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
                    const normalizedStep = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeComboStep"])(rawStep, {
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
"[project]/src/lib/db/stateReset.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/shared/constants/featureFlagDefinitions.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FEATURE_FLAG_DEFINITIONS",
    ()=>FEATURE_FLAG_DEFINITIONS
]);
const FEATURE_FLAG_DEFINITIONS = [
    // ──────────────── Security (9) ────────────────
    {
        key: "REQUIRE_API_KEY",
        label: "Require API Key",
        description: "Require an API key for all incoming requests",
        descriptionI18nKey: "featureFlagRequireApiKeyDescription",
        category: "security",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "caution"
    },
    {
        key: "INPUT_SANITIZER_ENABLED",
        label: "Input Sanitizer",
        description: "Enable input sanitization for all requests",
        descriptionI18nKey: "featureFlagInputSanitizerEnabledDescription",
        category: "security",
        defaultValue: "true",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "INJECTION_GUARD_MODE",
        label: "Injection Guard Mode",
        description: "Set the prompt injection guard mode",
        descriptionI18nKey: "featureFlagInjectionGuardModeDescription",
        category: "security",
        defaultValue: "off",
        type: "enum",
        enumValues: [
            "off",
            "warn",
            "block",
            "redact"
        ],
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "PII_REDACTION_ENABLED",
        label: "PII Redaction",
        description: "Redact personally identifiable information from requests",
        descriptionI18nKey: "featureFlagPiiRedactionEnabledDescription",
        category: "security",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "PII_RESPONSE_SANITIZATION",
        label: "PII Response Sanitization",
        description: "Sanitize PII from provider responses",
        descriptionI18nKey: "featureFlagPiiResponseSanitizationDescription",
        category: "security",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "PII_RESPONSE_SANITIZATION_MODE",
        label: "PII Response Sanitization Mode",
        description: "Mode for PII response sanitization: redact (replace PII), warn (log only), block (reject), off (disable)",
        descriptionI18nKey: "featureFlagPiiResponseSanitizationModeDescription",
        category: "security",
        defaultValue: "redact",
        type: "enum",
        enumValues: [
            "redact",
            "warn",
            "block",
            "off"
        ],
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "OUTBOUND_SSRF_GUARD_ENABLED",
        label: "SSRF Guard",
        description: "Block outbound requests to private/internal IP ranges",
        descriptionI18nKey: "featureFlagOutboundSsrfGuardEnabledDescription",
        category: "security",
        defaultValue: "true",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "ALLOW_API_KEY_REVEAL",
        label: "API Key Reveal",
        description: "Allow authenticated dashboard users to reveal stored API keys instead of only seeing masked values.",
        descriptionI18nKey: "featureFlagAllowApiKeyRevealDescription",
        category: "security",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "danger"
    },
    // ──────────────── Network (7) ────────────────
    {
        key: "ENABLE_TLS_FINGERPRINT",
        label: "TLS Fingerprint",
        description: "Enable TLS fingerprint stealth mode",
        descriptionI18nKey: "featureFlagEnableTlsFingerprintDescription",
        category: "network",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: true,
        warningLevel: "info"
    },
    {
        key: "AUDIO_REMOTE_PROVIDER_NODES",
        label: "Remote Audio Provider Nodes",
        description: "Allow the /v1/audio/* routes to use OpenAI-compatible provider nodes hosted outside localhost. Off by default — routing audio to a remote host changes egress identity and must be an explicit operator decision. Loopback nodes are always allowed and unaffected.",
        descriptionI18nKey: "settings.featureFlags.audioRemoteProviderNodes",
        category: "network",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "danger"
    },
    {
        key: "ONEPROXY_ENABLED",
        label: "OneProxy Enabled",
        description: "Enable 1proxy request proxying.",
        descriptionI18nKey: "settings.featureFlags.oneproxyEnabled",
        category: "network",
        defaultValue: "true",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "PROXY_AUTO_SELECT_ENABLED",
        label: "Proxy Auto-Selection Fallback",
        description: "When no proxy is assigned to a connection, auto-select the first working proxy from the registry. Off by default — otherwise any single registry proxy becomes a global fallback for all traffic (#3332).",
        descriptionI18nKey: "settings.featureFlags.proxyAutoSelectEnabled",
        category: "network",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "caution"
    },
    {
        key: "OMNIROUTE_CONTROL_PLANE_PROXY_DIRECT_FALLBACK",
        label: "Control-Plane Proxy Direct Fallback",
        description: "Allow OAuth and provider validation flows to bypass a pinned proxy and connect directly when proxy reachability pre-checks fail. Off by default because this can change account egress IP.",
        descriptionI18nKey: "featureFlagOmnirouteControlPlaneProxyDirectFallbackDescription",
        category: "network",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "danger"
    },
    {
        key: "MITM_DISABLE_TLS_VERIFY",
        label: "Disable TLS Verify (MITM)",
        description: "Disable TLS certificate verification for MITM proxy",
        descriptionI18nKey: "featureFlagMitmDisableTlsVerifyDescription",
        category: "network",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: true,
        warningLevel: "danger"
    },
    {
        key: "OMNIROUTE_ALLOW_PRIVATE_PROVIDER_URLS",
        label: "Allow Private Provider URLs",
        description: "Allow provider URLs pointing to private/internal networks",
        descriptionI18nKey: "featureFlagOmnirouteAllowPrivateProviderUrlsDescription",
        category: "network",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "caution"
    },
    {
        key: "OMNIROUTE_ALLOW_LOCAL_PROVIDER_URLS",
        label: "Allow Local Provider URLs",
        description: "Allow adding and validating providers on local/private addresses (127.0.0.1, localhost, LAN, private IP ranges) — needed for local OpenAI-compatible models. Enabled by default (OmniRoute is local-first); turn it OFF to enforce strict public-only blocking if you only use public providers. Cloud-metadata endpoints (e.g. 169.254.169.254) stay blocked either way.",
        descriptionI18nKey: "featureFlagOmnirouteAllowLocalProviderUrlsDescription",
        category: "network",
        defaultValue: "true",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "caution"
    },
    {
        key: "ENABLE_CC_COMPATIBLE_PROVIDER",
        label: "CC Compatible Provider",
        description: "Enable Claude Code compatible provider mode",
        descriptionI18nKey: "featureFlagEnableCcCompatibleProviderDescription",
        category: "network",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: true,
        warningLevel: "info"
    },
    // ──────────────── Policies (4) ────────────────
    {
        key: "TOOL_POLICY_MODE",
        label: "Tool Policy Mode",
        description: "Set the tool use policy enforcement mode",
        descriptionI18nKey: "featureFlagToolPolicyModeDescription",
        category: "policies",
        defaultValue: "disabled",
        type: "enum",
        enumValues: [
            "disabled",
            "warn",
            "block"
        ],
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "RATE_LIMIT_AUTO_ENABLE",
        label: "Rate Limit Auto-Enable",
        description: "Automatically enable rate limiting based on usage patterns",
        descriptionI18nKey: "featureFlagRateLimitAutoEnableDescription",
        category: "policies",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "ALLOW_MULTI_CONNECTIONS_PER_COMPAT_NODE",
        label: "Multi Connections per Compat Node",
        description: "Allow multiple connections per compatibility node",
        descriptionI18nKey: "featureFlagAllowMultiConnectionsPerCompatNodeDescription",
        category: "policies",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: true,
        warningLevel: "info"
    },
    {
        key: "RADAR_ENABLED",
        label: "Radar",
        description: "Enable the OmniRoute Radar module (catalog feed screens and sync). Off by default; enabling only unlocks the UI — data sync remains a separate opt-in.",
        descriptionI18nKey: "featureFlagRadarEnabledDescription",
        category: "policies",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    // ──────────────── Runtime (16) ────────────────
    {
        key: "RESPONSES_PASSTHROUGH_DROP_COMMENTARY",
        label: "Drop Responses Commentary",
        description: "Drop internal commentary-phase output items from Responses API passthrough streams before forwarding to clients. Disable to receive raw upstream commentary.",
        descriptionI18nKey: "featureFlagResponsesPassthroughDropCommentaryDescription",
        category: "runtime",
        defaultValue: "true",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "OMNIROUTE_MCP_ENFORCE_SCOPES",
        label: "MCP Enforce Scopes",
        description: "Enforce scope restrictions on MCP tool access",
        descriptionI18nKey: "featureFlagOmnirouteMcpEnforceScopesDescription",
        category: "runtime",
        defaultValue: "true",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "caution"
    },
    {
        key: "OMNIROUTE_MCP_COMPRESS_DESCRIPTIONS",
        label: "MCP Compress Descriptions",
        description: "Compress MCP tool descriptions to reduce token usage",
        descriptionI18nKey: "featureFlagOmnirouteMcpCompressDescriptionsDescription",
        category: "runtime",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "OMNIROUTE_ENABLE_RUNTIME_BACKGROUND_TASKS",
        label: "Runtime Background Tasks",
        description: "Enable background task processing at runtime",
        descriptionI18nKey: "featureFlagOmnirouteEnableRuntimeBackgroundTasksDescription",
        category: "runtime",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "OMNIROUTE_DISABLE_BACKGROUND_SERVICES",
        label: "Disable Background Services",
        description: "Disable all background services (quota refresh, sync, etc)",
        descriptionI18nKey: "featureFlagOmnirouteDisableBackgroundServicesDescription",
        category: "runtime",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: true,
        warningLevel: "caution"
    },
    {
        key: "OMNIROUTE_RTK_TRUST_PROJECT_FILTERS",
        label: "RTK Trust Project Filters",
        description: "Trust project-level filters from RTK without validation",
        descriptionI18nKey: "featureFlagOmnirouteRtkTrustProjectFiltersDescription",
        category: "runtime",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "caution"
    },
    {
        key: "OMNIROUTE_ENABLE_LIVE_WS",
        label: "Live Dashboard WebSocket",
        description: "Start the real-time dashboard WebSocket server on import (port 20132, loopback-bound by default). Default: enabled. Set to '0' or 'false' to disable. LAN exposure requires LIVE_WS_HOST=0.0.0.0 + LIVE_WS_ALLOWED_ORIGINS.",
        descriptionI18nKey: "featureFlagOmnirouteEnableLiveWsDescription",
        category: "runtime",
        defaultValue: "true",
        type: "boolean",
        requiresRestart: true,
        warningLevel: "info"
    },
    {
        key: "OMNIROUTE_CODEX_WS_ENABLED",
        label: "Codex Responses WebSocket",
        description: "Allow Codex to use the Responses-over-WebSocket transport (the codex CLI WS endpoint and codexTransport=websocket). When off, Codex falls back to HTTP Responses.",
        descriptionI18nKey: "featureFlagOmnirouteCodexWsEnabledDescription",
        category: "runtime",
        defaultValue: "true",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "OMNIROUTE_EMERGENCY_FALLBACK",
        label: "Emergency Fallback",
        description: "Route budget-exhausted requests to the emergency free fallback provider/model.",
        descriptionI18nKey: "featureFlagOmnirouteEmergencyFallbackDescription",
        category: "runtime",
        defaultValue: "true",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "caution"
    },
    {
        key: "STREAM_RECOVERY_ENABLED",
        label: "Stream Recovery",
        description: "Enable transparent early retry for truncated upstream SSE streams before any response bytes reach the client.",
        descriptionI18nKey: "featureFlagStreamRecoveryEnabledDescription",
        category: "runtime",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "caution"
    },
    {
        key: "STREAM_RECOVERY_MIDSTREAM_ENABLED",
        label: "Mid-Stream Continuation",
        description: "Allow stream recovery to re-request and stitch a response after bytes have already reached the client.",
        descriptionI18nKey: "featureFlagStreamRecoveryMidstreamEnabledDescription",
        category: "runtime",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "danger"
    },
    {
        key: "MODEL_CATALOG_INCLUDE_NAMES",
        label: "Model Catalog Names",
        description: "Include display-friendly name fields in /v1/models responses. Disable for clients that expect model IDs only.",
        descriptionI18nKey: "settings.featureFlags.modelCatalogIncludeNames",
        category: "runtime",
        defaultValue: "true",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "MODELS_CATALOG_PREFIX_MODE",
        label: "Models Catalog Prefix Mode",
        description: "Controls how model IDs are prefixed in /v1/models. 'dual' (default) emits both alias and canonical provider-id prefixes for backward compatibility. 'alias' emits only the short alias prefix (e.g. ds-web/model, not deepseek-web/model). 'canonical' emits only the full provider-id prefix.",
        descriptionI18nKey: "featureFlagModelsCatalogPrefixModeDescription",
        category: "runtime",
        defaultValue: "dual",
        type: "enum",
        enumValues: [
            "dual",
            "alias",
            "canonical"
        ],
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "ARENA_ELO_SYNC_ENABLED",
        label: "Arena ELO Sync",
        description: "Enable periodic Arena AI leaderboard ELO sync for model intelligence rankings.",
        descriptionI18nKey: "featureFlagArenaEloSyncEnabledDescription",
        category: "runtime",
        defaultValue: "true",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "EXPOSE_CC_DISCOVERY_ALIASES",
        label: "Claude Code Discovery Aliases",
        description: "Advertise claude/<provider>/<model> mirror ids on /v1/models so Claude Code gateway model discovery lists non-Claude models. Warning: doubles catalog entries for all clients when enabled globally.",
        descriptionI18nKey: "featureFlagExposeCcDiscoveryAliasesDescription",
        category: "runtime",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "EXPOSE_FUNCTIONAL_GATEWAY_MIRRORS",
        label: "Functional Gateway Mirrors",
        description: "Advertise <gateway-alias>/<model> mirror ids on /v1/models for models whose canonical owner has no active credential but a passthrough gateway with an active credential routes them. Warning: adds catalog entries for all clients when enabled globally.",
        descriptionI18nKey: "featureFlagExposeFunctionalGatewayMirrorsDescription",
        category: "runtime",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "NEWAPI_AGGREGATOR_BALANCE",
        label: "New-API Aggregator Balance",
        description: "Enable balance detection for New-API / One-API / Sub2API aggregator compatible nodes. When enabled, compatible nodes with the aggregator flag set will report their balance in the dashboard and quota-preflight routing.",
        descriptionI18nKey: "featureFlagNewApiAggregatorBalanceDescription",
        category: "runtime",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    // ──────────────── CLI (5) ────────────────
    {
        key: "CLI_COMPAT_ALL",
        label: "CLI Compat All",
        description: "Enable compatibility mode for all CLI clients",
        descriptionI18nKey: "featureFlagCliCompatAllDescription",
        category: "cli",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: true,
        warningLevel: "info"
    },
    {
        key: "MODEL_ALIAS_COMPAT_ENABLED",
        label: "Model Alias Compat",
        description: "Enable model alias compatibility layer",
        descriptionI18nKey: "featureFlagModelAliasCompatEnabledDescription",
        category: "cli",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "PRICING_SYNC_ENABLED",
        label: "Pricing Sync",
        description: "Enable automatic pricing data synchronization (requires the PRICING_SYNC_ENABLED environment variable to be set to true)",
        descriptionI18nKey: "featureFlagPricingSyncEnabledDescription",
        category: "cli",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "OMNIROUTE_AUTO_SYNC_CODEX_PROFILES",
        label: "Auto-Sync Codex Profiles",
        description: "After a provider model sync, automatically (re)write ~/.codex/*.config.toml profile files from the live catalog. Never changes the active/default Codex config. Off by default.",
        descriptionI18nKey: "featureFlagOmnirouteAutoSyncCodexProfilesDescription",
        category: "cli",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "caution"
    },
    {
        key: "OMNIROUTE_AUTO_SYNC_CLAUDE_PROFILES",
        label: "Auto-Sync Claude Code Profiles",
        description: "After a provider model sync, automatically (re)write ~/.claude/profiles/<name>/settings.json Claude Code profiles from the live catalog. Never changes the active/default Claude config. Off by default.",
        descriptionI18nKey: "featureFlagOmnirouteAutoSyncClaudeProfilesDescription",
        category: "cli",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "caution"
    },
    // ──────────────── Health (3) ────────────────
    {
        key: "OMNIROUTE_DISABLE_LOCAL_HEALTHCHECK",
        label: "Disable Local Health Check",
        description: "Disable the local instance health check endpoint",
        descriptionI18nKey: "featureFlagOmnirouteDisableLocalHealthcheckDescription",
        category: "health",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "OMNIROUTE_DISABLE_TOKEN_HEALTHCHECK",
        label: "Disable Token Health Check",
        description: "Disable the token validation health check",
        descriptionI18nKey: "featureFlagOmnirouteDisableTokenHealthcheckDescription",
        category: "health",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "info"
    },
    {
        key: "SKILLS_SANDBOX_NETWORK_ENABLED",
        label: "Skills Sandbox Network",
        description: "Enable network access in the skills sandbox environment",
        descriptionI18nKey: "featureFlagSkillsSandboxNetworkEnabledDescription",
        category: "health",
        defaultValue: "false",
        type: "boolean",
        requiresRestart: false,
        warningLevel: "caution"
    }
];
}),
"[project]/src/lib/db/featureFlags.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$featureFlagDefinitions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/featureFlagDefinitions.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
;
;
const NAMESPACE = "feature_flags";
function getFeatureFlagOverrides() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = ?").all(NAMESPACE);
    const result = {};
    for (const row of rows){
        result[row.key] = row.value;
    }
    return result;
}
function getFeatureFlagOverride(key) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = ? AND key = ?").get(NAMESPACE, key);
    return row?.value;
}
function setFeatureFlagOverride(key, value) {
    const definition = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$featureFlagDefinitions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FEATURE_FLAG_DEFINITIONS"].find((d)=>d.key === key);
    if (!definition) {
        throw new Error(`Unknown feature flag key: ${key}`);
    }
    if (definition.type === "enum" && definition.enumValues && !definition.enumValues.includes(value)) {
        throw new Error(`Invalid value "${value}" for enum flag ${key}. Allowed: ${definition.enumValues.join(", ")}`);
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES (?, ?, ?)").run(NAMESPACE, key, value);
}
function removeFeatureFlagOverride(key) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("DELETE FROM key_value WHERE namespace = ? AND key = ?").run(NAMESPACE, key);
}
function clearAllFeatureFlagOverrides() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("DELETE FROM key_value WHERE namespace = ?").run(NAMESPACE);
}
}),
"[project]/src/shared/utils/featureFlags.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getModelsCatalogPrefixMode",
    ()=>getModelsCatalogPrefixMode,
    "isApiKeyRevealEnabledFlag",
    ()=>isApiKeyRevealEnabledFlag,
    "isArenaEloSyncEnabled",
    ()=>isArenaEloSyncEnabled,
    "isCcCompatibleProviderEnabled",
    ()=>isCcCompatibleProviderEnabled,
    "isControlPlaneProxyDirectFallbackEnabled",
    ()=>isControlPlaneProxyDirectFallbackEnabled,
    "isFeatureFlagEnabled",
    ()=>isFeatureFlagEnabled,
    "isModelCatalogNamesEnabled",
    ()=>isModelCatalogNamesEnabled,
    "isRequireApiKeyEnabled",
    ()=>isRequireApiKeyEnabled,
    "resolveAllFeatureFlags",
    ()=>resolveAllFeatureFlags,
    "resolveFeatureFlag",
    ()=>resolveFeatureFlag
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$featureFlags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/featureFlags.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$featureFlagDefinitions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/featureFlagDefinitions.ts [app-route] (ecmascript)");
;
;
function resolveFeatureFlag(key) {
    const dbOverride = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$featureFlags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFeatureFlagOverride"])(key);
    if (dbOverride !== undefined) return dbOverride;
    const envValue = process.env[key];
    if (envValue !== undefined && envValue !== "") return envValue;
    const definition = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$featureFlagDefinitions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FEATURE_FLAG_DEFINITIONS"].find((d)=>d.key === key);
    return definition?.defaultValue ?? "false";
}
function isFeatureFlagEnabled(key) {
    const value = resolveFeatureFlag(key);
    return value === "true" || value === "1" || value === "yes";
}
function resolveAllFeatureFlags() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$featureFlagDefinitions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FEATURE_FLAG_DEFINITIONS"].map((definition)=>{
        const dbOverride = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$featureFlags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFeatureFlagOverride"])(definition.key);
        if (dbOverride !== undefined) {
            return {
                key: definition.key,
                effectiveValue: dbOverride,
                source: "db",
                definition
            };
        }
        const envValue = process.env[definition.key];
        if (envValue !== undefined && envValue !== "") {
            return {
                key: definition.key,
                effectiveValue: envValue,
                source: "env",
                definition
            };
        }
        return {
            key: definition.key,
            effectiveValue: definition.defaultValue,
            source: "default",
            definition
        };
    });
}
function isRequireApiKeyEnabled() {
    try {
        return isFeatureFlagEnabled("REQUIRE_API_KEY");
    } catch (error) {
        console.error("[featureFlags] Failed to resolve REQUIRE_API_KEY, defaulting to required:", error instanceof Error ? error.message : error);
        return true;
    }
}
function isCcCompatibleProviderEnabled() {
    return isFeatureFlagEnabled("ENABLE_CC_COMPATIBLE_PROVIDER");
}
function isApiKeyRevealEnabledFlag() {
    try {
        return isFeatureFlagEnabled("ALLOW_API_KEY_REVEAL");
    } catch (error) {
        console.error("[featureFlags] Failed to resolve ALLOW_API_KEY_REVEAL, defaulting to disabled:", error instanceof Error ? error.message : error);
        return false;
    }
}
function isModelCatalogNamesEnabled() {
    return isFeatureFlagEnabled("MODEL_CATALOG_INCLUDE_NAMES");
}
function getModelsCatalogPrefixMode() {
    const value = resolveFeatureFlag("MODELS_CATALOG_PREFIX_MODE");
    if (value === "alias" || value === "canonical") return value;
    return "dual";
}
function isArenaEloSyncEnabled() {
    return isFeatureFlagEnabled("ARENA_ELO_SYNC_ENABLED");
}
function isControlPlaneProxyDirectFallbackEnabled() {
    try {
        return isFeatureFlagEnabled("OMNIROUTE_CONTROL_PLANE_PROXY_DIRECT_FALLBACK");
    } catch (error) {
        console.error("[featureFlags] Failed to resolve OMNIROUTE_CONTROL_PLANE_PROXY_DIRECT_FALLBACK, defaulting to disabled:", error instanceof Error ? error.message : error);
        return false;
    }
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
"[project]/src/lib/db/optimizationSettings.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/databaseSettings.ts [app-route] (ecmascript)");
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
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"].optimization
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
    const targetPageSize = normalizePageSizeBytes(settings.pageSize, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"].optimization.pageSize);
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
    setCacheSizeForDb(db, normalizeStoredCacheSizeKb(settings.cacheSize, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"].optimization.cacheSize));
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
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"].optimization,
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
    const targetPageSize = normalizePageSizeBytes(pageSize, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"].optimization.pageSize);
    if (currentPageSize === targetPageSize) {
        console.log(`[DB] page_size already set to ${targetPageSize}`);
        return;
    }
    applyPersistentOptimizationPragmas(db, {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"].optimization,
        autoVacuumMode: getAutoVacuumModeForDb(db),
        pageSize: targetPageSize
    });
}
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
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
"[project]/src/lib/usage/callLogArtifacts.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dataPaths.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logEnv.ts [app-route] (ecmascript)");
;
;
;
;
const isCloud = typeof globalThis.caches === "object" && globalThis.caches !== null;
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
const DATA_DIR = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveDataDir"])({
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
    return artifact.pipeline ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCallLogPipelineMaxSizeBytes"])() : MAX_CALL_LOG_ARTIFACT_BYTES;
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
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isChatDebugFileEnabled"])()) {
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
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/src/lib/db/encryption.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/db/readCache.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
    const { getSettings } = await __turbopack_context__.A("[project]/src/lib/db/settings.ts [app-route] (ecmascript, async loader)");
    const value = await getSettings();
    settingsCache.set("settings", value);
    return value;
}
async function getCachedPricing() {
    const cached = pricingCache.get("pricing");
    if (cached) return cached;
    const { getPricing } = await __turbopack_context__.A("[project]/src/lib/db/settings.ts [app-route] (ecmascript, async loader)");
    const value = await getPricing();
    pricingCache.set("pricing", value);
    return value;
}
async function getCachedProviderConnections(filter) {
    const cacheKey = filter && Object.keys(filter).length > 0 ? JSON.stringify(filter) : "all";
    const cached = connectionsCache.get(cacheKey);
    if (cached) return cached;
    const { getProviderConnections } = await __turbopack_context__.A("[project]/src/lib/db/providers.ts [app-route] (ecmascript, async loader)");
    const value = await getProviderConnections(filter);
    connectionsCache.set(cacheKey, value);
    return value;
}
const rawConnectionsCache = new TTLCache(CONNECTIONS_TTL_MS, 500);
async function getCachedRawProviderConnections(filter) {
    const key = JSON.stringify(filter ?? {});
    const cached = rawConnectionsCache.get(key);
    if (cached !== undefined) return cached;
    const { getRawProviderConnections } = await __turbopack_context__.A("[project]/src/lib/db/providers.ts [app-route] (ecmascript, async loader)");
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
    const { getProviderConnectionById } = await __turbopack_context__.A("[project]/src/lib/db/providers.ts [app-route] (ecmascript, async loader)");
    const value = await getProviderConnectionById(id);
    connectionByIdCache.set(id, value);
    return value;
}
async function getCachedProviderNodes(filter) {
    const cacheKey = filter ? JSON.stringify(filter) : "all";
    const cached = nodesCache.get(cacheKey);
    if (cached) return cached;
    const { getProviderNodes } = await __turbopack_context__.A("[project]/src/lib/db/providers.ts [app-route] (ecmascript, async loader)");
    const value = await getProviderNodes(filter);
    nodesCache.set(cacheKey, value);
    return value;
}
const lkgpCache = new TTLCache(SETTINGS_TTL_MS);
async function getCachedLKGP(comboName, modelId) {
    const cacheKey = `lkgp:${comboName}:${modelId}`;
    const cached = lkgpCache.get(cacheKey);
    if (cached !== undefined) return cached;
    const { getLKGP } = await __turbopack_context__.A("[project]/src/lib/db/settings.ts [app-route] (ecmascript, async loader)");
    const value = await getLKGP(comboName, modelId);
    lkgpCache.set(cacheKey, value);
    return value;
}
async function setCachedLKGP(comboName, modelId, providerId, connectionId) {
    const { setLKGP } = await __turbopack_context__.A("[project]/src/lib/db/settings.ts [app-route] (ecmascript, async loader)");
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
"[project]/src/lib/db/caseMapping.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/db/schemaColumns.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$adapters$2f$driverFactory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/adapters/driverFactory.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$probeUtils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/probeUtils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dataPaths.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$migrationRunner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/migrationRunner.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$healthCheck$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/healthCheck.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$stateReset$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/stateReset.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logPayloads.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/databaseSettings.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$optimizationSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/optimizationSettings.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogArtifacts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/encryption.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/caseMapping.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/testProcess.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/schemaColumns.ts [app-route] (ecmascript)");
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
const DATA_DIR = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveWritableDataDir"])({
    isCloud
});
const LEGACY_DATA_DIR = isCloud ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLegacyDotDataDir"])();
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
    const adapter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$adapters$2f$driverFactory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tryOpenSync"])(sqliteFile, options);
    if (adapter) return adapter;
    const sqlJs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$adapters$2f$driverFactory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSqlJsAdapter"])(sqliteFile);
    if (sqlJs) return sqlJs;
    // sql.js pre-init was genuinely attempted (e.g. by the top-level eager
    // barrier below) and failed — surface the real cause instead of the
    // generic/misleading "not pre-initialized yet" message (#7288).
    const preInitError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$adapters$2f$driverFactory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSqlJsPreInitError"])(sqliteFile);
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
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasTable"])(probe, tableSpec.table)) continue;
            const maxRows = tableSpec.maxRows ?? DEFAULT_CRITICAL_TABLE_ROW_LIMIT;
            const rows = tableSpec.readRows?.(probe) ?? probe.prepare(`SELECT * FROM ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["quoteIdentifier"])(tableSpec.table)}`).all();
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
                columns: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTableColumns"])(probe, tableSpec.table),
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
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasTable"])(db, table.table)) {
                throw new Error(`Current schema is missing preserved table "${table.table}"`);
            }
            const currentColumns = new Set((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTableColumns"])(db, table.table));
            const restoreColumns = table.columns.filter((column)=>currentColumns.has(column));
            if (restoreColumns.length === 0) {
                throw new Error(`No compatible columns remain for preserved table "${table.table}"`);
            }
            const sql = `INSERT OR REPLACE INTO ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["quoteIdentifier"])(table.table)} (${restoreColumns.map((column)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["quoteIdentifier"])(column)).join(", ")}) VALUES (${restoreColumns.map(()=>"?").join(", ")})`;
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
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasTable"])(db, "call_logs_v1_legacy")) return;
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
                requestBody: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseStoredPayload"])(row.request_body),
                responseBody: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseStoredPayload"])(row.response_body),
                error: parseLegacyError(row.error)
            };
            const artifactResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["writeCallArtifact"])(artifact, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildArtifactRelativePath"])(artifact.summary.timestamp, artifact.summary.id));
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
    return !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAutomatedTestProcess"])();
}
function createManagedDbBackup(db, reason) {
    const isTest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAutomatedTestProcess"])();
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
        const camelRow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rowToCamel"])(row);
        if (!camelRow) continue;
        let updatedRow = false;
        for (const field of encryptedFields){
            if (typeof camelRow[field] !== "string") continue;
            const { updated, value } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["migrateLegacyEncryptedString"])(camelRow[field]);
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
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidateDbCache"])("connections");
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
    if (isCloud || isBuildPhase || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAutomatedTestProcess"])()) return;
    const intervalMs = getDbHealthCheckIntervalMs();
    if (intervalMs <= 0) return;
    dbHealthCheckTimer = setInterval(()=>{
        try {
            if (!db.open) return;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$healthCheck$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runDbHealthCheck"])(db, {
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
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$healthCheck$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runDbHealthCheck"])(db, {
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
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureUsageHistoryColumns"])(memoryDb);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureUsageHistoryAccountIndex"])(memoryDb);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureCallLogsColumns"])(memoryDb);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureProviderConnectionsColumns"])(memoryDb);
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
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$probeUtils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["retryProbeIfTransient"])(sqliteFile, e, openSqliteDatabase, closeProbeIfSafe)) {
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
    db.pragma(`cache_size = -${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"].optimization.cacheSize}`);
    db.pragma("temp_store = MEMORY");
    db.exec(SCHEMA_SQL);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureProviderConnectionsColumns"])(db);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureUsageHistoryColumns"])(db);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureCallLogsColumns"])(db);
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$migrationRunner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runMigrations"])(db, {
        isNewDb
    });
    // Fresh installs need the same post-migration index guarantee as upgraded
    // databases, including recovery from an interrupted migration 127 attempt.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureUsageHistoryAccountIndex"])(db);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$optimizationSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyStoredDatabaseOptimizationSettings"])(db);
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
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$healthCheck$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runDbHealthCheck"])(db, {
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
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$stateReset$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resetAllDbModuleState"])();
        }
    }
    return true;
}
function resetDbInstance() {
    closeDbInstance();
    // Read caches outlive the SQLite singleton. A reset swaps the backing
    // database, so retaining cached rows can leak the previous database's
    // connections/settings into the newly opened instance (tests and restore).
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidateDbCache"])();
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
    const sync = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$adapters$2f$driverFactory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tryOpenSync"])(SQLITE_FILE);
    if (sync) {
        // Drivers síncronos disponíveis — fechar o probe, getDbInstance() vai abrir com setup completo
        sync.close();
        getDbInstance();
        return;
    }
    // No synchronous driver available — pre-initialize sql.js (WASM, async)
    console.warn("[DB] Pre-initializing sql.js WASM (synchronous drivers unavailable)...");
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$adapters$2f$driverFactory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["preInitSqlJs"])(SQLITE_FILE);
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$optimizationSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyDatabaseOptimizationSettingsForDb"])(getDbInstance(), settings, {
        applyPersistent: true
    });
}
function setAutoVacuum(mode) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$optimizationSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setAutoVacuumForDb"])(getDbInstance(), mode);
}
function getAutoVacuumMode() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$optimizationSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAutoVacuumModeForDb"])(getDbInstance());
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$optimizationSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setPageSizeForDb"])(getDbInstance(), pageSize);
}
function setCacheSize(cacheSizeKb) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$optimizationSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setCacheSizeForDb"])(getDbInstance(), cacheSizeKb);
}
}),
"[externals]/node:net [external] (node:net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:net", () => require("node:net"));

module.exports = mod;
}),
"[project]/src/lib/ipUtils.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/db/backup.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$stateReset$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/stateReset.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/testProcess.ts [app-route] (ecmascript)");
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
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DB_BACKUPS_DIR"] || __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DATA_DIR"], "db_backups");
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
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAutomatedTestProcess"])()) return true;
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
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isBuildPhase"] || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"]) return null;
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SQLITE_FILE"] || !__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SQLITE_FILE"])) return null;
        if (reason !== "manual" && isSqliteAutoBackupDisabled()) return null;
        // #5871: honor the persisted `backup.autoBackupEnabled` dashboard toggle. Only
        // manual and pre-restore backups bypass this gate; automatic + pre-write safety
        // snapshots must stop firing once the operator disables auto-backup in the UI.
        if (reason !== "manual" && reason !== "pre-restore" && isAutoBackupDisabledBySetting()) return null;
        const stat = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].statSync(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SQLITE_FILE"]);
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
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
        const { tryOpenSync } = await __turbopack_context__.A("[project]/src/lib/db/adapters/driverFactory.ts [app-route] (ecmascript, async loader)");
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
        const { tryOpenSync } = await __turbopack_context__.A("[project]/src/lib/db/adapters/driverFactory.ts [app-route] (ecmascript, async loader)");
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
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SQLITE_FILE"] && __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SQLITE_FILE"])) {
            const stat = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].statSync(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SQLITE_FILE"]);
            if (stat.size >= 4096) {
                if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(backupDirForPre)) __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(backupDirForPre, {
                    recursive: true
                });
                const preBackupPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(backupDirForPre, `db_${new Date().toISOString().replace(/[:.]/g, "-")}_pre-restore.sqlite`);
                const dbForBackup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
                await dbForBackup.backup(preBackupPath);
                _lastBackupAt = Date.now();
            }
        }
    }
    // Close and reset current connection
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resetDbInstance"])();
    // Clear all cached prepared statements and other state bound to the old connection
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$stateReset$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resetAllDbModuleState"])();
    const sqliteFile = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SQLITE_FILE"];
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
"[project]/src/lib/db/stats.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Database Statistics Module
 *
 * Provides functions to retrieve database statistics including size, table counts, and performance metrics.
 */ __turbopack_context__.s([
    "getDatabaseStats",
    ()=>getDatabaseStats
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
;
function getDatabaseStats(db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])()) {
    const pageSize = db.pragma("page_size", {
        simple: true
    });
    const pageCount = db.pragma("page_count", {
        simple: true
    });
    const cacheSize = db.pragma("cache_size", {
        simple: true
    });
    const totalSize = pageSize * pageCount;
    const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`).all();
    const tableStats = tables.map((table)=>{
        let rowCount = 0;
        try {
            const quotedName = `"${table.name.replaceAll('"', '""')}"`;
            const row = db.prepare(`SELECT COUNT(*) as count FROM ${quotedName}`).get();
            rowCount = row?.count ?? 0;
        } catch (error) {
            if (!(error instanceof Error) || !error.message.startsWith("no such module:")) {
                throw error;
            }
        // Optional virtual-table modules may be unavailable on this connection.
        }
        const tableSize = db.prepare(`SELECT SUM(pgsize) as size FROM dbstat WHERE name = ?`).get(table.name);
        return {
            name: table.name,
            rowCount,
            size: tableSize?.size || 0
        };
    });
    const indexes = db.prepare(`SELECT name, tbl_name as tableName FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name`).all();
    return {
        totalSize,
        pageSize,
        pageCount,
        tables: tableStats,
        indexes,
        cacheSize
    };
}
}),
"[project]/src/shared/utils/runtimeTimeouts.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_API_BRIDGE_PROXY_TIMEOUT_MS",
    ()=>DEFAULT_API_BRIDGE_PROXY_TIMEOUT_MS,
    "DEFAULT_API_BRIDGE_SERVER_HEADERS_TIMEOUT_MS",
    ()=>DEFAULT_API_BRIDGE_SERVER_HEADERS_TIMEOUT_MS,
    "DEFAULT_API_BRIDGE_SERVER_KEEPALIVE_TIMEOUT_MS",
    ()=>DEFAULT_API_BRIDGE_SERVER_KEEPALIVE_TIMEOUT_MS,
    "DEFAULT_API_BRIDGE_SERVER_REQUEST_TIMEOUT_MS",
    ()=>DEFAULT_API_BRIDGE_SERVER_REQUEST_TIMEOUT_MS,
    "DEFAULT_API_BRIDGE_SERVER_SOCKET_TIMEOUT_MS",
    ()=>DEFAULT_API_BRIDGE_SERVER_SOCKET_TIMEOUT_MS,
    "DEFAULT_FETCH_CONNECT_TIMEOUT_MS",
    ()=>DEFAULT_FETCH_CONNECT_TIMEOUT_MS,
    "DEFAULT_FETCH_KEEPALIVE_TIMEOUT_MS",
    ()=>DEFAULT_FETCH_KEEPALIVE_TIMEOUT_MS,
    "DEFAULT_FETCH_TIMEOUT_MS",
    ()=>DEFAULT_FETCH_TIMEOUT_MS,
    "DEFAULT_MAIN_SERVER_HEADERS_TIMEOUT_MS",
    ()=>DEFAULT_MAIN_SERVER_HEADERS_TIMEOUT_MS,
    "DEFAULT_MAIN_SERVER_KEEPALIVE_TIMEOUT_MS",
    ()=>DEFAULT_MAIN_SERVER_KEEPALIVE_TIMEOUT_MS,
    "DEFAULT_SSE_HEARTBEAT_INTERVAL_MS",
    ()=>DEFAULT_SSE_HEARTBEAT_INTERVAL_MS,
    "DEFAULT_STREAM_IDLE_TIMEOUT_MS",
    ()=>DEFAULT_STREAM_IDLE_TIMEOUT_MS,
    "DEFAULT_STREAM_READINESS_MAX_TIMEOUT_MS",
    ()=>DEFAULT_STREAM_READINESS_MAX_TIMEOUT_MS,
    "DEFAULT_STREAM_READINESS_TIMEOUT_MS",
    ()=>DEFAULT_STREAM_READINESS_TIMEOUT_MS,
    "MAX_TIMER_TIMEOUT_MS",
    ()=>MAX_TIMER_TIMEOUT_MS,
    "getApiBridgeTimeoutConfig",
    ()=>getApiBridgeTimeoutConfig,
    "getMainServerTimeoutConfig",
    ()=>getMainServerTimeoutConfig,
    "getStainlessTimeoutSeconds",
    ()=>getStainlessTimeoutSeconds,
    "getTlsClientTimeoutConfig",
    ()=>getTlsClientTimeoutConfig,
    "getUpstreamTimeoutConfig",
    ()=>getUpstreamTimeoutConfig
]);
const DEFAULT_FETCH_TIMEOUT_MS = 600_000;
const DEFAULT_STREAM_IDLE_TIMEOUT_MS = 600_000;
const MAX_TIMER_TIMEOUT_MS = 2_147_483_647;
const DEFAULT_SSE_HEARTBEAT_INTERVAL_MS = 15_000;
const DEFAULT_STREAM_READINESS_TIMEOUT_MS = 80_000;
const DEFAULT_STREAM_READINESS_MAX_TIMEOUT_MS = 180_000;
const DEFAULT_FETCH_CONNECT_TIMEOUT_MS = 30_000;
const DEFAULT_FETCH_KEEPALIVE_TIMEOUT_MS = 4_000;
const DEFAULT_API_BRIDGE_PROXY_TIMEOUT_MS = 600_000;
const DEFAULT_API_BRIDGE_SERVER_REQUEST_TIMEOUT_MS = 300_000;
const DEFAULT_API_BRIDGE_SERVER_HEADERS_TIMEOUT_MS = 60_000;
const DEFAULT_API_BRIDGE_SERVER_KEEPALIVE_TIMEOUT_MS = 5_000;
const DEFAULT_API_BRIDGE_SERVER_SOCKET_TIMEOUT_MS = 0;
const DEFAULT_MAIN_SERVER_KEEPALIVE_TIMEOUT_MS = 65_000;
const DEFAULT_MAIN_SERVER_HEADERS_TIMEOUT_MS = 66_000;
function hasEnvValue(env, name) {
    const raw = env[name];
    return raw != null && raw.trim() !== "";
}
function readTimeoutMs(env, name, defaultValue, options = {}) {
    const raw = env[name];
    if (raw == null || raw.trim() === "") return defaultValue;
    const parsed = Number(raw);
    const isValid = Number.isFinite(parsed) && (options.allowZero ? parsed >= 0 : parsed > 0);
    if (!isValid) {
        options.logger?.(`Invalid ${name}="${raw}". Using default ${defaultValue}ms.`);
        return defaultValue;
    }
    return Math.floor(parsed);
}
function getUpstreamTimeoutConfig(env = process.env, logger) {
    const sharedRequestTimeoutMs = hasEnvValue(env, "REQUEST_TIMEOUT_MS") ? readTimeoutMs(env, "REQUEST_TIMEOUT_MS", DEFAULT_FETCH_TIMEOUT_MS, {
        allowZero: true,
        logger
    }) : undefined;
    const fetchTimeoutMs = readTimeoutMs(env, "FETCH_TIMEOUT_MS", sharedRequestTimeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    const streamIdleTimeoutMs = readTimeoutMs(env, "STREAM_IDLE_TIMEOUT_MS", sharedRequestTimeoutMs ?? DEFAULT_STREAM_IDLE_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    const streamReadinessTimeoutMs = readTimeoutMs(env, "STREAM_READINESS_TIMEOUT_MS", sharedRequestTimeoutMs ?? DEFAULT_STREAM_READINESS_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    const streamReadinessMaxTimeoutMs = readTimeoutMs(env, "STREAM_READINESS_MAX_TIMEOUT_MS", DEFAULT_STREAM_READINESS_MAX_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    const sseHeartbeatIntervalMs = readTimeoutMs(env, "SSE_HEARTBEAT_INTERVAL_MS", DEFAULT_SSE_HEARTBEAT_INTERVAL_MS, {
        allowZero: true,
        logger
    });
    return {
        fetchTimeoutMs,
        streamIdleTimeoutMs,
        streamReadinessTimeoutMs,
        streamReadinessMaxTimeoutMs,
        sseHeartbeatIntervalMs,
        fetchHeadersTimeoutMs: readTimeoutMs(env, "FETCH_HEADERS_TIMEOUT_MS", fetchTimeoutMs, {
            allowZero: true,
            logger
        }),
        fetchBodyTimeoutMs: readTimeoutMs(env, "FETCH_BODY_TIMEOUT_MS", fetchTimeoutMs, {
            allowZero: true,
            logger
        }),
        fetchConnectTimeoutMs: readTimeoutMs(env, "FETCH_CONNECT_TIMEOUT_MS", DEFAULT_FETCH_CONNECT_TIMEOUT_MS, {
            allowZero: true,
            logger
        }),
        fetchKeepAliveTimeoutMs: readTimeoutMs(env, "FETCH_KEEPALIVE_TIMEOUT_MS", DEFAULT_FETCH_KEEPALIVE_TIMEOUT_MS, {
            logger
        })
    };
}
function getStainlessTimeoutSeconds(env = process.env, logger) {
    const { fetchTimeoutMs } = getUpstreamTimeoutConfig(env, logger);
    return Math.max(1, Math.ceil(fetchTimeoutMs / 1_000));
}
function getTlsClientTimeoutConfig(env = process.env, logger) {
    const upstream = getUpstreamTimeoutConfig(env, logger);
    return {
        timeoutMs: readTimeoutMs(env, "TLS_CLIENT_TIMEOUT_MS", upstream.fetchTimeoutMs, {
            allowZero: true,
            logger
        })
    };
}
function getApiBridgeTimeoutConfig(env = process.env, logger) {
    const sharedRequestTimeoutMs = hasEnvValue(env, "REQUEST_TIMEOUT_MS") ? readTimeoutMs(env, "REQUEST_TIMEOUT_MS", DEFAULT_FETCH_TIMEOUT_MS, {
        allowZero: true,
        logger
    }) : undefined;
    const proxyTimeoutMs = readTimeoutMs(env, "API_BRIDGE_PROXY_TIMEOUT_MS", sharedRequestTimeoutMs ?? DEFAULT_API_BRIDGE_PROXY_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    const derivedRequestTimeoutMs = proxyTimeoutMs > 0 ? Math.max(proxyTimeoutMs, DEFAULT_API_BRIDGE_SERVER_REQUEST_TIMEOUT_MS) : DEFAULT_API_BRIDGE_SERVER_REQUEST_TIMEOUT_MS;
    const serverRequestDefaultMs = sharedRequestTimeoutMs !== undefined ? sharedRequestTimeoutMs > 0 ? Math.max(sharedRequestTimeoutMs, derivedRequestTimeoutMs) : 0 : derivedRequestTimeoutMs;
    const serverKeepAliveTimeoutMs = readTimeoutMs(env, "API_BRIDGE_SERVER_KEEPALIVE_TIMEOUT_MS", DEFAULT_API_BRIDGE_SERVER_KEEPALIVE_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    const serverHeadersTimeoutMs = readTimeoutMs(env, "API_BRIDGE_SERVER_HEADERS_TIMEOUT_MS", DEFAULT_API_BRIDGE_SERVER_HEADERS_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    return {
        proxyTimeoutMs,
        serverRequestTimeoutMs: readTimeoutMs(env, "API_BRIDGE_SERVER_REQUEST_TIMEOUT_MS", serverRequestDefaultMs, {
            allowZero: true,
            logger
        }),
        serverHeadersTimeoutMs: serverHeadersTimeoutMs > 0 && serverKeepAliveTimeoutMs > 0 ? Math.max(serverHeadersTimeoutMs, serverKeepAliveTimeoutMs + 1_000) : serverHeadersTimeoutMs,
        serverKeepAliveTimeoutMs,
        serverSocketTimeoutMs: readTimeoutMs(env, "API_BRIDGE_SERVER_SOCKET_TIMEOUT_MS", DEFAULT_API_BRIDGE_SERVER_SOCKET_TIMEOUT_MS, {
            allowZero: true,
            logger
        })
    };
}
function getMainServerTimeoutConfig(env = process.env, logger) {
    const keepAliveTimeoutMs = readTimeoutMs(env, "MAIN_SERVER_KEEPALIVE_TIMEOUT_MS", DEFAULT_MAIN_SERVER_KEEPALIVE_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    const headersTimeoutMs = readTimeoutMs(env, "MAIN_SERVER_HEADERS_TIMEOUT_MS", DEFAULT_MAIN_SERVER_HEADERS_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    return {
        keepAliveTimeoutMs,
        // Node requires headersTimeout > keepAliveTimeout to avoid its internal
        // race-condition warning; keep both configurable but always coherent.
        headersTimeoutMs: headersTimeoutMs > 0 && keepAliveTimeoutMs > 0 ? Math.max(headersTimeoutMs, keepAliveTimeoutMs + 1_000) : headersTimeoutMs
    };
}
}),
"[project]/src/lib/db/vacuumScheduler.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__resetForTests",
    ()=>__resetForTests,
    "getState",
    ()=>getState,
    "init",
    ()=>init,
    "initVacuumScheduler",
    ()=>initVacuumScheduler,
    "refresh",
    ()=>refresh,
    "refreshVacuumScheduler",
    ()=>refreshVacuumScheduler,
    "resolveNextRunAt",
    ()=>resolveNextRunAt,
    "runNow",
    ()=>runNow,
    "stop",
    ()=>stop
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/databaseSettings.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$runtimeTimeouts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/runtimeTimeouts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
;
;
;
// Direct `key_value` access — the existing `keyValueStore` helpers only exist
// in test fixtures; the 3 production call sites (pricingSync, jsonMigration,
// serviceModels) all use `getDbInstance().prepare(...).run()` directly. We
// follow the same convention to avoid introducing a new abstraction.
const READ_KV_SQL = "SELECT value FROM key_value WHERE namespace = ? AND key = ? LIMIT 1";
// The key_value table is (namespace, key, value) — no updated_at column
// (see migrations/001_initial_schema.sql). Match the canonical write shape
// used by serviceModels.ts / jsonMigration.ts.
const WRITE_KV_SQL = "INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES (?, ?, ?)";
function setKeyValue(namespace, key, value) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare(WRITE_KV_SQL).run(namespace, key, value);
}
function getKeyValue(namespace, key) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare(READ_KV_SQL).get(namespace, key);
    return row?.value ?? null;
}
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const NOMINAL_INTERVAL_MS = {
    never: 0,
    daily: DAY_MS,
    weekly: 7 * DAY_MS,
    monthly: 30 * DAY_MS
};
const VALID_SCHEDULES = new Set([
    "never",
    "daily",
    "weekly",
    "monthly"
]);
const KEY_VALUE_NAMESPACE = "scheduler";
const KEY_VALUE_KEY = "vacuum";
const STATE_DEFAULTS = {
    enabled: false,
    intervalMs: 0,
    lastRunAt: null,
    lastError: null,
    lastDurationMs: null,
    isRunning: false,
    nextRunAt: null
};
let timer = null;
let currentState = {
    ...STATE_DEFAULTS
};
function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
function parseJsonSafe(raw) {
    if (raw === null) return undefined;
    try {
        return JSON.parse(raw);
    } catch  {
        return raw;
    }
}
function readNamespace(namespace) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = ?").all(namespace);
    const values = {};
    for (const row of rows)values[row.key] = parseJsonSafe(row.value);
    return values;
}
function normalizeSchedule(value, fallback) {
    return typeof value === "string" && VALID_SCHEDULES.has(value) ? value : fallback;
}
function normalizeVacuumHour(value, fallback) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return fallback;
    return Math.min(23, Math.max(0, Math.floor(numeric)));
}
function mergeOptimization(target, value) {
    if (!isRecord(value)) return target;
    return {
        scheduledVacuum: normalizeSchedule(value.scheduledVacuum, target.scheduledVacuum),
        vacuumHour: normalizeVacuumHour(value.vacuumHour, target.vacuumHour)
    };
}
function readScheduleSettings() {
    let settings = {
        scheduledVacuum: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"].optimization.scheduledVacuum,
        vacuumHour: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"].optimization.vacuumHour
    };
    const mainSettings = readNamespace("settings");
    const databaseSettingsValue = mainSettings.databaseSettings;
    if (isRecord(databaseSettingsValue)) {
        settings = mergeOptimization(settings, databaseSettingsValue.optimization);
    }
    settings = mergeOptimization(settings, mainSettings.optimization);
    const databaseSettings = readNamespace("databaseSettings");
    settings = mergeOptimization(settings, databaseSettings.optimization);
    settings = {
        scheduledVacuum: normalizeSchedule(databaseSettings["optimization.scheduledVacuum"] ?? databaseSettings.scheduledVacuum, settings.scheduledVacuum),
        vacuumHour: normalizeVacuumHour(databaseSettings["optimization.vacuumHour"] ?? databaseSettings.vacuumHour, settings.vacuumHour)
    };
    return settings;
}
function atVacuumHour(timestamp, hour) {
    const date = new Date(timestamp);
    date.setHours(hour, 0, 0, 0);
    return date;
}
function addFrequency(date, frequency) {
    const next = new Date(date.getTime());
    if (frequency === "daily") next.setDate(next.getDate() + 1);
    else if (frequency === "weekly") next.setDate(next.getDate() + 7);
    else next.setMonth(next.getMonth() + 1);
    return next;
}
function resolveNextRunAt(settings, lastRunAt, now = Date.now()) {
    const frequency = settings.scheduledVacuum;
    if (frequency === "never") return null;
    const hour = normalizeVacuumHour(settings.vacuumHour, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"].optimization.vacuumHour);
    let candidate;
    if (typeof lastRunAt === "number" && Number.isFinite(lastRunAt) && lastRunAt > 0) {
        candidate = atVacuumHour(lastRunAt, hour);
        if (candidate.getTime() <= lastRunAt) candidate = addFrequency(candidate, frequency);
    } else {
        candidate = atVacuumHour(now, hour);
        if (candidate.getTime() <= now) candidate = addFrequency(candidate, "daily");
    }
    while(candidate.getTime() <= now){
        candidate = addFrequency(candidate, frequency);
    }
    return candidate.getTime();
}
function applySchedule(now = Date.now(), anchorLastRunAt = currentState.lastRunAt) {
    const settings = readScheduleSettings();
    currentState.enabled = settings.scheduledVacuum !== "never";
    currentState.intervalMs = NOMINAL_INTERVAL_MS[settings.scheduledVacuum];
    currentState.nextRunAt = resolveNextRunAt(settings, anchorLastRunAt, now);
}
function armTimer() {
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }
    if (!currentState.enabled || currentState.nextRunAt === null || currentState.isRunning) {
        currentState.nextRunAt = null;
        return;
    }
    const delayMs = Math.max(0, currentState.nextRunAt - Date.now());
    timer = setTimeout(()=>{
        if (currentState.nextRunAt !== null && currentState.nextRunAt > Date.now()) {
            armTimer();
            return;
        }
        void runNow().catch((err)=>{
            currentState.lastError = err instanceof Error ? err.message : String(err);
        });
    }, Math.min(delayMs, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$runtimeTimeouts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MAX_TIMER_TIMEOUT_MS"]));
    // Don't keep the event loop alive just for vacuum
    if (typeof timer.unref === "function") timer.unref();
}
function persistState() {
    setKeyValue(KEY_VALUE_NAMESPACE, KEY_VALUE_KEY, JSON.stringify(currentState));
}
function loadPersistedState() {
    const raw = getKeyValue(KEY_VALUE_NAMESPACE, KEY_VALUE_KEY);
    if (!raw) return {};
    try {
        const parsed = JSON.parse(raw);
        return parsed;
    } catch  {
        return {};
    }
}
function getState() {
    return {
        ...currentState
    };
}
function refresh() {
    applySchedule();
    persistState();
    armTimer();
    return getState();
}
async function runNow() {
    if (currentState.isRunning) {
        return {
            success: false,
            durationMs: 0,
            error: "already_running"
        };
    }
    currentState.isRunning = true;
    persistState();
    const start = Date.now();
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        db.exec("VACUUM");
        const duration = Date.now() - start;
        currentState.lastRunAt = start;
        currentState.lastError = null;
        currentState.lastDurationMs = duration;
        currentState.isRunning = false;
        refresh(); // reset the next-run clock from this successful run
        return {
            success: true,
            durationMs: duration
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        currentState.lastError = message;
        currentState.lastDurationMs = Date.now() - start;
        currentState.isRunning = false;
        applySchedule(Date.now(), Date.now());
        persistState();
        armTimer();
        return {
            success: false,
            durationMs: currentState.lastDurationMs,
            error: message
        };
    }
}
function init() {
    if (timer) return getState();
    const persisted = loadPersistedState();
    currentState = {
        ...STATE_DEFAULTS,
        ...persisted,
        isRunning: false,
        nextRunAt: null
    };
    return refresh();
}
const initVacuumScheduler = init;
const refreshVacuumScheduler = refresh;
function stop() {
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }
    currentState.nextRunAt = null;
    currentState.isRunning = false;
    persistState();
}
function __resetForTests() {
    stop();
    currentState = {
        ...STATE_DEFAULTS
    };
}
}),
"[project]/src/lib/db/databaseSettings.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getDatabaseSettings",
    ()=>getDatabaseSettings,
    "getUserDatabaseSettings",
    ()=>getUserDatabaseSettings,
    "updateDatabaseSettings",
    ()=>updateDatabaseSettings
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/databaseSettings.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/stats.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$vacuumScheduler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/vacuumScheduler.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
const DATABASE_SETTINGS_NAMESPACE = "databaseSettings";
const DATABASE_SETTINGS_SECTIONS = Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"]);
const LEGACY_FLAT_KEYS = {
    logs: {
        detailedLogsEnabled: [
            "detailedLogsEnabled"
        ],
        callLogPipelineEnabled: [
            "callLogPipelineEnabled"
        ],
        maxDetailSizeKb: [
            "maxDetailSizeKb"
        ],
        ringBufferSize: [
            "ringBufferSize"
        ]
    },
    backup: {
        autoBackupEnabled: [
            "autoBackupEnabled"
        ],
        autoBackupFrequency: [
            "autoBackupFrequency"
        ],
        keepLastNBackups: [
            "keepLastNBackups"
        ]
    },
    cache: {
        semanticCacheEnabled: [
            "semanticCacheEnabled"
        ],
        semanticCacheMaxSize: [
            "semanticCacheMaxSize"
        ],
        semanticCacheTTL: [
            "semanticCacheTTL"
        ],
        promptCacheEnabled: [
            "promptCacheEnabled"
        ],
        promptCacheStrategy: [
            "promptCacheStrategy"
        ],
        alwaysPreserveClientCache: [
            "alwaysPreserveClientCache"
        ],
        modelCatalogCacheTtlMs: [
            "modelCatalogCacheTtlMs"
        ]
    },
    retention: {
        quotaSnapshots: [
            "quotaSnapshots"
        ],
        compressionAnalytics: [
            "compressionAnalytics"
        ],
        mcpAudit: [
            "mcpAudit"
        ],
        a2aEvents: [
            "a2aEvents"
        ],
        callLogs: [
            "callLogs"
        ],
        usageHistory: [
            "usageHistory"
        ],
        memoryEntries: [
            "memoryEntries"
        ],
        domainCostHistory: [
            "domainCostHistory"
        ],
        compressionCacheStats: [
            "compressionCacheStats"
        ],
        xpAuditLog: [
            "xpAuditLog"
        ],
        compressionRunTelemetry: [
            "compressionRunTelemetry"
        ],
        autoCleanupEnabled: [
            "autoCleanupEnabled"
        ]
    },
    aggregation: {
        enabled: [
            "aggregationEnabled",
            "enabled"
        ],
        rawDataRetentionDays: [
            "rawDataRetentionDays"
        ],
        granularity: [
            "granularity"
        ]
    },
    optimization: {
        autoVacuumMode: [
            "autoVacuumMode"
        ],
        scheduledVacuum: [
            "scheduledVacuum"
        ],
        vacuumHour: [
            "vacuumHour"
        ],
        pageSize: [
            "pageSize"
        ],
        cacheSize: [
            "cacheSize"
        ],
        optimizeOnStartup: [
            "optimizeOnStartup"
        ]
    }
};
function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
function cloneDefaultSettings() {
    return structuredClone(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"]);
}
function parseStoredValue(rawValue) {
    if (typeof rawValue !== "string") return rawValue;
    try {
        return JSON.parse(rawValue);
    } catch  {
        return rawValue;
    }
}
function toBooleanSetting(value) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return !Number.isNaN(value) && value !== 0;
    if (typeof value !== "string") return null;
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
    return null;
}
function normalizeOptimizationSettings(settings) {
    const fallback = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"].optimization.cacheSize;
    const numericCacheSize = Number(settings.optimization.cacheSize);
    settings.optimization.cacheSize = Number.isFinite(numericCacheSize) && numericCacheSize > 0 ? Math.min(1000000, Math.floor(numericCacheSize)) : fallback;
}
function readNamespace(namespace) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = ?").all(namespace);
    const values = {};
    for (const row of rows){
        values[row.key] = parseStoredValue(row.value);
    }
    return values;
}
function mergeSectionObject(target, section, value) {
    if (!isRecord(value)) return;
    const sectionTarget = target[section];
    const defaultSection = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"][section];
    for (const key of Object.keys(defaultSection)){
        if (value[key] !== undefined) {
            sectionTarget[key] = value[key];
        }
    }
}
function mergeTopLevelSections(target, values) {
    for (const section of DATABASE_SETTINGS_SECTIONS){
        mergeSectionObject(target, section, values[section]);
    }
}
function mergeRuntimeLogSettings(target, values) {
    const pipelineEnabled = toBooleanSetting(values.call_log_pipeline_enabled);
    if (pipelineEnabled !== null) {
        target.logs.callLogPipelineEnabled = pipelineEnabled;
    }
    const legacyDetailedEnabled = toBooleanSetting(values.detailed_logs_enabled);
    if (legacyDetailedEnabled !== null) {
        target.logs.detailedLogsEnabled = legacyDetailedEnabled;
    }
}
function mergeDatabaseSettingsNamespace(target, values) {
    for (const section of DATABASE_SETTINGS_SECTIONS){
        const defaultSection = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"][section];
        const sectionTarget = target[section];
        const flatAliases = LEGACY_FLAT_KEYS[section];
        for (const key of Object.keys(defaultSection)){
            for (const alias of flatAliases[key] ?? []){
                if (values[alias] !== undefined) {
                    sectionTarget[key] = values[alias];
                }
            }
            const nestedKey = `${section}.${key}`;
            if (values[nestedKey] !== undefined) {
                sectionTarget[key] = values[nestedKey];
            }
        }
    }
}
function getWalSizeBytes() {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SQLITE_FILE"]) return 0;
    try {
        const walPath = `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SQLITE_FILE"]}-wal`;
        return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(walPath) ? __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].statSync(walPath).size : 0;
    } catch  {
        return 0;
    }
}
function getSchemaVersion() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    try {
        const row = db.prepare("SELECT MAX(CAST(version AS INTEGER)) AS version FROM _omniroute_migrations").get();
        return row?.version ?? 0;
    } catch  {
        return 0;
    }
}
function getFreelistCount() {
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().pragma("freelist_count", {
            simple: true
        });
    } catch  {
        return 0;
    }
}
function getIntegrityCheck() {
    try {
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().pragma("quick_check", {
            simple: true
        });
        return result === "ok" ? "ok" : "error";
    } catch  {
        return null;
    }
}
function getUserDatabaseSettings() {
    const settings = cloneDefaultSettings();
    const mainSettings = readNamespace("settings");
    const databaseSettingsValue = mainSettings[DATABASE_SETTINGS_NAMESPACE];
    if (isRecord(databaseSettingsValue)) {
        mergeTopLevelSections(settings, databaseSettingsValue);
    }
    mergeTopLevelSections(settings, mainSettings);
    mergeDatabaseSettingsNamespace(settings, readNamespace(DATABASE_SETTINGS_NAMESPACE));
    mergeRuntimeLogSettings(settings, mainSettings);
    normalizeOptimizationSettings(settings);
    return settings;
}
function getDatabaseSettings() {
    const dbStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDatabaseStats"])();
    const vacuumState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$vacuumScheduler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getState"])();
    return {
        ...getUserDatabaseSettings(),
        location: {
            databasePath: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SQLITE_FILE"] ?? ":memory:",
            dataDir: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DATA_DIR"],
            walSizeBytes: getWalSizeBytes(),
            schemaVersion: getSchemaVersion()
        },
        stats: {
            databaseSizeBytes: dbStats.totalSize,
            pageCount: dbStats.pageCount,
            freelistCount: getFreelistCount(),
            lastVacuumAt: vacuumState.lastRunAt !== null ? new Date(vacuumState.lastRunAt).toISOString() : null,
            lastOptimizationAt: null,
            integrityCheck: getIntegrityCheck()
        }
    };
}
function updateDatabaseSettings(updates) {
    const nextSettings = getUserDatabaseSettings();
    const optimizationUpdated = updates.optimization !== undefined;
    for (const section of DATABASE_SETTINGS_SECTIONS){
        if (updates[section] !== undefined) {
            mergeSectionObject(nextSettings, section, updates[section]);
        }
    }
    normalizeOptimizationSettings(nextSettings);
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const insert = db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES (?, ?, ?)");
    const settingsInsert = db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('settings', ?, ?)");
    const requestedLogs = updates.logs;
    const pipelineEnabled = requestedLogs?.callLogPipelineEnabled;
    const detailedEnabled = requestedLogs?.detailedLogsEnabled;
    const tx = db.transaction(()=>{
        for (const section of DATABASE_SETTINGS_SECTIONS){
            const sectionValues = nextSettings[section];
            for (const [key, value] of Object.entries(sectionValues)){
                insert.run(DATABASE_SETTINGS_NAMESPACE, `${section}.${key}`, JSON.stringify(value));
            }
        }
        if (pipelineEnabled !== undefined) {
            settingsInsert.run("call_log_pipeline_enabled", JSON.stringify(Boolean(pipelineEnabled)));
        }
    });
    tx();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidateDbCache"])("settings");
    if (optimizationUpdated) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["applyDatabaseOptimizationSettings"])(nextSettings.optimization);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$vacuumScheduler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["refreshVacuumScheduler"])();
    }
    return nextSettings;
}
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/src/shared/utils/requestId.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addRequestIdHeader",
    ()=>addRequestIdHeader,
    "attachRequestIdToResponse",
    ()=>attachRequestIdToResponse,
    "generateRequestId",
    ()=>generateRequestId,
    "getRequestId",
    ()=>getRequestId,
    "withRequestId",
    ()=>withRequestId
]);
/**
 * Request ID — Correlation ID Middleware (T-23)
 *
 * Generates and propagates `x-request-id` headers for
 * request tracing across the proxy pipeline.
 *
 * Uses AsyncLocalStorage to make request ID available
 * anywhere in the call stack without explicit passing.
 *
 * @module shared/utils/requestId
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$async_hooks__$5b$external$5d$__$28$node$3a$async_hooks$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:async_hooks [external] (node:async_hooks, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
;
const requestIdStore = new __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$async_hooks__$5b$external$5d$__$28$node$3a$async_hooks$2c$__cjs$29$__["AsyncLocalStorage"]();
function getHeaderValue(request, name) {
    const value = request?.headers?.get?.(name);
    return typeof value === "string" && value.length > 0 ? value : null;
}
function getRequestId() {
    return requestIdStore.getStore() || null;
}
async function withRequestId(request, handler) {
    const existingId = getHeaderValue(request, "x-request-id");
    const requestId = existingId || (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])();
    return requestIdStore.run(requestId, handler);
}
function addRequestIdHeader(headers = {}) {
    const requestId = getRequestId();
    if (requestId) {
        return {
            ...headers,
            "x-request-id": requestId
        };
    }
    return headers;
}
function attachRequestIdToResponse(request, response) {
    const requestId = getRequestId() || getHeaderValue(request, "x-request-id") || (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])();
    const headers = new Headers(response.headers);
    headers.set("x-request-id", requestId);
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}
function generateRequestId() {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])();
}
}),
"[project]/src/lib/audit/highLevelActions.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/compliance/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ipUtils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ipUtils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logEnv.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/databaseSettings.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$requestId$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/requestId.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audit$2f$highLevelActions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/audit/highLevelActions.ts [app-route] (ecmascript)");
// ─── No-Log Opt-Out ────────────────
// Moved to ./noLog.ts to break the callLogs → compliance → callLogs ESM cycle
// that deadlocks the bundled MCP server under Node.js 24 (#2650). Re-exported
// here so downstream callers that import from "../compliance" keep working.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$noLog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/compliance/noLog.ts [app-route] (ecmascript)");
;
;
;
;
;
;
/** @returns {SqliteAdapter | null} */ function getDb() {
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
    if (filter.levelFilter === "high" && __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audit$2f$highLevelActions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HIGH_LEVEL_ACTIONS"].length > 0) {
        const placeholders = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audit$2f$highLevelActions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HIGH_LEVEL_ACTIONS"].map(()=>"?").join(", ");
        conditions.push(`action IN (${placeholders})`);
        // HIGH_LEVEL_ACTIONS is readonly — create a mutable copy for spread
        params.push(...Array.from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audit$2f$highLevelActions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HIGH_LEVEL_ACTIONS"]));
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
        ipAddress: request ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ipUtils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getClientIpFromRequest"])(request) : null,
        requestId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$requestId$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRequestId"])() || request?.headers?.get?.("x-request-id") || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$requestId$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateRequestId"])()
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
        app: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAppLogRetentionDays"])(),
        call: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCallLogRetentionDays"])()
    };
}
async function cleanupExpiredLogs() {
    const db = getDb();
    const appRetentionDays = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAppLogRetentionDays"])();
    const callRetentionDays = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCallLogRetentionDays"])();
    const callLogsMaxRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCallLogsTableMaxRows"])();
    const proxyLogsMaxRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getProxyLogsTableMaxRows"])();
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
    const callOverride = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCallLogRetentionDaysOverride"])();
    const appOverride = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAppLogRetentionDaysOverride"])();
    let dbRetention = null;
    try {
        const r = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUserDatabaseSettings"])().retention;
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
        const { deleteCallLogsBefore } = await __turbopack_context__.A("[project]/src/lib/usage/callLogs.ts [app-route] (ecmascript, async loader)");
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
            const { trimCallLogsToMaxRows } = await __turbopack_context__.A("[project]/src/lib/usage/callLogs.ts [app-route] (ecmascript, async loader)");
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
"[project]/src/app/api/auth/logout/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST,
    "logoutRouteInternals",
    ()=>logoutRouteInternals
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/compliance/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
;
;
;
const logoutRouteInternals = {
    getCookieStore: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"]
};
async function POST(request) {
    const auditContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAuditRequestContext"])(request);
    const cookieStore = await logoutRouteInternals.getCookieStore();
    cookieStore.delete("auth_token");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["logAuditEvent"])({
        action: "auth.logout.success",
        actor: "admin",
        target: "dashboard-auth",
        resourceType: "auth_session",
        status: "success",
        ipAddress: auditContext.ipAddress || undefined,
        requestId: auditContext.requestId
    });
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: true
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1a9gv_o._.js.map