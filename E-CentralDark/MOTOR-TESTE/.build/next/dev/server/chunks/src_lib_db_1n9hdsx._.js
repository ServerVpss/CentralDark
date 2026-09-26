module.exports = [
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
"[project]/src/lib/db/apiKeyGroups.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addGroupPermission",
    ()=>addGroupPermission,
    "addKeyToGroup",
    ()=>addKeyToGroup,
    "checkKeyModelAccess",
    ()=>checkKeyModelAccess,
    "clearGroupPermissions",
    ()=>clearGroupPermissions,
    "createKeyGroup",
    ()=>createKeyGroup,
    "deleteKeyGroup",
    ()=>deleteKeyGroup,
    "getAllKeyGroups",
    ()=>getAllKeyGroups,
    "getGroupMembers",
    ()=>getGroupMembers,
    "getGroupPermissions",
    ()=>getGroupPermissions,
    "getKeyGroup",
    ()=>getKeyGroup,
    "getKeyGroupWithPermissions",
    ()=>getKeyGroupWithPermissions,
    "getKeyGroupsForApiKey",
    ()=>getKeyGroupsForApiKey,
    "removeGroupPermission",
    ()=>removeGroupPermission,
    "removeKeyFromGroup",
    ()=>removeKeyFromGroup,
    "updateKeyGroup",
    ()=>updateKeyGroup
]);
/**
 * API Key Groups DB — CRUD operations for team/enterprise key grouping
 *
 * Tables: key_groups, group_model_permissions, key_group_members
 * Migration: 065_api_key_groups.sql
 *
 * Enables team-level API key management with model-level access control.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
;
function getAllKeyGroups() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT * FROM key_groups ORDER BY name ASC").all();
    return rows.map(rowToGroup);
}
function getKeyGroup(id) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT * FROM key_groups WHERE id = ?").get(id);
    return row ? rowToGroup(row) : undefined;
}
function getKeyGroupWithPermissions(id) {
    const group = getKeyGroup(id);
    if (!group) return undefined;
    const permissions = getGroupPermissions(id);
    const memberCount = getGroupMemberCount(id);
    return {
        ...group,
        permissions,
        memberCount
    };
}
function createKeyGroup(name, description = "") {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])();
    const now = new Date().toISOString();
    db.prepare("INSERT INTO key_groups (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)").run(id, name, description, now, now);
    return getKeyGroup(id);
}
function updateKeyGroup(id, updates) {
    const existing = getKeyGroup(id);
    if (!existing) return undefined;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const sets = [];
    const params = {
        id
    };
    if (updates.name !== undefined) {
        sets.push("name = @name");
        params.name = updates.name;
    }
    if (updates.description !== undefined) {
        sets.push("description = @description");
        params.description = updates.description;
    }
    if (updates.isActive !== undefined) {
        sets.push("is_active = @isActive");
        params.isActive = updates.isActive ? 1 : 0;
    }
    if (sets.length === 0) return existing;
    sets.push("updated_at = datetime('now')");
    db.prepare(`UPDATE key_groups SET ${sets.join(", ")} WHERE id = @id`).run(params);
    return getKeyGroup(id);
}
function deleteKeyGroup(id) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    // CASCADE deletes permissions and members
    const result = db.prepare("DELETE FROM key_groups WHERE id = ?").run(id);
    return result.changes > 0;
}
function getGroupPermissions(groupId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT * FROM group_model_permissions WHERE group_id = ? ORDER BY access_type ASC, model_pattern ASC").all(groupId);
    return rows.map(rowToPermission);
}
function addGroupPermission(groupId, modelPattern, accessType, provider) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])();
    const now = new Date().toISOString();
    db.prepare("INSERT INTO group_model_permissions (id, group_id, model_pattern, provider, access_type, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(id, groupId, modelPattern, provider || null, accessType, now);
    return getGroupPermissions(groupId).find((p)=>p.id === id);
}
function removeGroupPermission(permissionId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const result = db.prepare("DELETE FROM group_model_permissions WHERE id = ?").run(permissionId);
    return result.changes > 0;
}
function clearGroupPermissions(groupId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("DELETE FROM group_model_permissions WHERE group_id = ?").run(groupId);
}
function getGroupMembers(groupId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT * FROM key_group_members WHERE group_id = ? ORDER BY created_at ASC").all(groupId);
    return rows.map(rowToMember);
}
function getKeyGroupsForApiKey(keyId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare(`
    SELECT g.* FROM key_groups g
    INNER JOIN key_group_members m ON g.id = m.group_id
    WHERE m.key_id = ? AND g.is_active = 1
    ORDER BY g.name ASC
  `).all(keyId);
    return rows.map(rowToGroup);
}
function addKeyToGroup(keyId, groupId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    try {
        db.prepare("INSERT OR IGNORE INTO key_group_members (key_id, group_id) VALUES (?, ?)").run(keyId, groupId);
        return true;
    } catch  {
        return false;
    }
}
function removeKeyFromGroup(keyId, groupId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const result = db.prepare("DELETE FROM key_group_members WHERE key_id = ? AND group_id = ?").run(keyId, groupId);
    return result.changes > 0;
}
function getGroupMemberCount(groupId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT COUNT(*) as count FROM key_group_members WHERE group_id = ?").get(groupId);
    return row?.count || 0;
}
function checkKeyModelAccess(keyId, model, provider) {
    const groups = getKeyGroupsForApiKey(keyId);
    if (groups.length === 0) {
        // No groups = no restrictions
        return {
            allowed: true,
            matchedRules: [],
            deniedBy: null
        };
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const groupIds = groups.map((g)=>g.id);
    const placeholders = groupIds.map(()=>"?").join(",");
    const rules = db.prepare(`
    SELECT * FROM group_model_permissions
    WHERE group_id IN (${placeholders})
    ORDER BY access_type ASC
  `).all(...groupIds);
    const permissions = rules.map(rowToPermission);
    // Check deny rules first (they take precedence)
    const denyRules = permissions.filter((p)=>p.accessType === "deny" && matchesModelPattern(p.modelPattern, model) && (!p.provider || p.provider === provider));
    if (denyRules.length > 0) {
        return {
            allowed: false,
            matchedRules: permissions,
            deniedBy: denyRules[0]
        };
    }
    // Check allow rules
    const allowRules = permissions.filter((p)=>p.accessType === "allow" && matchesModelPattern(p.modelPattern, model) && (!p.provider || p.provider === provider));
    if (allowRules.length > 0) {
        return {
            allowed: true,
            matchedRules: permissions,
            deniedBy: null
        };
    }
    // No matching rules = restricted by group membership but no explicit allow
    return {
        allowed: false,
        matchedRules: permissions,
        deniedBy: null
    };
}
function matchesModelPattern(pattern, model) {
    if (pattern === "*") return true;
    if (pattern.includes("*")) {
        const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
        return regex.test(model);
    }
    return pattern === model;
}
// ── Row Mappers ──────────────────────────────────────────────────────────
function rowToGroup(row) {
    return {
        id: row.id,
        name: row.name,
        description: row.description || "",
        isActive: row.is_active === 1,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}
function rowToPermission(row) {
    return {
        id: row.id,
        groupId: row.group_id,
        modelPattern: row.model_pattern,
        provider: row.provider || null,
        accessType: row.access_type,
        createdAt: row.created_at
    };
}
function rowToMember(row) {
    return {
        keyId: row.key_id,
        groupId: row.group_id,
        createdAt: row.created_at
    };
}
}),
"[project]/src/lib/db/apiKeyColumnFallbacks.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "API_KEY_COLUMN_FALLBACKS",
    ()=>API_KEY_COLUMN_FALLBACKS
]);
const API_KEY_COLUMN_FALLBACKS = [
    {
        name: "allowed_models",
        definition: "allowed_models TEXT"
    },
    {
        name: "blocked_models",
        definition: "blocked_models TEXT"
    },
    {
        name: "allowed_combos",
        definition: "allowed_combos TEXT"
    },
    {
        name: "no_log",
        definition: "no_log INTEGER NOT NULL DEFAULT 0"
    },
    {
        name: "allowed_connections",
        definition: "allowed_connections TEXT"
    },
    {
        name: "auto_resolve",
        definition: "auto_resolve INTEGER NOT NULL DEFAULT 0"
    },
    {
        name: "is_active",
        definition: "is_active INTEGER NOT NULL DEFAULT 1"
    },
    {
        name: "access_schedule",
        definition: "access_schedule TEXT"
    },
    {
        name: "max_requests_per_day",
        definition: "max_requests_per_day INTEGER"
    },
    {
        name: "max_requests_per_minute",
        definition: "max_requests_per_minute INTEGER"
    },
    {
        name: "throttle_delay_ms",
        definition: "throttle_delay_ms INTEGER"
    },
    {
        name: "max_sessions",
        definition: "max_sessions INTEGER NOT NULL DEFAULT 0"
    },
    {
        name: "revoked_at",
        definition: "revoked_at TEXT"
    },
    {
        name: "expires_at",
        definition: "expires_at TEXT"
    },
    {
        name: "last_used_at",
        definition: "last_used_at TEXT"
    },
    {
        name: "key_prefix",
        definition: "key_prefix TEXT"
    },
    {
        name: "ip_allowlist",
        definition: "ip_allowlist TEXT"
    },
    {
        name: "scopes",
        definition: "scopes TEXT"
    },
    {
        name: "rate_limits",
        definition: "rate_limits TEXT"
    },
    {
        name: "is_banned",
        definition: "is_banned INTEGER NOT NULL DEFAULT 0"
    },
    {
        name: "key_hash",
        definition: "key_hash TEXT"
    },
    {
        name: "proxy_id",
        definition: "proxy_id TEXT"
    },
    {
        name: "allowed_endpoints",
        definition: "allowed_endpoints TEXT"
    },
    {
        name: "allowed_quotas",
        definition: "allowed_quotas TEXT NOT NULL DEFAULT '[]'"
    },
    {
        name: "stream_default_mode",
        definition: "stream_default_mode TEXT NOT NULL DEFAULT 'legacy'"
    },
    {
        name: "disable_non_public_models",
        definition: "disable_non_public_models INTEGER NOT NULL DEFAULT 0"
    },
    {
        name: "allow_usage_command",
        definition: "allow_usage_command INTEGER NOT NULL DEFAULT 0"
    },
    {
        name: "usage_limit_enabled",
        definition: "usage_limit_enabled INTEGER NOT NULL DEFAULT 0"
    },
    {
        name: "daily_usage_limit_usd",
        definition: "daily_usage_limit_usd REAL"
    },
    {
        name: "weekly_usage_limit_usd",
        definition: "weekly_usage_limit_usd REAL"
    },
    {
        name: "chaos_mode_enabled",
        definition: "chaos_mode_enabled INTEGER NOT NULL DEFAULT 0"
    }
];
}),
"[project]/src/lib/db/apiKeyUsageLimitFields.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "appendUsageLimitUpdates",
    ()=>appendUsageLimitUpdates,
    "hasUsageLimitUpdate",
    ()=>hasUsageLimitUpdate,
    "parseApiKeyUsageLimitFields",
    ()=>parseApiKeyUsageLimitFields,
    "parseNullablePositiveNumber",
    ()=>parseNullablePositiveNumber,
    "parseUsageLimitEnabled",
    ()=>parseUsageLimitEnabled
]);
function parseUsageLimitEnabled(value) {
    return value === true || value === 1 || value === "1";
}
function parseNullablePositiveNumber(value) {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
    if (typeof value === "string" && value.trim()) {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }
    return null;
}
function parseApiKeyUsageLimitFields(record) {
    return {
        usageLimitEnabled: parseUsageLimitEnabled(record.usage_limit_enabled ?? record.usageLimitEnabled),
        dailyUsageLimitUsd: parseNullablePositiveNumber(record.daily_usage_limit_usd ?? record.dailyUsageLimitUsd),
        weeklyUsageLimitUsd: parseNullablePositiveNumber(record.weekly_usage_limit_usd ?? record.weeklyUsageLimitUsd)
    };
}
function hasUsageLimitUpdate(update) {
    return update.usageLimitEnabled !== undefined || update.dailyUsageLimitUsd !== undefined || update.weeklyUsageLimitUsd !== undefined;
}
function appendUsageLimitUpdates(update, updates, params) {
    if (update.usageLimitEnabled !== undefined) {
        updates.push("usage_limit_enabled = @usageLimitEnabled");
        params.usageLimitEnabled = update.usageLimitEnabled === true ? 1 : 0;
    }
    if (update.dailyUsageLimitUsd !== undefined) {
        updates.push("daily_usage_limit_usd = @dailyUsageLimitUsd");
        params.dailyUsageLimitUsd = parseNullablePositiveNumber(update.dailyUsageLimitUsd);
    }
    if (update.weeklyUsageLimitUsd !== undefined) {
        updates.push("weekly_usage_limit_usd = @weeklyUsageLimitUsd");
        params.weeklyUsageLimitUsd = parseNullablePositiveNumber(update.weeklyUsageLimitUsd);
    }
}
}),
"[project]/src/lib/db/apiKeys/modelPermissions.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// API-key model-permission matching: Claude-Code alias/prefix resolution + wildcard/glob pattern
// matching used to decide whether a model is permitted for a key. Pure logic (no DB) extracted from
// db/apiKeys.ts (god-file decomposition); behavior is byte-identical to the original inline defs.
__turbopack_context__.s([
    "CLAUDE_CODE_PROVIDER_PREFIXES",
    ()=>CLAUDE_CODE_PROVIDER_PREFIXES,
    "CLAUDE_CODE_SHORT_ALIASES",
    ()=>CLAUDE_CODE_SHORT_ALIASES,
    "addModelCandidate",
    ()=>addModelCandidate,
    "addProviderAliasScopedCandidates",
    ()=>addProviderAliasScopedCandidates,
    "hasClaudeCodeWildcardPermission",
    ()=>hasClaudeCodeWildcardPermission,
    "isPotentialUnprefixedClaudeCodeModel",
    ()=>isPotentialUnprefixedClaudeCodeModel,
    "isTruthyEnvFlag",
    ()=>isTruthyEnvFlag,
    "matchesWildcardPattern",
    ()=>matchesWildcardPattern,
    "modelPatternMatches",
    ()=>modelPatternMatches,
    "preferClaudeCodeForUnprefixedClaudeModels",
    ()=>preferClaudeCodeForUnprefixedClaudeModels,
    "segmentMatchesWildcard",
    ()=>segmentMatchesWildcard,
    "stripExtendedContextSuffix",
    ()=>stripExtendedContextSuffix
]);
const CLAUDE_CODE_PROVIDER_PREFIXES = new Set([
    "cc",
    "claude"
]);
const CLAUDE_CODE_SHORT_ALIASES = new Set([
    "sonnet",
    "opus",
    "haiku",
    "fable"
]);
function isTruthyEnvFlag(value) {
    return typeof value === "string" && /^(1|true|yes|on)$/i.test(value.trim());
}
async function preferClaudeCodeForUnprefixedClaudeModels() {
    try {
        const { getCachedSettings } = await __turbopack_context__.A("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript, async loader)");
        const settings = await getCachedSettings();
        if (typeof settings.preferClaudeCodeForUnprefixedClaudeModels === "boolean") {
            return settings.preferClaudeCodeForUnprefixedClaudeModels;
        }
    } catch  {
    // Standalone DB usage may not have the settings cache ready.
    }
    return isTruthyEnvFlag(process.env.OMNIROUTE_PREFER_CLAUDE_CODE_FOR_UNPREFIXED_CLAUDE_MODELS);
}
function stripExtendedContextSuffix(modelId) {
    return modelId.endsWith("[1m]") ? modelId.slice(0, -4) : modelId;
}
function isPotentialUnprefixedClaudeCodeModel(modelId) {
    const clean = stripExtendedContextSuffix(modelId.trim());
    return /^claude-/i.test(clean) || CLAUDE_CODE_SHORT_ALIASES.has(clean.toLowerCase());
}
function addModelCandidate(candidates, modelId) {
    const clean = modelId.trim();
    if (!clean) return;
    candidates.add(clean);
    candidates.add(stripExtendedContextSuffix(clean));
}
function addProviderAliasScopedCandidates(candidates, providerOrAlias, providerScopedModel, resolveProviderId, getProviderAlias) {
    if (!providerScopedModel) return;
    const canonicalId = resolveProviderId(providerOrAlias);
    const alias = getProviderAlias(canonicalId);
    if (canonicalId !== providerOrAlias) {
        addModelCandidate(candidates, `${canonicalId}/${providerScopedModel}`);
    }
    if (alias !== providerOrAlias && alias !== canonicalId) {
        addModelCandidate(candidates, `${alias}/${providerScopedModel}`);
    }
}
function modelPatternMatches(pattern, candidates) {
    for (const candidate of candidates){
        if (pattern === candidate) return true;
        if (pattern.endsWith("/*")) {
            const prefix = pattern.slice(0, -2);
            if (candidate.startsWith(prefix + "/") || candidate.startsWith(prefix)) {
                return true;
            }
        }
        if (pattern.includes("*") && matchesWildcardPattern(pattern, candidate)) {
            return true;
        }
    }
    return false;
}
function hasClaudeCodeWildcardPermission(allowedModels, candidates) {
    if (!allowedModels || allowedModels.length === 0) return false;
    return allowedModels.some((pattern)=>(pattern === "cc/*" || pattern === "claude/*") && candidates.some((candidate)=>modelPatternMatches(pattern, [
                candidate
            ])));
}
function matchesWildcardPattern(pattern, candidate) {
    const pSegs = pattern.split("/");
    const cSegs = candidate.split("/");
    if (pSegs.length !== cSegs.length) return false;
    for(let i = 0; i < pSegs.length; i++){
        if (!segmentMatchesWildcard(pSegs[i], cSegs[i])) return false;
    }
    return true;
}
function segmentMatchesWildcard(pattern, segment) {
    if (pattern === segment) return true;
    if (!pattern.includes("*")) return false;
    const parts = pattern.split("*");
    // Anchor first literal to the start.
    let cursor = 0;
    const first = parts[0];
    if (first) {
        if (!segment.startsWith(first)) return false;
        cursor = first.length;
    }
    // Anchor last literal to the end.
    const last = parts[parts.length - 1];
    const endLimit = segment.length - last.length;
    if (last) {
        if (!segment.endsWith(last)) return false;
    }
    // Each middle literal must appear in order between cursor and endLimit.
    for(let i = 1; i < parts.length - 1; i++){
        const piece = parts[i];
        if (!piece) continue;
        const idx = segment.indexOf(piece, cursor);
        if (idx === -1 || idx + piece.length > endLimit) return false;
        cursor = idx + piece.length;
    }
    return cursor <= endLimit;
}
}),
"[project]/src/lib/db/apiKeys/rowParsers.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * db/apiKeys/rowParsers.ts — pure column parsers for persisted api_keys rows.
 *
 * Extracted verbatim from db/apiKeys.ts (god-file decomposition): the family of
 * functions that coerce raw SQLite column values (JSON strings, 0/1 flags, nullable
 * timestamps) into the typed shapes the host hydrates rows with. Pure — no DB handle,
 * no caches, no side effects — so they live as a co-located leaf. Behavior-preserving
 * move; apiKeys.ts imports them back for getApiKeys/getApiKeyById/getApiKeyMetadata.
 */ __turbopack_context__.s([
    "parseAccessSchedule",
    ()=>parseAccessSchedule,
    "parseAllowUsageCommand",
    ()=>parseAllowUsageCommand,
    "parseAllowedCombos",
    ()=>parseAllowedCombos,
    "parseAllowedConnections",
    ()=>parseAllowedConnections,
    "parseAllowedModels",
    ()=>parseAllowedModels,
    "parseAllowedQuotas",
    ()=>parseAllowedQuotas,
    "parseAutoResolve",
    ()=>parseAutoResolve,
    "parseChaosModeEnabled",
    ()=>parseChaosModeEnabled,
    "parseDisableNonPublicModels",
    ()=>parseDisableNonPublicModels,
    "parseIsActive",
    ()=>parseIsActive,
    "parseIsBanned",
    ()=>parseIsBanned,
    "parseNoLog",
    ()=>parseNoLog,
    "parseNullableTimestamp",
    ()=>parseNullableTimestamp,
    "parseRateLimits",
    ()=>parseRateLimits,
    "parseStreamDefaultMode",
    ()=>parseStreamDefaultMode,
    "parseStringList",
    ()=>parseStringList
]);
function parseAllowedModels(value) {
    if (!value || typeof value !== "string" || value.trim() === "") {
        return [];
    }
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter((entry)=>typeof entry === "string") : [];
    } catch  {
        return [];
    }
}
function parseAllowedCombos(value) {
    return parseStringList(value);
}
function parseNoLog(value) {
    return value === true || value === 1 || value === "1";
}
function parseAutoResolve(value) {
    return value === true || value === 1 || value === "1";
}
function parseDisableNonPublicModels(value) {
    return value === true || value === 1 || value === "1";
}
function parseAllowUsageCommand(value) {
    return value === true || value === 1 || value === "1";
}
function parseChaosModeEnabled(value) {
    return value === true || value === 1 || value === "1";
}
function parseIsActive(value) {
    // DEFAULT 1 — active unless explicitly set to 0
    if (value === 0 || value === "0" || value === false) return false;
    return true;
}
function parseAccessSchedule(value) {
    if (!value || typeof value !== "string" || value.trim() === "") return null;
    try {
        const parsed = JSON.parse(value);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
        const obj = parsed;
        if (typeof obj["enabled"] !== "boolean" || typeof obj["from"] !== "string" || typeof obj["until"] !== "string" || !Array.isArray(obj["days"]) || typeof obj["tz"] !== "string") {
            return null;
        }
        const days = obj["days"].filter((d)=>typeof d === "number" && Number.isInteger(d) && d >= 0 && d <= 6);
        return {
            enabled: obj["enabled"],
            from: obj["from"],
            until: obj["until"],
            days,
            tz: obj["tz"]
        };
    } catch  {
        return null;
    }
}
function parseRateLimits(value) {
    if (!value || typeof value !== "string" || value.trim() === "") return null;
    try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) return null;
        return parsed.filter((rule)=>typeof rule === "object" && rule !== null && typeof rule.limit === "number" && typeof rule.window === "number");
    } catch  {
        return null;
    }
}
function parseAllowedConnections(value) {
    if (!value || typeof value !== "string" || value.trim() === "") {
        return [];
    }
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter((entry)=>typeof entry === "string") : [];
    } catch  {
        return [];
    }
}
function parseAllowedQuotas(value) {
    if (!value || typeof value !== "string" || value.trim() === "") {
        return [];
    }
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter((entry)=>typeof entry === "string") : [];
    } catch  {
        return [];
    }
}
function parseStringList(value) {
    if (!value || typeof value !== "string" || value.trim() === "") return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter((entry)=>typeof entry === "string") : [];
    } catch  {
        return [];
    }
}
function parseNullableTimestamp(value) {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
}
function parseIsBanned(value) {
    return value === 1 || value === "1" || value === true;
}
function parseStreamDefaultMode(value) {
    return value === "json" ? "json" : "legacy";
}
}),
"[project]/src/lib/db/apiKeys.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "clearApiKeyCaches",
    ()=>clearApiKeyCaches,
    "createApiKey",
    ()=>createApiKey,
    "deleteApiKey",
    ()=>deleteApiKey,
    "getApiKeyById",
    ()=>getApiKeyById,
    "getApiKeyMetadata",
    ()=>getApiKeyMetadata,
    "getApiKeys",
    ()=>getApiKeys,
    "getApiKeysCount",
    ()=>getApiKeysCount,
    "isModelAllowedForKey",
    ()=>isModelAllowedForKey,
    "pickApiKeyForInternalUse",
    ()=>pickApiKeyForInternalUse,
    "regenerateApiKey",
    ()=>regenerateApiKey,
    "resetApiKeyState",
    ()=>resetApiKeyState,
    "revokeApiKey",
    ()=>revokeApiKey,
    "setApiKeyExpiry",
    ()=>setApiKeyExpiry,
    "updateApiKeyPermissions",
    ()=>updateApiKeyPermissions,
    "validateApiKey",
    ()=>validateApiKey
]);
/**
 * db/apiKeys.js — API key management.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist-node/v4.js [instrumentation] (ecmascript) <export default as v4>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/caseMapping.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$stateReset$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/stateReset.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningRoutingRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/reasoningRoutingRules.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeyGroups$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeyGroups.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeyColumnFallbacks$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeyColumnFallbacks.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeyUsageLimitFields$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeyUsageLimitFields.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$noLog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/compliance/noLog.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$modelDeprecation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/modelDeprecation.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/models.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$modelPermissions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeys/modelPermissions.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeys/rowParsers.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
// ──────────────── Performance Optimizations ────────────────
// Schema check memoization - only run once
let _schemaChecked = false;
// LRU cache for API key validation (valid keys only)
const _keyValidationCache = new Map();
const _keyMetadataCache = new Map();
const _lastUsedUpdateCache = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute TTL
const LAST_USED_UPDATE_TTL = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 1000;
// Wildcard scope matching is now handled by `matchesWildcardPattern`
// (deterministic, no RegExp from dynamic strings).
// Cache for model permission checks
const _modelPermissionCache = new Map();
// Prepared statements cache
let _stmtGetAllKeys = null;
let _stmtGetKeyById = null;
let _stmtValidateKey = null;
let _stmtGetKeyMetadata = null;
let _stmtInsertKey = null;
let _stmtDeleteKey = null;
/**
 * Clear all caches (called on key create/update/delete)
 */ function invalidateCaches() {
    _keyValidationCache.clear();
    _keyMetadataCache.clear();
    _modelPermissionCache.clear();
    _lastUsedUpdateCache.clear();
}
function toRecord(value) {
    return value && typeof value === "object" ? value : {};
}
function isConfiguredEnvApiKey(key) {
    const envKey = process.env.OMNIROUTE_API_KEY || process.env.ROUTER_API_KEY;
    return Boolean(envKey && key === envKey);
}
function isRedisAuthCacheEnabled() {
    return process.env.OMNIROUTE_DISABLE_REDIS_AUTH_CACHE !== "1" && ("TURBOPACK compile-time value", "development") !== "test" && process.env.DISABLE_SQLITE_AUTO_BACKUP !== "true";
}
async function deleteRedisAuthCacheEntry(keyHash) {
    if (!isRedisAuthCacheEnabled() || typeof keyHash !== "string" || keyHash.trim() === "") return;
    try {
        const { getRedisClient, isRedisConfigured } = await __turbopack_context__.A("[project]/src/shared/utils/rateLimiter.ts [instrumentation] (ecmascript, async loader)");
        if (!isRedisConfigured()) return;
        const redis = await getRedisClient();
        await redis.del(`auth:api_key:${keyHash}`);
    } catch  {
    // Redis is an optimization for auth caching; SQLite remains authoritative.
    }
}
async function deleteRedisAuthCacheEntries(...keyHashes) {
    await Promise.all(keyHashes.map((keyHash)=>deleteRedisAuthCacheEntry(keyHash)));
}
async function deleteRedisAuthCacheForKeyId(db, id) {
    if (!isRedisAuthCacheEnabled()) return;
    const row = db.prepare("SELECT key_hash FROM api_keys WHERE id = ?").get(id);
    await deleteRedisAuthCacheEntry(row?.key_hash);
}
function markApiKeyUsed(db, id, now) {
    if (typeof id !== "string" || id.trim() === "") return;
    const lastUpdate = _lastUsedUpdateCache.get(id);
    if (lastUpdate && now - lastUpdate < LAST_USED_UPDATE_TTL) return;
    db.prepare("UPDATE api_keys SET last_used_at = @lastUsedAt WHERE id = @id").run({
        id,
        lastUsedAt: new Date(now).toISOString()
    });
    _lastUsedUpdateCache.set(id, now);
}
/**
 * LRU eviction for cache
 */ function evictIfNeeded(cache) {
    if (cache.size > MAX_CACHE_SIZE) {
        // Remove oldest 20% of entries
        const entriesToRemove = Math.floor(MAX_CACHE_SIZE * 0.2);
        let i = 0;
        for (const key of cache.keys()){
            if (i++ >= entriesToRemove) break;
            cache.delete(key);
        }
    }
}
async function getModelPermissionCandidates(modelId) {
    const candidates = new Set();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$modelPermissions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["addModelCandidate"])(candidates, modelId);
    const cleanModelId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$modelPermissions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripExtendedContextSuffix"])(modelId.trim());
    if (!cleanModelId) return Array.from(candidates);
    if (cleanModelId.includes("/")) {
        const firstSlash = cleanModelId.indexOf("/");
        const providerOrAlias = cleanModelId.slice(0, firstSlash);
        const providerScopedModel = cleanModelId.slice(firstSlash + 1);
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$modelPermissions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLAUDE_CODE_PROVIDER_PREFIXES"].has(providerOrAlias) && providerScopedModel) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$modelPermissions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["addModelCandidate"])(candidates, providerScopedModel);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$modelPermissions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["addModelCandidate"])(candidates, `cc/${providerScopedModel}`);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$modelPermissions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["addModelCandidate"])(candidates, `claude/${providerScopedModel}`);
        }
        if (providerScopedModel) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$modelPermissions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["addProviderAliasScopedCandidates"])(candidates, providerOrAlias, providerScopedModel, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProviderId"], __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderAlias"]);
        }
        return Array.from(candidates);
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$modelPermissions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isPotentialUnprefixedClaudeCodeModel"])(cleanModelId) && await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$modelPermissions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["preferClaudeCodeForUnprefixedClaudeModels"])()) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$modelPermissions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["addModelCandidate"])(candidates, `cc/${cleanModelId}`);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$modelPermissions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["addModelCandidate"])(candidates, `claude/${cleanModelId}`);
    }
    return Array.from(candidates);
}
async function getPublishedModelLookupTarget(modelId) {
    const cleanModelId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$modelPermissions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripExtendedContextSuffix"])(modelId.trim());
    if (!cleanModelId) return null;
    if (cleanModelId.includes("/")) {
        const firstSlash = cleanModelId.indexOf("/");
        const providerOrAlias = cleanModelId.slice(0, firstSlash);
        const providerScopedModel = cleanModelId.slice(firstSlash + 1);
        if (!providerScopedModel) return null;
        const providerId = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$modelPermissions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLAUDE_CODE_PROVIDER_PREFIXES"].has(providerOrAlias) ? "claude" : providerOrAlias;
        return {
            providerId,
            modelId: providerScopedModel
        };
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$modelPermissions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isPotentialUnprefixedClaudeCodeModel"])(cleanModelId) && await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$modelPermissions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["preferClaudeCodeForUnprefixedClaudeModels"])()) {
        return {
            providerId: "claude",
            modelId: cleanModelId
        };
    }
    return null;
}
function ensureApiKeyColumn(db, columnNames, column) {
    if (columnNames.has(column.name)) return;
    db.exec(`ALTER TABLE api_keys ADD COLUMN ${column.definition}`);
    console.log(`[DB] Added api_keys.${column.name} column`);
}
// Ensure api_keys extension columns exist (memoized)
function ensureApiKeysColumns(db) {
    if (_schemaChecked) return;
    try {
        const columns = db.prepare("PRAGMA table_info(api_keys)").all();
        const columnNames = new Set(columns.map((column)=>String(column.name ?? "")));
        for (const column of __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeyColumnFallbacks$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["API_KEY_COLUMN_FALLBACKS"]){
            ensureApiKeyColumn(db, columnNames, column);
        }
        _schemaChecked = true;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn("[DB] Failed to verify api_keys schema:", message);
    }
}
/**
 * Initialize prepared statements (lazy initialization)
 * Re-creates statements if the underlying DB connection changed (HMR, backup restore).
 */ let _stmtDb = null;
function getPreparedStatements(db) {
    ensureApiKeysColumns(db);
    if (!_stmtGetAllKeys || !_stmtGetKeyById || !_stmtValidateKey || !_stmtGetKeyMetadata || !_stmtInsertKey || !_stmtDeleteKey || _stmtDb !== db) {
        _stmtDb = db;
        _stmtGetAllKeys = db.prepare("SELECT * FROM api_keys ORDER BY created_at");
        _stmtGetKeyById = db.prepare("SELECT * FROM api_keys WHERE id = ?");
        _stmtValidateKey = db.prepare("SELECT id, expires_at, revoked_at, is_active, is_banned FROM api_keys WHERE key = ? OR key_hash = ?");
        _stmtGetKeyMetadata = db.prepare("SELECT id, name, machine_id, allowed_models, blocked_models, allowed_combos, allowed_connections, allowed_quotas, no_log, auto_resolve, is_active, access_schedule, max_requests_per_day, max_requests_per_minute, throttle_delay_ms, max_sessions, revoked_at, expires_at, ip_allowlist, scopes, rate_limits, is_banned, key_hash, allowed_endpoints, stream_default_mode, disable_non_public_models, allow_usage_command, usage_limit_enabled, daily_usage_limit_usd, weekly_usage_limit_usd, chaos_mode_enabled, proxy_id FROM api_keys WHERE key = ? OR key_hash = ?");
        _stmtInsertKey = db.prepare("INSERT INTO api_keys (id, name, key, machine_id, allowed_models, no_log, created_at, key_prefix, key_hash, scopes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        _stmtDeleteKey = db.prepare("DELETE FROM api_keys WHERE id = ?");
    }
    if (!_stmtGetAllKeys || !_stmtGetKeyById || !_stmtValidateKey || !_stmtGetKeyMetadata || !_stmtInsertKey || !_stmtDeleteKey) {
        throw new Error("Failed to initialize API key prepared statements");
    }
    return {
        getAllKeys: _stmtGetAllKeys,
        getKeyById: _stmtGetKeyById,
        validateKey: _stmtValidateKey,
        getKeyMetadata: _stmtGetKeyMetadata,
        insertKey: _stmtInsertKey,
        deleteKey: _stmtDeleteKey
    };
}
async function getApiKeys(limit, offset) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    let rows;
    if (limit !== undefined) {
        const sql = "SELECT * FROM api_keys ORDER BY created_at LIMIT ? OFFSET ?";
        rows = db.prepare(sql).all(limit, offset ?? 0);
    } else {
        const stmt = getPreparedStatements(db);
        rows = stmt.getAllKeys.all();
    }
    return rows.map((row)=>{
        const camelRow = toRecord((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["rowToCamel"])(row));
        camelRow.allowedModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAllowedModels"])(camelRow.allowedModels);
        camelRow.blockedModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAllowedModels"])(camelRow.blockedModels);
        camelRow.allowedCombos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAllowedCombos"])(camelRow.allowedCombos);
        camelRow.allowedConnections = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAllowedConnections"])(camelRow.allowedConnections);
        camelRow.allowedQuotas = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAllowedQuotas"])(camelRow.allowedQuotas);
        camelRow.noLog = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseNoLog"])(camelRow.noLog);
        camelRow.autoResolve = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAutoResolve"])(camelRow.autoResolve);
        camelRow.isActive = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseIsActive"])(camelRow.isActive);
        camelRow.accessSchedule = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAccessSchedule"])(camelRow.accessSchedule);
        camelRow.rateLimits = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseRateLimits"])(camelRow.rateLimits);
        camelRow.isBanned = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseIsBanned"])(camelRow.isBanned);
        camelRow.scopes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseStringList"])(camelRow.scopes);
        camelRow.allowedEndpoints = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseStringList"])(camelRow.allowedEndpoints);
        camelRow.streamDefaultMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseStreamDefaultMode"])(camelRow.streamDefaultMode);
        camelRow.disableNonPublicModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseDisableNonPublicModels"])(camelRow.disableNonPublicModels);
        camelRow.allowUsageCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAllowUsageCommand"])(camelRow.allowUsageCommand);
        camelRow.chaosModeEnabled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseChaosModeEnabled"])(camelRow.chaosModeEnabled);
        Object.assign(camelRow, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeyUsageLimitFields$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseApiKeyUsageLimitFields"])(camelRow));
        if (typeof camelRow.id === "string" && camelRow.id.length > 0) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$noLog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["setNoLog"])(camelRow.id, camelRow.noLog === true);
        }
        return camelRow;
    });
}
function getApiKeysCount() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT count(*) as cnt FROM api_keys").get();
    return row.cnt;
}
async function pickApiKeyForInternalUse(purpose = "internal-probe") {
    try {
        const keys = await getApiKeys();
        const isUsable = (k)=>Boolean(k.key) && k.isActive !== false && !k.revokedAt && k.isBanned !== true;
        // 1. Management-scoped key (preferred for any internal probe).
        const manageKey = keys.find((k)=>isUsable(k) && Array.isArray(k.scopes) && k.scopes.includes("manage"));
        if (manageKey?.key) return manageKey.key;
        // 2. Allow-all key (empty allowedModels means no model restrictions).
        const allowAllKey = keys.find((k)=>isUsable(k) && Array.isArray(k.allowedModels) && k.allowedModels.length === 0);
        if (allowAllKey?.key) return allowAllKey.key;
        // 3. Most recently used (proxy for "the user actually wants this one
        //    working right now").
        const byRecency = [
            ...keys
        ].filter(isUsable).sort((a, b)=>{
            const aT = typeof a.lastUsedAt === "number" ? a.lastUsedAt : 0;
            const bT = typeof b.lastUsedAt === "number" ? b.lastUsedAt : 0;
            return bT - aT;
        });
        if (byRecency[0]?.key) return byRecency[0].key;
        // 4. Legacy fallback: first active key. Keeps the function working
        //    for setups with no managed/allow-all/recently-used key.
        const firstActive = keys.find(isUsable);
        return firstActive?.key ?? null;
    } catch  {
        return null;
    }
}
async function getApiKeyById(id) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const stmt = getPreparedStatements(db);
    const row = stmt.getKeyById.get(id);
    if (!row) return null;
    const camelRow = toRecord((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["rowToCamel"])(row));
    camelRow.allowedModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAllowedModels"])(camelRow.allowedModels);
    camelRow.blockedModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAllowedModels"])(camelRow.blockedModels);
    camelRow.allowedCombos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAllowedCombos"])(camelRow.allowedCombos);
    camelRow.allowedConnections = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAllowedConnections"])(camelRow.allowedConnections);
    camelRow.allowedQuotas = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAllowedQuotas"])(camelRow.allowedQuotas);
    camelRow.noLog = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseNoLog"])(camelRow.noLog);
    camelRow.autoResolve = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAutoResolve"])(camelRow.autoResolve);
    camelRow.isActive = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseIsActive"])(camelRow.isActive);
    camelRow.accessSchedule = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAccessSchedule"])(camelRow.accessSchedule);
    camelRow.rateLimits = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseRateLimits"])(camelRow.rateLimits);
    camelRow.isBanned = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseIsBanned"])(camelRow.isBanned);
    camelRow.scopes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseStringList"])(camelRow.scopes);
    camelRow.allowedEndpoints = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseStringList"])(camelRow.allowedEndpoints);
    camelRow.streamDefaultMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseStreamDefaultMode"])(camelRow.streamDefaultMode);
    camelRow.disableNonPublicModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseDisableNonPublicModels"])(camelRow.disableNonPublicModels);
    camelRow.allowUsageCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAllowUsageCommand"])(camelRow.allowUsageCommand);
    camelRow.chaosModeEnabled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseChaosModeEnabled"])(camelRow.chaosModeEnabled);
    Object.assign(camelRow, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeyUsageLimitFields$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseApiKeyUsageLimitFields"])(camelRow));
    if (typeof camelRow.id === "string" && camelRow.id.length > 0) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$noLog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["setNoLog"])(camelRow.id, camelRow.noLog === true);
    }
    return camelRow;
}
async function hashKey(key) {
    if (!key || typeof key !== "string") return "";
    // CodeQL: This is intentionally SHA-256, NOT password hashing. API keys are
    // high-entropy random tokens (not user-chosen passwords) and need fast O(1)
    // comparison for per-request validation. bcrypt/scrypt would add ~100ms per
    // request, which is unacceptable for an API proxy.
    // lgtm[js/insufficient-password-hash]
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHash"])("sha256").update(key).digest("hex"); // nosemgrep: insufficient-password-hash
}
async function createApiKey(name, machineId, scopes = []) {
    if (!machineId) {
        throw new Error("machineId is required");
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const now = new Date().toISOString();
    const { generateApiKeyWithMachine } = await __turbopack_context__.A("[project]/src/shared/utils/apiKey.ts [instrumentation] (ecmascript, async loader)");
    const result = generateApiKeyWithMachine(machineId);
    const apiKey = {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
        name: name,
        key: result.key,
        machineId: machineId,
        allowedModels: [],
        allowedCombos: [],
        allowedConnections: [],
        noLog: false,
        allowUsageCommand: false,
        createdAt: now,
        scopes
    };
    const stmt = getPreparedStatements(db);
    stmt.insertKey.run(apiKey.id, apiKey.name, apiKey.key, apiKey.machineId, "[]", 0, apiKey.createdAt, apiKey.key.slice(0, 12), await hashKey(apiKey.key), JSON.stringify(scopes));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$noLog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["setNoLog"])(apiKey.id, false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return apiKey;
}
async function regenerateApiKey(id) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const stmt = getPreparedStatements(db);
    const row = stmt.getKeyById.get(id);
    if (!row) return null;
    const { generateApiKeyWithMachine } = await __turbopack_context__.A("[project]/src/shared/utils/apiKey.ts [instrumentation] (ecmascript, async loader)");
    const machineId = row.machine_id || row.machineId || "0000000000000000";
    const { key: newKey } = generateApiKeyWithMachine(machineId);
    const newHash = await hashKey(newKey);
    const newPrefix = newKey.slice(0, 12);
    // Update in DB
    const updateStmt = db.prepare("UPDATE api_keys SET key = ?, key_hash = ?, key_prefix = ? WHERE id = ?");
    updateStmt.run(newKey, newHash, newPrefix, id);
    // Invalidate all caches
    clearApiKeyCaches();
    await deleteRedisAuthCacheEntries(row.key_hash, newHash);
    const { logAuditEvent } = await __turbopack_context__.A("[project]/src/lib/compliance/index.ts [instrumentation] (ecmascript, async loader)");
    logAuditEvent({
        action: "apiKey.regenerate",
        target: id,
        details: {
            name: String(row.name || "")
        }
    });
    return {
        id,
        key: newKey
    };
}
async function updateApiKeyPermissions(id, update) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    getPreparedStatements(db);
    const normalized = Array.isArray(update) || update === undefined ? {
        allowedModels: update || []
    } : {
        name: update.name,
        allowedModels: update.allowedModels,
        blockedModels: update.blockedModels,
        allowedCombos: update.allowedCombos,
        allowedConnections: update.allowedConnections,
        allowedQuotas: update.allowedQuotas,
        noLog: update.noLog,
        autoResolve: update.autoResolve,
        isActive: update.isActive,
        accessSchedule: update.accessSchedule,
        maxRequestsPerDay: update.maxRequestsPerDay,
        maxRequestsPerMinute: update.maxRequestsPerMinute,
        throttleDelayMs: update.throttleDelayMs,
        rateLimits: update.rateLimits,
        isBanned: update.isBanned,
        expiresAt: update.expiresAt,
        maxSessions: update.maxSessions,
        scopes: update.scopes,
        proxyId: update.proxyId,
        allowedEndpoints: update.allowedEndpoints,
        streamDefaultMode: update.streamDefaultMode,
        disableNonPublicModels: update.disableNonPublicModels,
        allowUsageCommand: update.allowUsageCommand,
        usageLimitEnabled: update.usageLimitEnabled,
        dailyUsageLimitUsd: update.dailyUsageLimitUsd,
        weeklyUsageLimitUsd: update.weeklyUsageLimitUsd,
        chaosModeEnabled: update.chaosModeEnabled
    };
    if (normalized.name === undefined && normalized.allowedModels === undefined && normalized.blockedModels === undefined && normalized.allowedCombos === undefined && normalized.allowedConnections === undefined && normalized.allowedQuotas === undefined && normalized.noLog === undefined && normalized.autoResolve === undefined && normalized.isActive === undefined && normalized.accessSchedule === undefined && normalized.maxRequestsPerDay === undefined && normalized.maxRequestsPerMinute === undefined && normalized.throttleDelayMs === undefined && normalized.rateLimits === undefined && normalized.isBanned === undefined && normalized.expiresAt === undefined && normalized.maxSessions === undefined && normalized.scopes === undefined && normalized.proxyId === undefined && normalized.allowedEndpoints === undefined && normalized.streamDefaultMode === undefined && normalized.disableNonPublicModels === undefined && normalized.allowUsageCommand === undefined && normalized.chaosModeEnabled === undefined && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeyUsageLimitFields$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["hasUsageLimitUpdate"])(normalized)) {
        return false;
    }
    const updates = [];
    const params = {
        id
    };
    if (normalized.name !== undefined) {
        updates.push("name = @name");
        params.name = normalized.name;
    }
    if (normalized.allowedModels !== undefined) {
        // Empty array means all models are allowed
        updates.push("allowed_models = @allowedModels");
        params.allowedModels = JSON.stringify(normalized.allowedModels || []);
    }
    if (normalized.blockedModels !== undefined) {
        // Deny-list patterns always take precedence over allowed_models.
        updates.push("blocked_models = @blockedModels");
        params.blockedModels = JSON.stringify(normalized.blockedModels || []);
    }
    if (normalized.allowedCombos !== undefined) {
        // Empty array means no explicit combo restriction; legacy allowed_models rules still apply.
        updates.push("allowed_combos = @allowedCombos");
        params.allowedCombos = JSON.stringify(normalized.allowedCombos || []);
    }
    if (normalized.allowedConnections !== undefined) {
        // Empty array means all connections are allowed
        updates.push("allowed_connections = @allowedConnections");
        params.allowedConnections = JSON.stringify(normalized.allowedConnections || []);
    }
    const allowedQuotasUpdate = normalized.allowedQuotas;
    if (allowedQuotasUpdate !== undefined) {
        // Empty array means no quota-pool restriction; non-empty restricts to listed pools
        updates.push("allowed_quotas = @allowedQuotas");
        const nextQuotas = Array.isArray(allowedQuotasUpdate) ? allowedQuotasUpdate.filter((s)=>typeof s === "string") : [];
        params.allowedQuotas = JSON.stringify(nextQuotas);
    }
    if (normalized.noLog !== undefined) {
        updates.push("no_log = @noLog");
        params.noLog = normalized.noLog ? 1 : 0;
    }
    if (normalized.autoResolve !== undefined) {
        updates.push("auto_resolve = @autoResolve");
        params.autoResolve = normalized.autoResolve ? 1 : 0;
    }
    if (normalized.isActive !== undefined) {
        updates.push("is_active = @isActive");
        params.isActive = normalized.isActive ? 1 : 0;
    }
    if (normalized.accessSchedule !== undefined) {
        updates.push("access_schedule = @accessSchedule");
        params.accessSchedule = normalized.accessSchedule !== null ? JSON.stringify(normalized.accessSchedule) : null;
    }
    if (normalized.maxRequestsPerDay !== undefined) {
        updates.push("max_requests_per_day = @maxRequestsPerDay");
        params.maxRequestsPerDay = normalized.maxRequestsPerDay;
    }
    if (normalized.maxRequestsPerMinute !== undefined) {
        updates.push("max_requests_per_minute = @maxRequestsPerMinute");
        params.maxRequestsPerMinute = normalized.maxRequestsPerMinute;
    }
    if (normalized.throttleDelayMs !== undefined) {
        updates.push("throttle_delay_ms = @throttleDelayMs");
        params.throttleDelayMs = normalized.throttleDelayMs;
    }
    if (normalized.rateLimits !== undefined) {
        updates.push("rate_limits = @rateLimits");
        params.rateLimits = normalized.rateLimits !== null ? JSON.stringify(normalized.rateLimits) : null;
    }
    if (normalized.isBanned !== undefined) {
        updates.push("is_banned = @isBanned");
        params.isBanned = normalized.isBanned ? 1 : 0;
    }
    if (normalized.expiresAt !== undefined) {
        updates.push("expires_at = @expiresAt");
        params.expiresAt = normalized.expiresAt;
    }
    if (normalized.disableNonPublicModels !== undefined) {
        updates.push("disable_non_public_models = @disableNonPublicModels");
        params.disableNonPublicModels = normalized.disableNonPublicModels ? 1 : 0;
    }
    if (normalized.allowUsageCommand !== undefined) {
        updates.push("allow_usage_command = @allowUsageCommand");
        params.allowUsageCommand = normalized.allowUsageCommand ? 1 : 0;
    }
    if (normalized.chaosModeEnabled !== undefined) {
        updates.push("chaos_mode_enabled = @chaosModeEnabled");
        params.chaosModeEnabled = normalized.chaosModeEnabled ? 1 : 0;
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeyUsageLimitFields$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["appendUsageLimitUpdates"])(normalized, updates, params);
    const maxSessionsUpdate = normalized.maxSessions;
    if (maxSessionsUpdate !== undefined) {
        updates.push("max_sessions = @maxSessions");
        params.maxSessions = typeof maxSessionsUpdate === "number" ? Math.max(0, maxSessionsUpdate) : 0;
    }
    const proxyIdUpdate = normalized.proxyId;
    if (proxyIdUpdate !== undefined) {
        updates.push("proxy_id = @proxyId");
        params.proxyId = typeof proxyIdUpdate === "string" && proxyIdUpdate.trim() !== "" ? proxyIdUpdate : null;
    }
    const allowedEndpointsUpdate = normalized.allowedEndpoints;
    if (allowedEndpointsUpdate !== undefined) {
        updates.push("allowed_endpoints = @allowedEndpoints");
        const nextEndpoints = Array.isArray(allowedEndpointsUpdate) ? allowedEndpointsUpdate.filter((s)=>typeof s === "string") : [];
        params.allowedEndpoints = JSON.stringify(nextEndpoints);
    }
    const streamDefaultModeUpdate = normalized.streamDefaultMode;
    if (streamDefaultModeUpdate !== undefined) {
        updates.push("stream_default_mode = @streamDefaultMode");
        params.streamDefaultMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseStreamDefaultMode"])(streamDefaultModeUpdate);
    }
    const scopesUpdate = normalized.scopes;
    const nextScopes = Array.isArray(scopesUpdate) ? scopesUpdate.filter((s)=>typeof s === "string") : [];
    // Capture previous scopes BEFORE the UPDATE so we can compare for the audit
    // event below. We only fetch when the caller is actually changing scopes —
    // a privileged change ("manage" grants management API surface access) that
    // must always leave an audit trail per OWASP A09 / SOC2 CC7.2.
    //
    // The previous-scopes SELECT and the row UPDATE are wrapped in a single
    // transaction so a concurrent writer cannot slip in between and make the
    // audit log lie about what changed. SQLite is single-writer in practice,
    // but the transaction also gives us atomicity if the underlying driver
    // ever swaps to a backend that allows multiple writers (sqljsAdapter /
    // nodeSqliteAdapter fall-back per v3.8.1 db driver cascade).
    let previousScopes = [];
    let changedRows = 0;
    if (scopesUpdate !== undefined) {
        updates.push("scopes = @scopes");
        params.scopes = JSON.stringify(nextScopes);
        // SELECT-then-UPDATE wrapped in an explicit transaction so a concurrent
        // writer can't slip between the read and the write and make the audit
        // log lie about what changed. `exec("BEGIN"/"COMMIT")` works across all
        // driver backends (better-sqlite3 / node:sqlite / sql.js) wired by the
        // v3.8.1 db driver cascade — none of them expose `db.transaction()` via
        // ApiKeysDbLike, which is intentionally minimal.
        db.exec("BEGIN IMMEDIATE");
        try {
            const prevRow = db.prepare("SELECT scopes FROM api_keys WHERE id = ?").get(id);
            previousScopes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseStringList"])(prevRow?.scopes ?? null);
            const upd = db.prepare(`UPDATE api_keys SET ${updates.join(", ")} WHERE id = @id`).run(params);
            changedRows = upd.changes ?? 0;
            db.exec("COMMIT");
        } catch (err) {
            // Guard the ROLLBACK: if it throws (e.g. transaction already ended
            // due to an implicit commit, or backend in a bad state), the original
            // error from the try block is the actionable one — don't shadow it.
            try {
                db.exec("ROLLBACK");
            } catch  {
            // swallow: original error is more important
            }
            throw err;
        }
    } else {
        const upd = db.prepare(`UPDATE api_keys SET ${updates.join(", ")} WHERE id = @id`).run(params);
        changedRows = upd.changes ?? 0;
    }
    if (changedRows === 0) return false;
    const { logAuditEvent } = await __turbopack_context__.A("[project]/src/lib/compliance/index.ts [instrumentation] (ecmascript, async loader)");
    if (normalized.isBanned !== undefined) {
        logAuditEvent({
            action: normalized.isBanned ? "apiKey.ban" : "apiKey.unban",
            target: id
        });
    }
    if (normalized.isActive !== undefined) {
        logAuditEvent({
            action: normalized.isActive ? "apiKey.activate" : "apiKey.deactivate",
            target: id
        });
    }
    if (scopesUpdate !== undefined) {
        // Compare prev vs next scope sets and emit a dedicated audit event when
        // the privileged "manage" scope is granted or revoked. Other scope
        // mutations also emit a generic "apiKey.scopes.update" so the audit log
        // captures the full change history (action + details).
        const hadManage = previousScopes.includes("manage");
        const hasManage = nextScopes.includes("manage");
        if (!hadManage && hasManage) {
            logAuditEvent({
                action: "apiKey.scopes.grant",
                target: id,
                details: {
                    scopes: nextScopes,
                    previous: previousScopes
                }
            });
        } else if (hadManage && !hasManage) {
            logAuditEvent({
                action: "apiKey.scopes.revoke",
                target: id,
                details: {
                    scopes: nextScopes,
                    previous: previousScopes
                }
            });
        } else if (previousScopes.length !== nextScopes.length || previousScopes.some((s)=>!nextScopes.includes(s)) || nextScopes.some((s)=>!previousScopes.includes(s))) {
            logAuditEvent({
                action: "apiKey.scopes.update",
                target: id,
                details: {
                    scopes: nextScopes,
                    previous: previousScopes
                }
            });
        }
    }
    if (normalized.noLog !== undefined) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$noLog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["setNoLog"])(id, normalized.noLog);
    }
    // Invalidate caches since permissions changed
    invalidateCaches();
    await deleteRedisAuthCacheForKeyId(db, id);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return true;
}
async function deleteApiKey(id) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const stmt = getPreparedStatements(db);
    const row = stmt.getKeyById.get(id);
    const result = stmt.deleteKey.run(id);
    if (result.changes === 0) return false;
    db.prepare("DELETE FROM domain_budgets WHERE api_key_id = ?").run(id);
    db.prepare("DELETE FROM domain_cost_history WHERE api_key_id = ?").run(id);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$noLog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["setNoLog"])(id, false);
    // Invalidate caches since a key was removed
    invalidateCaches();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningRoutingRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateReasoningRoutingRuleCache"])();
    await deleteRedisAuthCacheEntry(row?.key_hash);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return true;
}
async function revokeApiKey(id) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    getPreparedStatements(db);
    const result = db.prepare("UPDATE api_keys SET revoked_at = COALESCE(revoked_at, @ts), is_active = 0 WHERE id = @id").run({
        id,
        ts: new Date().toISOString()
    });
    if ((result.changes ?? 0) === 0) return false;
    invalidateCaches();
    await deleteRedisAuthCacheForKeyId(db, id);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return true;
}
async function setApiKeyExpiry(id, expiresAt) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    getPreparedStatements(db);
    const result = db.prepare("UPDATE api_keys SET expires_at = @expiresAt WHERE id = @id").run({
        id,
        expiresAt
    });
    if ((result.changes ?? 0) === 0) return false;
    invalidateCaches();
    await deleteRedisAuthCacheForKeyId(db, id);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return true;
}
async function validateApiKey(key) {
    if (!key || typeof key !== "string") return false;
    if (isConfiguredEnvApiKey(key)) return true;
    const now = Date.now();
    const hashedKey = await hashKey(key);
    const cacheKey = hashedKey;
    const cached = _keyValidationCache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL) {
        return cached.valid;
    }
    if (isRedisAuthCacheEnabled()) {
        // Try Redis cache for multi-instance consistency
        try {
            const { getRedisClient, isRedisConfigured } = await __turbopack_context__.A("[project]/src/shared/utils/rateLimiter.ts [instrumentation] (ecmascript, async loader)");
            if (isRedisConfigured()) {
                const redis = await getRedisClient();
                const redisKey = `auth:api_key:${hashedKey}`;
                const redisData = await redis.get(redisKey);
                if (redisData) {
                    const data = JSON.parse(redisData);
                    const isBanned = !!data.isBanned;
                    const isActive = !!data.isActive;
                    const revokedAt = data.revokedAt;
                    const expiresAt = data.expiresAt;
                    if (isBanned || !isActive) return false;
                    if (typeof revokedAt === "string" && revokedAt.trim() !== "") return false;
                    if (typeof expiresAt === "string" && expiresAt.trim() !== "") {
                        const expiresMs = Date.parse(expiresAt);
                        if (Number.isFinite(expiresMs) && expiresMs <= now) return false;
                    }
                    return true;
                }
            }
        } catch  {
        // Redis lookup failures fall through to SQLite.
        }
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const stmt = getPreparedStatements(db);
    const row = stmt.validateKey.get(key, hashedKey);
    if (!row) return false;
    const isBanned = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseIsBanned"])(row.is_banned ?? row.isBanned);
    if (isBanned) return false;
    const isActive = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseIsActive"])(row.is_active ?? row.isActive);
    if (!isActive) return false;
    const revokedAt = row.revoked_at ?? row.revokedAt;
    if (typeof revokedAt === "string" && revokedAt.trim() !== "") return false;
    const expiresAt = row.expires_at ?? row.expiresAt;
    if (typeof expiresAt === "string" && expiresAt.trim() !== "") {
        const expiresMs = Date.parse(expiresAt);
        if (Number.isFinite(expiresMs) && expiresMs <= now) return false;
    }
    evictIfNeeded(_keyValidationCache);
    _keyValidationCache.set(cacheKey, {
        valid: true,
        timestamp: now
    });
    if (isRedisAuthCacheEnabled()) {
        // Update Redis cache for fast validation
        try {
            const { getRedisClient, isRedisConfigured } = await __turbopack_context__.A("[project]/src/shared/utils/rateLimiter.ts [instrumentation] (ecmascript, async loader)");
            if (isRedisConfigured()) {
                const redis = await getRedisClient();
                const redisKey = `auth:api_key:${hashedKey}`;
                await redis.set(redisKey, JSON.stringify({
                    id: row.id,
                    isBanned: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseIsBanned"])(row.is_banned),
                    isActive: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseIsActive"])(row.is_active),
                    expiresAt: row.expires_at,
                    revokedAt: row.revoked_at
                }), "EX", 3600 // 1 hour cache
                );
            }
        } catch  {
        // Redis cache update failures do not block successful SQLite validation.
        }
    }
    markApiKeyUsed(db, row.id, now);
    return true;
}
async function getApiKeyMetadata(key) {
    if (!key || typeof key !== "string") return null;
    const now = Date.now();
    // persistent env-var key support (persistent passthrough keys) (#1350)
    if (isConfiguredEnvApiKey(key)) {
        // ─── Env-key management-scope bypass ──────────────────────────────────
        // The deployment-time env key (`OMNIROUTE_API_KEY` / `ROUTER_API_KEY`)
        // is granted the "manage" scope unconditionally. This is intentional:
        //
        //   1. The env key never exists in the SQLite `api_keys` table, so the
        //      DB-backed scopes column does not apply. We synthesize the
        //      metadata record here.
        //   2. The operator who set the env var is presumed to be the deployment
        //      owner; rotating (or unsetting) the env var is the only way to
        //      rotate this privilege. There is no UI to change it.
        //   3. Management API access via the env key still passes through
        //      `requireManagementAuth` → `hasManageScope`, so policy decisions
        //      remain centralised in `src/server/authz/*`.
        //   4. Requests authenticated by the env key are tagged with
        //      `id: "env-key"` for downstream audit-log emitters, making it
        //      possible to distinguish env-key activity from user-created keys
        //      that happen to also hold "manage".
        //
        // DO NOT remove "manage" from this list — that would break the
        // deployment-time bootstrap path that operators rely on for headless
        // / CI / first-boot scenarios. If you need to disable env-key access,
        // unset the env var instead.
        return {
            id: "env-key",
            name: "Environment Key",
            machineId: "server-env",
            allowedModels: [],
            blockedModels: [],
            allowedCombos: [],
            allowedConnections: [],
            allowedQuotas: [],
            noLog: false,
            autoResolve: true,
            isActive: true,
            accessSchedule: null,
            rateLimits: null,
            maxRequestsPerDay: null,
            maxRequestsPerMinute: null,
            throttleDelayMs: null,
            maxSessions: 0,
            revokedAt: null,
            expiresAt: null,
            ipAllowlist: [],
            isBanned: false,
            keyHash: null,
            scopes: [
                "manage"
            ],
            proxyId: null,
            allowedEndpoints: [],
            streamDefaultMode: "legacy",
            disableNonPublicModels: false,
            allowUsageCommand: false,
            usageLimitEnabled: false,
            dailyUsageLimitUsd: null,
            weeklyUsageLimitUsd: null,
            chaosModeEnabled: false
        };
    }
    // Check cache first
    const hashedKey = await hashKey(key);
    const cached = _keyMetadataCache.get(hashedKey);
    if (cached && now - cached.timestamp < CACHE_TTL) {
        return cached.value;
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const stmt = getPreparedStatements(db);
    const row = stmt.getKeyMetadata.get(key, hashedKey);
    if (!row) return null;
    const record = toRecord(row);
    const metadataId = typeof record.id === "string" ? record.id : "";
    const metadataName = typeof record.name === "string" ? record.name : "";
    const machineIdRaw = record.machine_id ?? record.machineId;
    const metadataMachineId = typeof machineIdRaw === "string" ? machineIdRaw : null;
    const rawMaxRPD = record.max_requests_per_day ?? record.maxRequestsPerDay;
    const rawMaxRPM = record.max_requests_per_minute ?? record.maxRequestsPerMinute;
    const rawThrottleDelayMs = record.throttle_delay_ms ?? record.throttleDelayMs;
    const rawMaxSessions = record.max_sessions ?? record.maxSessions;
    const metadata = {
        id: metadataId,
        name: metadataName,
        machineId: metadataMachineId,
        allowedModels: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAllowedModels"])(record.allowed_models ?? record.allowedModels),
        blockedModels: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAllowedModels"])(record.blocked_models ?? record.blockedModels),
        allowedCombos: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAllowedCombos"])(record.allowed_combos ?? record.allowedCombos),
        allowedConnections: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAllowedConnections"])(record.allowed_connections ?? record.allowedConnections),
        allowedQuotas: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAllowedQuotas"])(record.allowed_quotas ?? record.allowedQuotas),
        noLog: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseNoLog"])(record.no_log ?? record.noLog),
        autoResolve: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAutoResolve"])(record.auto_resolve ?? record.autoResolve),
        isActive: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseIsActive"])(record.is_active ?? record.isActive),
        accessSchedule: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAccessSchedule"])(record.access_schedule ?? record.accessSchedule),
        rateLimits: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseRateLimits"])(record.rate_limits ?? record.rateLimits),
        maxRequestsPerDay: typeof rawMaxRPD === "number" && rawMaxRPD > 0 ? rawMaxRPD : null,
        maxRequestsPerMinute: typeof rawMaxRPM === "number" && rawMaxRPM > 0 ? rawMaxRPM : null,
        throttleDelayMs: typeof rawThrottleDelayMs === "number" && rawThrottleDelayMs > 0 ? rawThrottleDelayMs : null,
        // T08: max concurrent sessions; 0 = unlimited (default & backward-compatible)
        maxSessions: typeof rawMaxSessions === "number" && rawMaxSessions > 0 ? rawMaxSessions : 0,
        revokedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseNullableTimestamp"])(record.revoked_at ?? record.revokedAt),
        expiresAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseNullableTimestamp"])(record.expires_at ?? record.expiresAt),
        ipAllowlist: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseStringList"])(record.ip_allowlist ?? record.ipAllowlist),
        scopes: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseStringList"])(record.scopes),
        isBanned: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseIsBanned"])(record.is_banned ?? record.isBanned),
        keyHash: record.key_hash ?? record.keyHash,
        proxyId: typeof record.proxy_id === "string" && record.proxy_id.trim() !== "" ? record.proxy_id : null,
        allowedEndpoints: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseStringList"])(record.allowed_endpoints ?? record.allowedEndpoints),
        streamDefaultMode: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseStreamDefaultMode"])(record.stream_default_mode ?? record.streamDefaultMode),
        disableNonPublicModels: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseDisableNonPublicModels"])(record.disable_non_public_models ?? record.disableNonPublicModels),
        allowUsageCommand: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAllowUsageCommand"])(record.allow_usage_command ?? record.allowUsageCommand),
        chaosModeEnabled: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$rowParsers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseChaosModeEnabled"])(record.chaos_mode_enabled ?? record.chaosModeEnabled),
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeyUsageLimitFields$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseApiKeyUsageLimitFields"])(record)
    };
    if (!metadata.id) {
        return null;
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$noLog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["setNoLog"])(metadata.id, metadata.noLog === true);
    // Cache the result
    evictIfNeeded(_keyMetadataCache);
    _keyMetadataCache.set(hashedKey, {
        value: metadata,
        timestamp: now
    });
    return metadata;
}
async function isModelAllowedForKey(key, modelId) {
    // If no key provided, allow (request may be using different auth method like JWT)
    // If no modelId provided, deny (invalid request)
    if (!key) return true;
    if (!modelId) return false;
    // Create cache key
    const cacheKey = `${key}:${modelId}`;
    const now = Date.now();
    const usesSettingDependentClaudeRouting = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$modelPermissions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isPotentialUnprefixedClaudeCodeModel"])(modelId);
    // Check permission cache
    const cached = _modelPermissionCache.get(cacheKey);
    if (!usesSettingDependentClaudeRouting && cached && now - cached.timestamp < CACHE_TTL) {
        return cached.allowed;
    }
    const metadata = await getApiKeyMetadata(key);
    // SECURITY: Key not found in database = deny access (invalid/non-existent key)
    if (!metadata) return false;
    const { allowedModels, blockedModels, disableNonPublicModels } = metadata;
    const modelPermissionCandidates = await getModelPermissionCandidates(modelId);
    // Deny-list patterns win over any allow-list entry. This lets operators keep
    // broad dynamic scopes like cc/* while excluding expensive families.
    if (blockedModels?.some((pattern)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$modelPermissions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["modelPatternMatches"])(pattern, modelPermissionCandidates))) {
        return false;
    }
    // Check disableNonPublicModels flag
    if (disableNonPublicModels) {
        const resolvedModelId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$modelDeprecation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveModelAlias"])(modelId);
        const effectiveModelId = resolvedModelId || modelId;
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$modelPermissions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["hasClaudeCodeWildcardPermission"])(allowedModels, modelPermissionCandidates)) {
            const lookupTarget = await getPublishedModelLookupTarget(effectiveModelId);
            const providerId = lookupTarget?.providerId || effectiveModelId.split("/")[0];
            const shortModelId = lookupTarget?.modelId || effectiveModelId.split("/").slice(1).join("/");
            if (!providerId || !shortModelId) return false;
            const syncedModelsByConnection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSyncedAvailableModelsByConnection"])(providerId);
            const customModels = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getCustomModels"])(providerId);
            // Combine synced and custom models
            const allDiscoveredModels = Object.values(syncedModelsByConnection).flat().concat(customModels);
            const discovered = allDiscoveredModels.some((m)=>m.id === shortModelId);
            if (!discovered) return false;
            const isPublic = !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelIsHidden"])(providerId, shortModelId);
            if (!isPublic) return false;
        }
    }
    // Support exact match and prefix match (e.g., "openai/*" allows all OpenAI models)
    let allowed = !allowedModels || allowedModels.length === 0 || allowedModels.some((pattern)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2f$modelPermissions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["modelPatternMatches"])(pattern, modelPermissionCandidates));
    // Extract model target and optional provider prefix if present (e.g. "openai/gpt-4" -> modelTarget: "gpt-4", provider: "openai")
    const hasProviderPrefix = modelId?.includes("/");
    const provider = hasProviderPrefix ? modelId.split("/")[0] : undefined;
    const modelTarget = hasProviderPrefix ? modelId.split("/").slice(1).join("/") : modelId || "";
    // If key belongs to groups, check both modelTarget and full modelId against group rules
    if (metadata.id) {
        const targetOk = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeyGroups$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["checkKeyModelAccess"])(metadata.id, modelTarget, provider).allowed;
        const fullOk = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeyGroups$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["checkKeyModelAccess"])(metadata.id, modelId || "", provider).allowed;
        if (!targetOk || !fullOk) allowed = false;
    }
    // Cache the result
    if (!usesSettingDependentClaudeRouting) {
        evictIfNeeded(_modelPermissionCache);
        _modelPermissionCache.set(cacheKey, {
            allowed,
            timestamp: now
        });
    }
    return allowed;
}
/**
 * Clear prepared statements cache (called on database reset/restore)
 * Prepared statements are bound to a specific database connection,
 * so they must be cleared when the connection is reset.
 */ function clearPreparedStatementCache() {
    _stmtGetAllKeys = null;
    _stmtGetKeyById = null;
    _stmtValidateKey = null;
    _stmtGetKeyMetadata = null;
    _stmtInsertKey = null;
    _stmtDeleteKey = null;
    _schemaChecked = false; // Also reset schema check for new connection
}
function clearApiKeyCaches() {
    invalidateCaches();
    _lastUsedUpdateCache.clear();
    _modelPermissionCache.clear();
}
function resetApiKeyState() {
    clearPreparedStatementCache();
    clearApiKeyCaches();
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$stateReset$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["registerDbStateResetter"])(resetApiKeyState);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/db/stats.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Database Statistics Module
 *
 * Provides functions to retrieve database statistics including size, table counts, and performance metrics.
 */ __turbopack_context__.s([
    "getDatabaseStats",
    ()=>getDatabaseStats
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
;
function getDatabaseStats(db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])()) {
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
"[project]/src/lib/db/vacuumScheduler.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/databaseSettings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$runtimeTimeouts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/runtimeTimeouts.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare(WRITE_KV_SQL).run(namespace, key, value);
}
function getKeyValue(namespace, key) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
        scheduledVacuum: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"].optimization.scheduledVacuum,
        vacuumHour: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"].optimization.vacuumHour
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
    const hour = normalizeVacuumHour(settings.vacuumHour, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"].optimization.vacuumHour);
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
    }, Math.min(delayMs, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$runtimeTimeouts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["MAX_TIMER_TIMEOUT_MS"]));
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
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
"[project]/src/lib/db/databaseSettings.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/databaseSettings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$stats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/stats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$vacuumScheduler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/vacuumScheduler.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
;
const DATABASE_SETTINGS_NAMESPACE = "databaseSettings";
const DATABASE_SETTINGS_SECTIONS = Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"]);
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
    return structuredClone(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"]);
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
    const fallback = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"].optimization.cacheSize;
    const numericCacheSize = Number(settings.optimization.cacheSize);
    settings.optimization.cacheSize = Number.isFinite(numericCacheSize) && numericCacheSize > 0 ? Math.min(1000000, Math.floor(numericCacheSize)) : fallback;
}
function readNamespace(namespace) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
    const defaultSection = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"][section];
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
        const defaultSection = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_DATABASE_SETTINGS"][section];
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
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SQLITE_FILE"]) return 0;
    try {
        const walPath = `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SQLITE_FILE"]}-wal`;
        return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(walPath) ? __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].statSync(walPath).size : 0;
    } catch  {
        return 0;
    }
}
function getSchemaVersion() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    try {
        const row = db.prepare("SELECT MAX(CAST(version AS INTEGER)) AS version FROM _omniroute_migrations").get();
        return row?.version ?? 0;
    } catch  {
        return 0;
    }
}
function getFreelistCount() {
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().pragma("freelist_count", {
            simple: true
        });
    } catch  {
        return 0;
    }
}
function getIntegrityCheck() {
    try {
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().pragma("quick_check", {
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
    const dbStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$stats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getDatabaseStats"])();
    const vacuumState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$vacuumScheduler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getState"])();
    return {
        ...getUserDatabaseSettings(),
        location: {
            databasePath: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SQLITE_FILE"] ?? ":memory:",
            dataDir: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DATA_DIR"],
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("settings");
    if (optimizationUpdated) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["applyDatabaseOptimizationSettings"])(nextSettings.optimization);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$vacuumScheduler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["refreshVacuumScheduler"])();
    }
    return nextSettings;
}
}),
"[project]/src/lib/db/detailedLogs.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getRequestDetailLogByCallLogId",
    ()=>getRequestDetailLogByCallLogId,
    "getRequestDetailLogById",
    ()=>getRequestDetailLogById,
    "getRequestDetailLogCount",
    ()=>getRequestDetailLogCount,
    "getRequestDetailLogs",
    ()=>getRequestDetailLogs,
    "isDetailedLoggingEnabled",
    ()=>isDetailedLoggingEnabled,
    "resetRequestDetailLogsTableExistsCache",
    ()=>resetRequestDetailLogsTableExistsCache,
    "saveRequestDetailLog",
    ()=>saveRequestDetailLog
]);
/**
 * Detailed Request Logs DB Layer (#378)
 *
 * Legacy compatibility layer for detailed request logs.
 * New requests now store pipeline details inside unified call log artifacts.
 * This module remains available for reading historical request_detail_logs rows.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist-node/v4.js [instrumentation] (ecmascript) <export default as v4>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$noLog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/compliance/noLog.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logPayloads.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamPayloadCollector$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/streamPayloadCollector.ts [instrumentation] (ecmascript)");
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
let requestDetailLogsTableExistsCache;
function requestDetailLogsTableExists() {
    if (requestDetailLogsTableExistsCache !== undefined) {
        return requestDetailLogsTableExistsCache;
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'request_detail_logs'").get();
    requestDetailLogsTableExistsCache = Boolean(row?.name);
    return requestDetailLogsTableExistsCache;
}
function resetRequestDetailLogsTableExistsCache() {
    requestDetailLogsTableExistsCache = undefined;
}
async function isDetailedLoggingEnabled() {
    const envOverride = process.env.ENABLE_REQUEST_LOGS;
    if (envOverride !== undefined) {
        return envOverride.trim().toLowerCase() === "true";
    }
    try {
        const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSettings"])();
        const val = settings.call_log_pipeline_enabled;
        return val === true || val === "1" || val === "true";
    } catch  {
        return false;
    }
}
function saveRequestDetailLog(entry) {
    const noLogEnabled = Boolean(entry.no_log) || (entry.api_key_id ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$noLog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isNoLog"])(entry.api_key_id) : false);
    if (noLogEnabled || !requestDetailLogsTableExists()) return;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const id = entry.id ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])();
    const timestamp = entry.timestamp ?? new Date().toISOString();
    const compactProviderResponse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamPayloadCollector$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["compactStructuredStreamPayload"])(entry.provider_response);
    const compactClientResponse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamPayloadCollector$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["compactStructuredStreamPayload"])(entry.client_response);
    db.prepare(`
    INSERT INTO request_detail_logs
      (id, call_log_id, timestamp, client_request, translated_request,
       provider_response, client_response, provider, model, source_format, target_format, duration_ms)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, entry.call_log_id ?? null, timestamp, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["serializePayloadForStorage"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(entry.client_request)), (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["serializePayloadForStorage"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(entry.translated_request)), (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["serializePayloadForStorage"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(compactProviderResponse)), (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["serializePayloadForStorage"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(compactClientResponse)), entry.provider ?? null, entry.model ?? null, entry.source_format ?? null, entry.target_format ?? null, entry.duration_ms ?? 0);
}
function getRequestDetailLogs(limit = 50, offset = 0) {
    if (!requestDetailLogsTableExists()) return [];
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare(`
      SELECT * FROM request_detail_logs
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);
    return rows.map(mapDetailedLogRow);
}
function getRequestDetailLogById(id) {
    if (!requestDetailLogsTableExists()) return null;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT * FROM request_detail_logs WHERE id = ?").get(id);
    return row ? mapDetailedLogRow(row) : null;
}
function getRequestDetailLogByCallLogId(callLogId) {
    if (!requestDetailLogsTableExists()) return null;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare(`
      SELECT * FROM request_detail_logs
      WHERE call_log_id = ?
      ORDER BY timestamp DESC
      LIMIT 1
    `).get(callLogId);
    return row ? mapDetailedLogRow(row) : null;
}
function getRequestDetailLogCount() {
    if (!requestDetailLogsTableExists()) return 0;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT COUNT(*) as cnt FROM request_detail_logs").get();
    return row?.cnt ?? 0;
}
function mapDetailedLogRow(row) {
    return {
        id: typeof row.id === "string" ? row.id : undefined,
        call_log_id: typeof row.call_log_id === "string" ? row.call_log_id : null,
        timestamp: typeof row.timestamp === "string" ? row.timestamp : undefined,
        client_request: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseStoredPayload"])(row.client_request),
        translated_request: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseStoredPayload"])(row.translated_request),
        provider_response: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseStoredPayload"])(row.provider_response),
        client_response: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseStoredPayload"])(row.client_response),
        provider: typeof row.provider === "string" ? row.provider : null,
        model: typeof row.model === "string" ? row.model : null,
        source_format: typeof row.source_format === "string" ? row.source_format : null,
        target_format: typeof row.target_format === "string" ? row.target_format : null,
        duration_ms: typeof row.duration_ms === "number" ? row.duration_ms : 0
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/db/contextHandoffs.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cleanupExpiredHandoffs",
    ()=>cleanupExpiredHandoffs,
    "clearSessionModelHistoryForCombo",
    ()=>clearSessionModelHistoryForCombo,
    "deleteHandoff",
    ()=>deleteHandoff,
    "deleteSessionModelHistory",
    ()=>deleteSessionModelHistory,
    "getHandoff",
    ()=>getHandoff,
    "getLastSessionModel",
    ()=>getLastSessionModel,
    "getSessionModelUsageCounts",
    ()=>getSessionModelUsageCounts,
    "hasActiveHandoff",
    ()=>hasActiveHandoff,
    "recordSessionModelUsage",
    ()=>recordSessionModelUsage,
    "upsertHandoff",
    ()=>upsertHandoff
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/caseMapping.ts [instrumentation] (ecmascript)");
;
const CLEANUP_THROTTLE_MS = 30 * 60 * 1000;
let lastCleanupAt = 0;
function parseJsonArray(value) {
    if (Array.isArray(value)) {
        return value.map((item)=>typeof item === "string" ? item : String(item)).filter(Boolean);
    }
    if (typeof value !== "string" || value.trim().length === 0) {
        return [];
    }
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.map((item)=>typeof item === "string" ? item : String(item)).filter(Boolean) : [];
    } catch  {
        return [];
    }
}
function toHandoffPayload(row) {
    const camel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["rowToCamel"])(row);
    if (!camel) return null;
    return {
        id: typeof camel.id === "string" ? camel.id : undefined,
        sessionId: typeof camel.sessionId === "string" ? camel.sessionId : "",
        comboName: typeof camel.comboName === "string" ? camel.comboName : "",
        fromAccount: typeof camel.fromAccount === "string" ? camel.fromAccount : "",
        summary: typeof camel.summary === "string" ? camel.summary : "",
        keyDecisions: parseJsonArray(camel.keyDecisions),
        taskProgress: typeof camel.taskProgress === "string" ? camel.taskProgress : "",
        activeEntities: parseJsonArray(camel.activeEntities),
        messageCount: Number.isFinite(Number(camel.messageCount)) ? Number(camel.messageCount) : 0,
        model: typeof camel.model === "string" ? camel.model : "",
        lastModel: typeof camel.lastModel === "string" ? camel.lastModel : undefined,
        warningThresholdPct: Number.isFinite(Number(camel.warningThresholdPct)) ? Number(camel.warningThresholdPct) : 0.85,
        generatedAt: typeof camel.generatedAt === "string" ? camel.generatedAt : "",
        expiresAt: typeof camel.expiresAt === "string" ? camel.expiresAt : "",
        createdAt: typeof camel.createdAt === "string" ? camel.createdAt : undefined
    };
}
function upsertHandoff(payload) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const createdAt = new Date().toISOString();
    db.prepare(`INSERT INTO context_handoffs
      (session_id, combo_name, from_account, summary, key_decisions,
       task_progress, active_entities, message_count, model, last_model,
       warning_threshold_pct, generated_at, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(session_id, combo_name) DO UPDATE SET
       from_account = excluded.from_account,
       summary = excluded.summary,
       key_decisions = excluded.key_decisions,
       task_progress = excluded.task_progress,
       active_entities = excluded.active_entities,
       message_count = excluded.message_count,
       model = excluded.model,
       last_model = excluded.last_model,
       warning_threshold_pct = excluded.warning_threshold_pct,
       generated_at = excluded.generated_at,
       expires_at = excluded.expires_at,
       created_at = excluded.created_at`).run(payload.sessionId, payload.comboName, payload.fromAccount, payload.summary, JSON.stringify(payload.keyDecisions || []), payload.taskProgress, JSON.stringify(payload.activeEntities || []), payload.messageCount, payload.model, payload.lastModel || null, payload.warningThresholdPct, payload.generatedAt, payload.expiresAt, createdAt);
}
function getHandoff(sessionId, comboName) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const now = new Date().toISOString();
    const row = db.prepare(`SELECT *
       FROM context_handoffs
       WHERE session_id = ? AND combo_name = ? AND expires_at > ?
       ORDER BY created_at DESC
       LIMIT 1`).get(sessionId, comboName, now);
    return toHandoffPayload(row);
}
function deleteHandoff(sessionId, comboName) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("DELETE FROM context_handoffs WHERE session_id = ? AND combo_name = ?").run(sessionId, comboName);
}
function cleanupExpiredHandoffs() {
    const nowMs = Date.now();
    if (nowMs - lastCleanupAt < CLEANUP_THROTTLE_MS) {
        return 0;
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const now = new Date(nowMs).toISOString();
    const result = db.prepare("DELETE FROM context_handoffs WHERE expires_at <= ?").run(now);
    lastCleanupAt = nowMs;
    return result.changes;
}
function hasActiveHandoff(sessionId, comboName) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const now = new Date().toISOString();
    const row = db.prepare(`SELECT 1
       FROM context_handoffs
       WHERE session_id = ? AND combo_name = ? AND expires_at > ?
       LIMIT 1`).get(sessionId, comboName, now);
    return !!row;
}
function recordSessionModelUsage(sessionId, comboName, modelStr, provider, connectionId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare(`INSERT INTO session_model_history
      (session_id, combo_name, model_str, provider, connection_id)
     VALUES (?, ?, ?, ?, ?)`).run(sessionId, comboName, modelStr, provider, connectionId || null);
}
function getLastSessionModel(sessionId, comboName) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare(`SELECT model_str
       FROM session_model_history
       WHERE session_id = ? AND combo_name = ?
       ORDER BY used_at DESC, id DESC
       LIMIT 1`).get(sessionId, comboName);
    return row?.model_str ?? null;
}
function clearSessionModelHistoryForCombo(comboName) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const result = db.prepare("DELETE FROM session_model_history WHERE combo_name = ?").run(comboName);
    return result.changes ?? 0;
}
function deleteSessionModelHistory(sessionId, comboName) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const result = db.prepare("DELETE FROM session_model_history WHERE session_id = ? AND combo_name = ?").run(sessionId, comboName);
    return result.changes ?? 0;
}
async function getSessionModelUsageCounts(connectionId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    let sql = `SELECT model_str, COUNT(*) as count 
             FROM session_model_history 
             WHERE 1=1`;
    const params = [];
    if (connectionId) {
        sql += ` AND connection_id = ?`;
        params.push(connectionId);
    }
    sql += ` GROUP BY model_str ORDER BY count ASC`;
    const rows = db.prepare(sql).all(...params);
    const usageMap = new Map();
    rows.forEach((row)=>{
        usageMap.set(row.model_str, row.count);
    });
    return usageMap;
}
}),
"[project]/src/lib/db/repositories/sqliteComboRepository.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createCombo",
    ()=>createCombo,
    "deleteCombo",
    ()=>deleteCombo,
    "getComboById",
    ()=>getComboById,
    "getComboByName",
    ()=>getComboByName,
    "getComboByNameInsensitive",
    ()=>getComboByNameInsensitive,
    "getCombos",
    ()=>getCombos,
    "getCombosCount",
    ()=>getCombosCount,
    "reorderCombos",
    ()=>reorderCombos,
    "sqliteComboRepository",
    ()=>sqliteComboRepository,
    "updateCombo",
    ()=>updateCombo
]);
/**
 * SQLite implementation of the combo repository contract.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist-node/v4.js [instrumentation] (ecmascript) <export default as v4>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/combos/steps.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$invariants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/combos/invariants.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
;
;
;
;
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function getSerializedData(value) {
    const row = asRecord(value);
    return typeof row.data === "string" ? row.data : null;
}
function getSortOrder(value) {
    const row = asRecord(value);
    return typeof row.sort_order === "number" ? row.sort_order : null;
}
function withSortOrder(payload, sortOrder) {
    const parsed = JSON.parse(payload);
    if (typeof sortOrder === "number") {
        parsed.sortOrder = sortOrder;
    }
    return parsed;
}
function getComboNameSet(db, extraNames = []) {
    const rows = db.prepare("SELECT name FROM combos").all();
    const names = new Set();
    for (const row of rows){
        const record = asRecord(row);
        if (typeof record.name === "string" && record.name.trim().length > 0) {
            names.add(record.name.trim());
        }
    }
    for (const name of extraNames){
        if (typeof name === "string" && name.trim().length > 0) {
            names.add(name.trim());
        }
    }
    return names;
}
function normalizeStoredCombo(combo, db, extraNames = []) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeComboRecord"])(combo, {
        allCombos: getComboNameSet(db, extraNames)
    });
}
function parseComboRow(row) {
    const payload = getSerializedData(row);
    if (!payload) return null;
    const parsed = withSortOrder(payload, getSortOrder(row));
    // Merge deduplicated column values back into the record
    const record = asRecord(row);
    if (record.context_cache_protection !== undefined && record.context_cache_protection !== null) {
        // Column is authoritative when explicitly enabled (1).
        // When column is 0 (unset default) preserve the JSON blob value
        // to avoid silently disabling the feature on pre-migration rows.
        if (record.context_cache_protection === 1) {
            parsed.context_cache_protection = true;
        }
    // Column is 0 — keep existing JSON blob value
    }
    return parsed;
}
function getNextSortOrder() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT COALESCE(MAX(sort_order), 0) AS sort_order FROM combos").get();
    const sortOrder = getSortOrder(row);
    return (sortOrder ?? 0) + 1;
}
async function getCombos(limit, offset) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    let sql = "SELECT data, sort_order, context_cache_protection FROM combos ORDER BY sort_order ASC, name COLLATE NOCASE ASC";
    const params = [];
    if (limit !== undefined) {
        sql += " LIMIT ? OFFSET ?";
        params.push(limit, offset ?? 0);
    }
    const rawCombos = db.prepare(sql).all(...params).map((row)=>parseComboRow(row)).filter((row)=>row !== null);
    const comboNames = rawCombos.map((combo)=>typeof combo.name === "string" ? combo.name.trim() : "").filter((name)=>name.length > 0);
    return rawCombos.map((combo)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeComboRecord"])(combo, {
            allCombos: comboNames
        }));
}
function getCombosCount() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT count(*) as cnt FROM combos").get();
    return row.cnt;
}
async function getComboById(id) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT data, sort_order, context_cache_protection FROM combos WHERE id = ?").get(id);
    const combo = parseComboRow(row);
    if (!combo) return null;
    return normalizeStoredCombo(combo, db, typeof combo.name === "string" ? [
        combo.name
    ] : []);
}
async function getComboByName(name) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT data, sort_order, context_cache_protection FROM combos WHERE name = ?").get(name);
    const combo = parseComboRow(row);
    if (!combo) return null;
    return normalizeStoredCombo(combo, db, [
        name
    ]);
}
async function getComboByNameInsensitive(name) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT data, sort_order, context_cache_protection FROM combos WHERE name = ? COLLATE NOCASE").get(name);
    const combo = parseComboRow(row);
    if (!combo) return null;
    const storedName = typeof combo.name === "string" ? combo.name : name;
    return normalizeStoredCombo(combo, db, [
        storedName
    ]);
}
async function createCombo(data) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const now = new Date().toISOString();
    const sortOrder = typeof data.sortOrder === "number" ? data.sortOrder : getNextSortOrder();
    const comboId = typeof data.id === "string" && data.id.trim().length > 0 ? data.id : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])();
    const combo = normalizeStoredCombo({
        ...data,
        id: comboId,
        name: data.name,
        models: data.models || [],
        strategy: data.strategy || "priority",
        config: data.config || {},
        isHidden: Boolean(data.isHidden),
        sortOrder,
        createdAt: now,
        updatedAt: now
    }, db, typeof data.name === "string" ? [
        data.name
    ] : []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$invariants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateComboInvariant"])(combo);
    const contextCache = data.context_cache_protection ? 1 : 0;
    db.prepare("INSERT INTO combos (id, name, data, sort_order, created_at, updated_at, context_cache_protection) VALUES (?, ?, ?, ?, ?, ?, ?)").run(combo.id, combo.name, JSON.stringify(combo), sortOrder, now, now, contextCache);
    return combo;
}
async function updateCombo(id, data) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const existing = db.prepare("SELECT data, sort_order, context_cache_protection FROM combos WHERE id = ?").get(id);
    if (!existing) return null;
    const current = parseComboRow(existing);
    if (!current) return null;
    const sortOrder = typeof data.sortOrder === "number" ? data.sortOrder : typeof current.sortOrder === "number" ? current.sortOrder : getNextSortOrder();
    const merged = {
        ...current,
        ...data,
        sortOrder,
        updatedAt: new Date().toISOString()
    };
    // Remove fields explicitly set to null (for deletion support)
    for (const key of Object.keys(data)){
        if (data[key] === null) {
            delete merged[key];
        }
    }
    const currentName = typeof current.name === "string" ? current.name : "";
    const nextName = typeof merged["name"] === "string" && merged["name"].trim().length > 0 ? merged["name"] : currentName;
    const normalizedMerged = normalizeStoredCombo({
        ...merged,
        name: nextName
    }, db, [
        nextName
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$invariants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateComboInvariant"])({
        ...normalizedMerged,
        ...data,
        name: nextName,
        models: normalizedMerged.models
    });
    const contextCacheProtection = normalizedMerged.context_cache_protection ? 1 : 0;
    db.prepare("UPDATE combos SET name = ?, data = ?, sort_order = ?, updated_at = ?, context_cache_protection = ? WHERE id = ?").run(nextName, JSON.stringify(normalizedMerged), sortOrder, normalizedMerged.updatedAt, contextCacheProtection, id);
    return {
        combo: normalizedMerged,
        previousName: currentName,
        currentName: nextName,
        modelsFieldProvided: data.models !== undefined
    };
}
async function reorderCombos(comboIds) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT id, name, data, sort_order FROM combos ORDER BY sort_order ASC, name COLLATE NOCASE ASC").all();
    if (rows.length === 0) return {
        combos: [],
        rowsReordered: 0
    };
    const existingIds = new Set(rows.map((row)=>{
        const record = asRecord(row);
        return typeof record.id === "string" ? record.id : null;
    }).filter((id)=>id !== null));
    const seen = new Set();
    const requestedIds = comboIds.filter((id)=>{
        if (!existingIds.has(id) || seen.has(id)) return false;
        seen.add(id);
        return true;
    });
    const orderedIds = [
        ...requestedIds,
        ...rows.map((row)=>{
            const record = asRecord(row);
            return typeof record.id === "string" ? record.id : null;
        }).filter((id)=>id !== null && !seen.has(id))
    ];
    const update = db.prepare("UPDATE combos SET data = ?, sort_order = ?, updated_at = ? WHERE id = ?");
    const now = new Date().toISOString();
    const rowById = new Map(rows.map((row)=>{
        const record = asRecord(row);
        return [
            String(record.id),
            row
        ];
    }));
    const comboNames = rows.map((row)=>{
        const combo = parseComboRow(row);
        return combo && typeof combo.name === "string" ? combo.name.trim() : "";
    }).filter((name)=>name.length > 0);
    const reorderTransaction = db.transaction(()=>{
        orderedIds.forEach((id, index)=>{
            const row = rowById.get(id);
            const combo = row ? parseComboRow(row) : null;
            if (!combo) return;
            const sortOrder = index + 1;
            const updatedCombo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeComboRecord"])({
                ...combo,
                sortOrder,
                updatedAt: now
            }, {
                allCombos: comboNames
            });
            update.run(JSON.stringify(updatedCombo), sortOrder, now, id);
        });
    });
    reorderTransaction();
    return {
        combos: await getCombos(),
        rowsReordered: orderedIds.length
    };
}
async function deleteCombo(id) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const result = db.prepare("DELETE FROM combos WHERE id = ?").run(id);
    if (result.changes === 0) return false;
    return true;
}
const sqliteComboRepository = {
    list: getCombos,
    count: async ()=>getCombosCount(),
    findById: getComboById,
    findByName: getComboByName,
    findByNameInsensitive: getComboByNameInsensitive,
    create: createCombo,
    update: updateCombo,
    reorder: reorderCombos,
    deleteById: deleteCombo
};
}),
"[project]/src/lib/db/repositories/sqliteModelComboMappingRepository.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createModelComboMapping",
    ()=>createModelComboMapping,
    "deleteModelComboMapping",
    ()=>deleteModelComboMapping,
    "getModelComboMappingById",
    ()=>getModelComboMappingById,
    "getModelComboMappings",
    ()=>getModelComboMappings,
    "resolveComboForModel",
    ()=>resolveComboForModel,
    "sqliteModelComboMappingRepository",
    ()=>sqliteModelComboMappingRepository,
    "updateModelComboMapping",
    ()=>updateModelComboMapping
]);
/**
 * SQLite implementation of per-model combo mapping persistence and resolution.
 *
 * Maps model name patterns (glob-style wildcards) to specific combos.
 * When a request arrives for a model string like "claude-sonnet-4",
 * the resolver checks all enabled mappings (highest priority first)
 * and returns the first matching combo.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist-node/v4.js [instrumentation] (ecmascript) <export default as v4>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$globPattern$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/globPattern.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
;
;
;
// ──────────────────────────────────────────────────────────
// Row mapping
// ──────────────────────────────────────────────────────────
function rowToMapping(row) {
    return {
        id: row.id,
        pattern: row.pattern,
        comboId: row.combo_id,
        comboName: row.combo_name || undefined,
        priority: row.priority,
        enabled: row.enabled === 1,
        description: row.description || "",
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}
async function getModelComboMappings(options) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const limit = options?.limit;
    const offset = options?.offset ?? 0;
    let sql = `SELECT m.id, m.pattern, m.combo_id, c.name AS combo_name,
            m.priority, m.enabled, m.description,
            m.created_at, m.updated_at
     FROM model_combo_mappings m
     LEFT JOIN combos c ON c.id = m.combo_id
     ORDER BY m.priority DESC, m.created_at ASC`;
    const params = [];
    if (limit !== undefined) {
        sql += " LIMIT ? OFFSET ?";
        params.push(limit, offset);
    }
    const rows = db.prepare(sql).all(...params);
    const totalRow = db.prepare("SELECT count(*) as cnt FROM model_combo_mappings").get();
    return {
        items: rows.map(rowToMapping),
        total: totalRow.cnt
    };
}
async function getModelComboMappingById(id) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare(`SELECT m.id, m.pattern, m.combo_id, c.name AS combo_name,
              m.priority, m.enabled, m.description,
              m.created_at, m.updated_at
       FROM model_combo_mappings m
       LEFT JOIN combos c ON c.id = m.combo_id
       WHERE m.id = ?`).get(id);
    return row ? rowToMapping(row) : null;
}
async function createModelComboMapping(data) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const now = new Date().toISOString();
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])();
    db.prepare(`INSERT INTO model_combo_mappings
     (id, pattern, combo_id, priority, enabled, description, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(id, data.pattern, data.comboId, data.priority ?? 0, data.enabled !== false ? 1 : 0, data.description || "", now, now);
    return {
        id,
        pattern: data.pattern,
        comboId: data.comboId,
        priority: data.priority ?? 0,
        enabled: data.enabled !== false,
        description: data.description || "",
        createdAt: now,
        updatedAt: now
    };
}
async function updateModelComboMapping(id, data) {
    const existing = await getModelComboMappingById(id);
    if (!existing) return null;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const now = new Date().toISOString();
    const updated = {
        pattern: data.pattern ?? existing.pattern,
        combo_id: data.comboId ?? existing.comboId,
        priority: data.priority ?? existing.priority,
        enabled: data.enabled !== undefined ? data.enabled ? 1 : 0 : existing.enabled ? 1 : 0,
        description: data.description ?? existing.description
    };
    db.prepare(`UPDATE model_combo_mappings
     SET pattern = ?, combo_id = ?, priority = ?, enabled = ?,
         description = ?, updated_at = ?
     WHERE id = ?`).run(updated.pattern, updated.combo_id, updated.priority, updated.enabled, updated.description, now, id);
    return getModelComboMappingById(id);
}
async function deleteModelComboMapping(id) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const result = db.prepare("DELETE FROM model_combo_mappings WHERE id = ?").run(id);
    return (result.changes ?? 0) > 0;
}
async function resolveComboForModel(modelStr) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    // Fetch enabled mappings, ordered by priority (highest first)
    const rows = db.prepare(`SELECT m.pattern, m.combo_id, c.data AS combo_data
       FROM model_combo_mappings m
       JOIN combos c ON c.id = m.combo_id
       WHERE m.enabled = 1
       ORDER BY m.priority DESC, m.created_at ASC`).all();
    for (const row of rows){
        const regex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$globPattern$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["globToRegex"])(row.pattern);
        if (regex.test(modelStr)) {
            try {
                const combo = JSON.parse(row.combo_data);
                if (combo.isActive === false) {
                    continue;
                }
                return combo;
            } catch  {
                continue;
            }
        }
    }
    return null;
}
const sqliteModelComboMappingRepository = {
    list: getModelComboMappings,
    findById: getModelComboMappingById,
    create: createModelComboMapping,
    update: updateModelComboMapping,
    deleteById: deleteModelComboMapping,
    resolveForModel: resolveComboForModel
};
}),
"[project]/src/lib/db/repositories/routingConfigRepositories.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "routingConfigRepositories",
    ()=>routingConfigRepositories
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$sqliteComboRepository$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/repositories/sqliteComboRepository.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$sqliteModelComboMappingRepository$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/repositories/sqliteModelComboMappingRepository.ts [instrumentation] (ecmascript)");
;
;
const routingConfigRepositories = {
    combos: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$sqliteComboRepository$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sqliteComboRepository"],
    modelComboMappings: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$sqliteModelComboMappingRepository$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sqliteModelComboMappingRepository"],
    legacySync: {
        getCombosCount: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$sqliteComboRepository$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCombosCount"]
    }
};
}),
"[project]/src/lib/db/combos.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Compatibility facade for combo persistence.
 *
 * Application code keeps the existing function-level API while persistence is
 * delegated through the domain repository contract. Cross-cutting write effects
 * remain here instead of becoming part of the portable repository surface.
 */ __turbopack_context__.s([
    "cleanupComboConnectionRefs",
    ()=>cleanupComboConnectionRefs,
    "createCombo",
    ()=>createCombo,
    "deleteCombo",
    ()=>deleteCombo,
    "deleteComboByName",
    ()=>deleteComboByName,
    "getComboById",
    ()=>getComboById,
    "getComboByName",
    ()=>getComboByName,
    "getComboByNameInsensitive",
    ()=>getComboByNameInsensitive,
    "getCombos",
    ()=>getCombos,
    "getCombosCount",
    ()=>getCombosCount,
    "reorderCombos",
    ()=>reorderCombos,
    "setActiveCombo",
    ()=>setActiveCombo,
    "updateCombo",
    ()=>updateCombo
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$contextHandoffs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/contextHandoffs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningRoutingRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/reasoningRoutingRules.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$routingConfigRepositories$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/repositories/routingConfigRepositories.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
const repository = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$routingConfigRepositories$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["routingConfigRepositories"].combos;
function getCombos(limit, offset) {
    return repository.list(limit, offset);
}
function getCombosCount() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$routingConfigRepositories$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["routingConfigRepositories"].legacySync.getCombosCount();
}
function getComboById(id) {
    return repository.findById(id);
}
function getComboByName(name) {
    return repository.findByName(name);
}
function getComboByNameInsensitive(name) {
    return repository.findByNameInsensitive(name);
}
async function createCombo(data) {
    const combo = await repository.create(data);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("combos");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return combo;
}
async function updateCombo(id, data) {
    const result = await repository.update(id, data);
    if (!result) return null;
    if (result.modelsFieldProvided) {
        const cleared = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$contextHandoffs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["clearSessionModelHistoryForCombo"])(result.previousName);
        if (cleared > 0 && result.currentName !== result.previousName) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$contextHandoffs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["clearSessionModelHistoryForCombo"])(result.currentName);
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("combos");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return result.combo;
}
async function reorderCombos(comboIds) {
    const result = await repository.reorder(comboIds);
    if (result.rowsReordered > 0) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("combos");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    }
    return result.combos;
}
async function deleteCombo(id) {
    const deleted = await repository.deleteById(id);
    if (!deleted) return false;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("combos");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningRoutingRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateReasoningRoutingRuleCache"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return true;
}
async function deleteComboByName(name) {
    const combo = await repository.findByName(name);
    if (!combo || typeof combo.id !== "string") return false;
    return deleteCombo(combo.id);
}
function setActiveCombo(name, db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])()) {
    db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('settings', 'activeCombo', ?)").run(JSON.stringify(name));
}
async function cleanupComboConnectionRefs(connectionId) {
    const combos = await getCombos();
    let touched = 0;
    for (const combo of combos){
        if (!Array.isArray(combo.models)) continue;
        let changed = false;
        const models = combo.models.map((step)=>{
            let out = step;
            if (out.connectionId === connectionId) {
                const { connectionId: _, ...rest } = out;
                out = rest;
                changed = true;
            }
            if (Array.isArray(out.allowedConnectionIds)) {
                const filtered = out.allowedConnectionIds.filter((id)=>id !== connectionId);
                if (filtered.length !== out.allowedConnectionIds.length) {
                    out = {
                        ...out,
                        allowedConnectionIds: filtered
                    };
                    changed = true;
                }
            }
            return out;
        });
        if (changed && typeof combo.id === "string") {
            try {
                const { id, ...rest } = combo;
                await updateCombo(combo.id, {
                    ...rest,
                    models
                });
                touched++;
            } catch  {
            // One combo failing should not block cleanup of the rest.
            }
        }
    }
    return touched;
}
}),
"[project]/src/lib/db/versionManager.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deleteVersionManagerTool",
    ()=>deleteVersionManagerTool,
    "getServiceRow",
    ()=>getServiceRow,
    "getVersionManagerStatus",
    ()=>getVersionManagerStatus,
    "getVersionManagerTool",
    ()=>getVersionManagerTool,
    "setToolStatus",
    ()=>setToolStatus,
    "updateServiceField",
    ()=>updateServiceField,
    "updateToolHealth",
    ()=>updateToolHealth,
    "updateToolVersion",
    ()=>updateToolVersion,
    "updateVersionManagerTool",
    ()=>updateVersionManagerTool,
    "upsertVersionManagerTool",
    ()=>upsertVersionManagerTool
]);
/** Version manager tool state persistence. */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
;
function toRecord(value) {
    return value && typeof value === "object" ? value : {};
}
function parseConfigOverrides(value) {
    if (!value || typeof value !== "string" || value.trim() === "") return null;
    try {
        const parsed = JSON.parse(value);
        return typeof parsed === "object" && parsed !== null ? parsed : null;
    } catch  {
        return null;
    }
}
function stringifyConfigOverrides(value) {
    if (value === null) return null;
    try {
        return JSON.stringify(value);
    } catch  {
        return null;
    }
}
function rowToVersionManager(row) {
    const record = toRecord(row);
    return {
        id: typeof record.id === "number" ? record.id : 0,
        tool: typeof record.tool === "string" ? record.tool : "",
        currentVersion: record.current_version === null ? null : typeof record.current_version === "string" ? record.current_version : null,
        installedVersion: record.installed_version === null ? null : typeof record.installed_version === "string" ? record.installed_version : null,
        pinnedVersion: record.pinned_version === null ? null : typeof record.pinned_version === "string" ? record.pinned_version : null,
        binaryPath: record.binary_path === null ? null : typeof record.binary_path === "string" ? record.binary_path : null,
        status: typeof record.status === "string" ? record.status : "not_installed",
        pid: record.pid === null ? null : typeof record.pid === "number" ? record.pid : null,
        port: typeof record.port === "number" ? record.port : 8317,
        apiKey: record.api_key === null ? null : typeof record.api_key === "string" ? record.api_key : null,
        managementKey: record.management_key === null ? null : typeof record.management_key === "string" ? record.management_key : null,
        autoUpdate: record.auto_update === 1 || record.auto_update === true || record.auto_update === "1",
        autoStart: record.auto_start === 1 || record.auto_start === true || record.auto_start === "1",
        autoRestartAdopted: record.auto_restart_adopted === 1 || record.auto_restart_adopted === true || record.auto_restart_adopted === "1",
        lastHealthCheck: record.last_health_check === null ? null : typeof record.last_health_check === "string" ? record.last_health_check : null,
        lastUpdateCheck: record.last_update_check === null ? null : typeof record.last_update_check === "string" ? record.last_update_check : null,
        healthStatus: typeof record.health_status === "string" ? record.health_status : "unknown",
        configOverrides: parseConfigOverrides(record.config_overrides),
        errorMessage: record.error_message === null ? null : typeof record.error_message === "string" ? record.error_message : null,
        createdAt: typeof record.created_at === "string" ? record.created_at : "",
        updatedAt: typeof record.updated_at === "string" ? record.updated_at : "",
        logsBufferPath: record.logs_buffer_path === null ? null : typeof record.logs_buffer_path === "string" ? record.logs_buffer_path : null,
        providerExpose: record.provider_expose === 1 || record.provider_expose === true || record.provider_expose === "1",
        lastSyncAt: record.last_sync_at === null ? null : typeof record.last_sync_at === "string" ? record.last_sync_at : null
    };
}
async function getVersionManagerStatus() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT * FROM version_manager").all();
    return rows.map(rowToVersionManager);
}
async function getVersionManagerTool(tool) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT * FROM version_manager WHERE tool = ?").get(tool);
    if (!row) return null;
    return rowToVersionManager(row);
}
async function upsertVersionManagerTool(data) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare(`
    INSERT INTO version_manager (
      tool, current_version, installed_version, pinned_version, binary_path,
      status, pid, port, api_key, management_key, auto_update, auto_start,
      health_status, config_overrides, error_message, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    ON CONFLICT(tool) DO UPDATE SET
      current_version = excluded.current_version,
      installed_version = excluded.installed_version,
      pinned_version = excluded.pinned_version,
      binary_path = excluded.binary_path,
      status = excluded.status,
      pid = excluded.pid,
      port = excluded.port,
      api_key = excluded.api_key,
      management_key = excluded.management_key,
      auto_update = excluded.auto_update,
      auto_start = excluded.auto_start,
      health_status = excluded.health_status,
      config_overrides = excluded.config_overrides,
      error_message = excluded.error_message,
      updated_at = datetime('now')
  `).run(data.tool, data.currentVersion ?? null, data.installedVersion ?? null, data.pinnedVersion ?? null, data.binaryPath ?? null, data.status ?? "not_installed", data.pid ?? null, data.port ?? 8317, data.apiKey ?? null, data.managementKey ?? null, data.autoUpdate !== undefined ? data.autoUpdate ? 1 : 0 : 1, data.autoStart !== undefined ? data.autoStart ? 1 : 0 : 0, data.healthStatus ?? "unknown", stringifyConfigOverrides(data.configOverrides ?? null), data.errorMessage ?? null);
    const result = await getVersionManagerTool(data.tool);
    if (!result) throw new Error("Failed to retrieve inserted version manager tool");
    return result;
}
async function updateVersionManagerTool(tool, updates) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const existing = await getVersionManagerTool(tool);
    if (!existing) return null;
    const ALLOWED_COLUMNS = new Set([
        "currentVersion",
        "installedVersion",
        "pinnedVersion",
        "binaryPath",
        "status",
        "pid",
        "port",
        "apiKey",
        "managementKey",
        "autoUpdate",
        "autoStart",
        "autoRestartAdopted",
        "healthStatus",
        "configOverrides",
        "errorMessage",
        "logsBufferPath",
        "providerExpose",
        "lastSyncAt"
    ]);
    const sets = [
        "updated_at = datetime('now')"
    ];
    const params = {
        tool
    };
    for (const [key, value] of Object.entries(updates)){
        if (!ALLOWED_COLUMNS.has(key)) continue;
        const dbKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        if (key === "configOverrides") {
            sets.push("config_overrides = @configOverrides");
            params.configOverrides = stringifyConfigOverrides(value);
        } else if (key === "autoUpdate" || key === "autoStart" || key === "autoRestartAdopted" || key === "providerExpose") {
            sets.push(`${dbKey} = @${key}`);
            params[key] = value === true ? 1 : 0;
        } else if (value === null) {
            sets.push(`${dbKey} = null`);
        } else {
            sets.push(`${dbKey} = @${key}`);
            params[key] = value;
        }
    }
    db.prepare(`UPDATE version_manager SET ${sets.join(", ")} WHERE tool = @tool`).run(params);
    return getVersionManagerTool(tool);
}
async function deleteVersionManagerTool(tool) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const result = db.prepare("DELETE FROM version_manager WHERE tool = ?").run(tool);
    return result.changes > 0;
}
async function updateToolHealth(tool, healthStatus) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const result = db.prepare("UPDATE version_manager SET health_status = ?, last_health_check = datetime('now') WHERE tool = ?").run(healthStatus, tool);
    return result.changes > 0;
}
async function updateToolVersion(tool, field, version) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const result = db.prepare(`UPDATE version_manager SET ${field} = ?, updated_at = datetime('now') WHERE tool = ?`).run(version, tool);
    return result.changes > 0;
}
async function setToolStatus(tool, status, pid, errorMessage) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const result = db.prepare(pid !== undefined ? "UPDATE version_manager SET status = ?, pid = ?, error_message = ?, updated_at = datetime('now') WHERE tool = ?" : "UPDATE version_manager SET status = ?, error_message = ?, updated_at = datetime('now') WHERE tool = ?").run(...pid !== undefined ? [
        status,
        pid,
        errorMessage ?? null,
        tool
    ] : [
        status,
        errorMessage ?? null,
        tool
    ]);
    return result.changes > 0;
}
async function getServiceRow(tool) {
    return getVersionManagerTool(tool);
}
const SERVICE_FIELD_WHITELIST = new Set([
    "logsBufferPath",
    "providerExpose",
    "lastSyncAt",
    "status",
    "pid",
    "port",
    "apiKey",
    "autoStart",
    "autoRestartAdopted",
    "autoUpdate",
    "healthStatus",
    "errorMessage",
    "currentVersion",
    "installedVersion",
    "binaryPath"
]);
async function updateServiceField(tool, field, value) {
    if (!SERVICE_FIELD_WHITELIST.has(field)) {
        throw new Error(`updateServiceField: field "${field}" is not in the allowed list`);
    }
    return updateVersionManagerTool(tool, {
        [field]: value
    });
}
}),
];

//# sourceMappingURL=src_lib_db_1n9hdsx._.js.map