module.exports = [
"[project]/src/lib/db/adapters/sqljsAdapter.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createSqlJsAdapter",
    ()=>createSqlJsAdapter
]);
// src/lib/db/adapters/sqljsAdapter.ts
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
;
;
const SAVE_DEBOUNCE_MS = 100;
const CHECKPOINT_INTERVAL_MS = 60_000;
let _sqlJsLib = null;
function resolveSqlJsWasmPath() {
    // The standalone assembler copies the complete sql.js package into
    // <bundle>/node_modules/sql.js. Every packaged server launcher sets cwd to that
    // bundle directory, so the JavaScript entrypoint and its sibling WASM share one
    // explicit runtime contract instead of relying on a require.resolve call that
    // webpack can rewrite. The second path retains direct-source compatibility.
    const candidatePaths = [
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(process.cwd(), "node_modules", "sql.js", "dist", "sql-wasm.wasm"),
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(process.cwd(), ".next", "standalone", "node_modules", "sql.js", "dist", "sql-wasm.wasm")
    ];
    for (const candidatePath of candidatePaths){
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(candidatePath)) {
            return candidatePath;
        }
    }
    throw new Error(`[sqljsAdapter] Packaged sql.js runtime is incomplete: sql-wasm.wasm was not found. Checked:\n${candidatePaths.join("\n")}`);
}
/**
 * better-sqlite3's named-parameter convention lets callers bind with the bare
 * property name (e.g. `{ isActive: 1 }` for a SQL placeholder written as
 * `@isActive`, `:isActive`, or `$isActive` — better-sqlite3 strips the sigil
 * internally). sql.js's own named-bind path (`sqlite3_bind_parameter_index`)
 * requires the FULL name INCLUDING the sigil, and silently no-ops (does not
 * throw) for a key it can't resolve. Expand each bare key to all three
 * sigil-prefixed variants so sql.js matches whichever sigil the SQL actually
 * used, while passing through any key the caller already prefixed unchanged.
 */ function withNamedParamPrefixes(obj) {
    const expanded = {};
    for (const [key, value] of Object.entries(obj)){
        if (/^[:@$]/.test(key)) {
            expanded[key] = value;
            continue;
        }
        expanded[`@${key}`] = value;
        expanded[`:${key}`] = value;
        expanded[`$${key}`] = value;
    }
    return expanded;
}
/**
 * sql.js's own `stmt.bind()` dispatches on shape: an Array means positional
 * bind (each element -> bind index N), a plain object means named-parameter
 * bind. Callers here always pass their rest-args as an array, so a caller
 * doing `.all({ isActive: 1 })` for a named placeholder (mirrors
 * better-sqlite3's spread-args named-bind convention, see
 * betterSqliteAdapter.ts) ends up handing sql.js `[{isActive:1}]` — an ARRAY
 * containing the object — which sql.js treats as a single positional value
 * and rejects with "Wrong API use : tried to bind a value of an unknown
 * type (...)." (#6802). Unwrap a lone plain-object param back to the object
 * itself (sigil-expanded) so sql.js takes its named-bind path instead.
 */ function toBindValue(params) {
    if (!params.length) return undefined;
    const [first] = params;
    const isLoneNamedParamsObject = params.length === 1 && first !== null && typeof first === "object" && !Array.isArray(first) && !Buffer.isBuffer(first) && !(first instanceof Uint8Array);
    return isLoneNamedParamsObject ? withNamedParamPrefixes(first) : params;
}
async function loadSqlJs() {
    if (_sqlJsLib) return _sqlJsLib;
    // Use a non-literal specifier so the bundler doesn't try to statically
    // resolve sql.js (and its package.json) during the build phase.
    // sql.js is an optional/fallback adapter — only needed at runtime when
    // better-sqlite3 and node:sqlite are both unavailable.
    const moduleName = "sql." + "js";
    const mod = await import(/* webpackIgnore: true */ moduleName);
    const initSqlJs = mod.default;
    const wasmPath = resolveSqlJsWasmPath();
    _sqlJsLib = await initSqlJs({
        locateFile (fileName) {
            if (fileName === "sql-wasm.wasm") {
                return wasmPath;
            }
            return fileName;
        }
    });
    return _sqlJsLib;
}
async function createSqlJsAdapter(filePath) {
    const SQLLib = await loadSqlJs();
    if (!SQLLib) throw new Error("[sqljsAdapter] Failed to load sql.js");
    const buf = filePath !== ":memory:" && __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(filePath) ? __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync(filePath) : null;
    const db = new SQLLib.Database(buf ? new Uint8Array(buf) : undefined);
    let dirty = false;
    let saveTimer = null;
    let _isOpen = true;
    function persist() {
        if (filePath === ":memory:") return;
        const data = db.export();
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].writeFileSync(filePath, Buffer.from(data));
        dirty = false;
    }
    function scheduleSave() {
        dirty = true;
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(()=>{
            saveTimer = null;
            if (dirty) {
                try {
                    persist();
                } catch (e) {
                    console.error("[sqljsAdapter] save failed:", e);
                }
            }
        }, SAVE_DEBOUNCE_MS);
    }
    function runSavepoint(fn, ...args) {
        const sp = `sp_${Math.random().toString(36).slice(2)}`;
        db.run(`SAVEPOINT "${sp}"`);
        try {
            const result = fn(...args);
            db.run(`RELEASE "${sp}"`);
            scheduleSave();
            return result;
        } catch (err) {
            try {
                db.run(`ROLLBACK TO "${sp}"`);
                db.run(`RELEASE "${sp}"`);
            } catch  {}
            throw err;
        }
    }
    function makeStatement(sql) {
        return {
            run (...params) {
                const stmt = db.prepare(sql);
                try {
                    const bindValue = toBindValue(params);
                    if (bindValue !== undefined) stmt.bind(bindValue);
                    stmt.step();
                    const changes = db.getRowsModified();
                    const lastRows = db.exec("SELECT last_insert_rowid() as id");
                    const lastInsertRowid = lastRows[0]?.values?.[0]?.[0] ?? 0;
                    scheduleSave();
                    return {
                        changes,
                        lastInsertRowid
                    };
                } finally{
                    stmt.free();
                }
            },
            get (...params) {
                const stmt = db.prepare(sql);
                try {
                    const bindValue = toBindValue(params);
                    if (bindValue !== undefined) stmt.bind(bindValue);
                    if (stmt.step()) return stmt.getAsObject();
                    return undefined;
                } finally{
                    stmt.free();
                }
            },
            all (...params) {
                const stmt = db.prepare(sql);
                try {
                    const bindValue = toBindValue(params);
                    if (bindValue !== undefined) stmt.bind(bindValue);
                    const rows = [];
                    while(stmt.step())rows.push(stmt.getAsObject());
                    return rows;
                } finally{
                    stmt.free();
                }
            }
        };
    }
    const checkpointTimer = setInterval(()=>{
        if (dirty) try {
            persist();
        } catch  {}
    }, CHECKPOINT_INTERVAL_MS);
    checkpointTimer.unref?.();
    const flush = ()=>{
        if (dirty) try {
            persist();
        } catch  {}
    };
    process.on("beforeExit", flush);
    process.on("SIGINT", flush);
    process.on("SIGTERM", flush);
    function gracefulClose() {
        clearInterval(checkpointTimer);
        if (saveTimer) clearTimeout(saveTimer);
        if (dirty) try {
            persist();
        } catch  {}
        try {
            db.close();
        } catch  {}
        _isOpen = false;
        // Without this, a closed adapter's whole closure (raw sql.js Database +
        // buffers) stays pinned in memory forever by these 3 process-level
        // listeners, compounding the OOM every failed boot leaves behind (#7494).
        process.removeListener("beforeExit", flush);
        process.removeListener("SIGINT", flush);
        process.removeListener("SIGTERM", flush);
    }
    return {
        driver: "sql.js",
        get open () {
            return _isOpen;
        },
        get name () {
            return filePath;
        },
        prepare (sql) {
            return makeStatement(sql);
        },
        exec (sql) {
            db.run(sql);
            scheduleSave();
        },
        pragma (pragmaStr, options) {
            const result = db.exec(`PRAGMA ${pragmaStr}`);
            if (!result.length) return null;
            const rows = result[0];
            if (options?.simple) {
                return rows.values?.[0]?.[0] ?? null;
            }
            return (rows.values ?? []).map((row)=>Object.fromEntries(rows.columns.map((col, i)=>[
                        col,
                        row[i]
                    ])));
        },
        transaction (fn) {
            return (...args)=>runSavepoint(fn, ...args);
        },
        immediate (fn) {
            runSavepoint(()=>fn());
        },
        async backup (destination) {
            if (dirty) persist();
            if (filePath !== ":memory:") __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].copyFileSync(filePath, destination);
        },
        checkpoint (_mode = "TRUNCATE") {
            if (dirty) try {
                persist();
            } catch  {}
        },
        close () {
            gracefulClose();
        },
        get raw () {
            return db;
        }
    };
}
}),
];

//# sourceMappingURL=src_lib_db_adapters_sqljsAdapter_ts_1gmlr1t._.js.map