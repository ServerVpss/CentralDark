module.exports = [
"[project]/open-sse/mcp-server/schemas/audit.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * MCP/A2A Audit Types — Interfaces for audit log entries.
 *
 * These types define the format of audit log entries stored in the
 * `mcp_tool_audit` and `a2a_task_events` tables.
 *
 * Security: Input data is never stored in clear text. Only SHA-256 hashes
 * of input and truncated output summaries are persisted.
 */ // ============ MCP Audit Entry ============
__turbopack_context__.s([
    "hashInput",
    ()=>hashInput,
    "summarizeOutput",
    ()=>summarizeOutput
]);
async function hashInput(input) {
    const data = JSON.stringify(input);
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b)=>b.toString(16).padStart(2, "0")).join("");
}
function summarizeOutput(output, maxLength = 200) {
    if (output === null || output === undefined) return "(null)";
    const str = typeof output === "string" ? output : JSON.stringify(output);
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + "…";
}
}),
"[project]/open-sse/mcp-server/audit.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__setBetterSqliteLoaderForTests",
    ()=>__setBetterSqliteLoaderForTests,
    "closeAuditDb",
    ()=>closeAuditDb,
    "getAuditStats",
    ()=>getAuditStats,
    "getRecentAuditEntries",
    ()=>getRecentAuditEntries,
    "logToolCall",
    ()=>logToolCall,
    "queryAuditEntries",
    ()=>queryAuditEntries
]);
/**
 * MCP Audit Logger — Records all MCP tool invocations for security and observability.
 *
 * Logs are written to the `mcp_tool_audit` SQLite table.
 * Input data is hashed (SHA-256) to avoid storing sensitive prompts.
 * Output is truncated to 200 chars for summary.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/schemas/audit.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
const __TURBOPACK__import$2e$meta__ = {
    get url () {
        return `file://${__turbopack_context__.P("open-sse/mcp-server/audit.ts")}`;
    },
    get turbopackHot () {
        return __turbopack_context__.m.hot;
    }
};
;
;
/**
 * node:sqlite's `DatabaseSync` does NOT expose a boolean `open` property —
 * `open` and `close` are methods on the prototype, and the only state
 * surface is the `isOpen` getter. Track open state locally in a closure
 * so the adapter's `AuditDatabase` contract (`open?: boolean`) is honored
 * and `getCachedAuditDb()`'s truthy check doesn't return a closed handle
 * after `closeAuditDb()`.
 */ function createNodeSqliteAuditAdapter(db) {
    let _isOpen = true;
    return {
        driver: "node:sqlite",
        get open () {
            return _isOpen;
        },
        prepare (sql) {
            const stmt = db.prepare(sql);
            return {
                get: (...params)=>stmt.get(...params),
                all: (...params)=>stmt.all(...params),
                run: (...params)=>stmt.run(...params)
            };
        },
        pragma (pragmaSql) {
            // node:sqlite has no .pragma() helper — route through .exec() for
            // statement-shaped PRAGMAs (e.g. "wal_checkpoint(TRUNCATE)").
            try {
                db.exec(`PRAGMA ${pragmaSql}`);
                return null;
            } catch (err) {
                return err instanceof Error ? err.message : String(err);
            }
        },
        close: ()=>{
            if (!_isOpen) return;
            try {
                db.close();
            } finally{
                _isOpen = false;
            }
        }
    };
}
function toNullableString(value) {
    return typeof value === "string" ? value : null;
}
function toBoolean(value, fallback = false) {
    if (typeof value === "boolean") return value;
    if (value === 1 || value === "1") return true;
    if (value === 0 || value === "0") return false;
    return fallback;
}
function toPositiveInt(value, fallback) {
    const parsed = toNumber(value, fallback);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(0, Math.floor(parsed));
}
function mapAuditEntry(row) {
    return {
        id: toPositiveInt(row.id, 0),
        toolName: toString(row.tool_name),
        inputHash: toString(row.input_hash),
        outputSummary: toString(row.output_summary),
        durationMs: toNumber(row.duration_ms, 0),
        apiKeyId: toNullableString(row.api_key_id),
        success: toBoolean(row.success, false),
        errorCode: toNullableString(row.error_code),
        createdAt: toString(row.created_at)
    };
}
function buildAuditFilterSql(filters) {
    const clauses = [];
    const params = [];
    if (typeof filters.tool === "string" && filters.tool.trim().length > 0) {
        clauses.push("tool_name = ?");
        params.push(filters.tool.trim());
    }
    if (typeof filters.success === "boolean") {
        clauses.push("success = ?");
        params.push(filters.success ? 1 : 0);
    }
    if (typeof filters.apiKeyId === "string" && filters.apiKeyId.trim().length > 0) {
        clauses.push("api_key_id = ?");
        params.push(filters.apiKeyId.trim());
    }
    return {
        whereSql: clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "",
        params
    };
}
function getCachedAuditDb() {
    return globalThis.__omnirouteMcpAuditDb ?? null;
}
function setCachedAuditDb(database) {
    globalThis.__omnirouteMcpAuditDb = database;
}
function toNumber(value, fallback = 0) {
    const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim().length > 0 ? Number(value) : Number.NaN;
    return Number.isFinite(parsed) ? parsed : fallback;
}
function toString(value) {
    return typeof value === "string" ? value : "";
}
/**
 * Test-only seam: the production load path uses `createRequire()` (so the
 * Electron/global-install resolution works — #8959), which `vi.doMock` cannot
 * intercept (it only patches Vitest's ESM module graph). Tests inject a
 * throwing/mocked loader here to exercise the node:sqlite fallback.
 */ let betterSqliteLoaderForTests = null;
function __setBetterSqliteLoaderForTests(loader) {
    betterSqliteLoaderForTests = loader;
}
async function openBetterSqliteAuditDb(dbPath) {
    let mod;
    if (betterSqliteLoaderForTests) {
        mod = betterSqliteLoaderForTests();
    } else {
        const { createRequire } = await __turbopack_context__.A("[externals]/node:module [external] (node:module, cjs, async loader)");
        const _require = createRequire(__TURBOPACK__import$2e$meta__.url);
        mod = __turbopack_context__.r("[externals]/better-sqlite3 [external] (better-sqlite3, cjs, [project]/node_modules/better-sqlite3)");
    }
    const Database = mod?.default || mod;
    return new Database(dbPath);
}
function nodeSqliteFallbackAvailable() {
    const [maj, min] = (process.versions.node ?? "0.0").split(".").map(Number);
    return maj > 22 || maj === 22 && (min ?? 0) >= 5;
}
async function openNodeSqliteAuditDb(dbPath) {
    const { DatabaseSync } = await Promise.resolve().then(()=>__turbopack_context__.x("node:sqlite", ()=>require("node:sqlite"), true));
    return createNodeSqliteAuditAdapter(new DatabaseSync(dbPath));
}
async function openFallbackAuditDb(dbPath, nativeMessage) {
    if (!nodeSqliteFallbackAvailable()) {
        console.error(`[MCP Audit] better-sqlite3 native binding unavailable and Node ${process.version} ` + "has no built-in sqlite. Audit logging disabled. Fix: run " + "`npm rebuild better-sqlite3` in the omniroute install root.");
        return null;
    }
    try {
        const adapter = await openNodeSqliteAuditDb(dbPath);
        console.warn(`[MCP Audit] better-sqlite3 binding unavailable — fell back to node:sqlite ` + `(${nativeMessage.split("\n")[0]})`);
        return adapter;
    } catch (nodeErr) {
        const nodeMessage = nodeErr instanceof Error ? nodeErr.message : String(nodeErr);
        console.error("[MCP Audit] Failed to connect to database:", nodeMessage);
        return null;
    }
}
/**
 * Lazy-load the database connection.
 * Uses the same SQLite database as the main OmniRoute app.
 *
 * Driver priority:
 *   1. better-sqlite3 — fast native binding (when its compiled `.node`
 *      binary is present, see scripts/build/postinstall.mjs).
 *   2. node:sqlite    — built-in to Node 22.5+. Used as a transparent
 *      fallback so the MCP audit logger still works on installs where
 *      the better-sqlite3 binary failed to resolve (e.g. missing
 *      `dist/node_modules/better-sqlite3/build/Release/better_sqlite3.node`
 *      in some global-install / Docker scenarios).
 */ async function getDb() {
    const cachedDb = getCachedAuditDb();
    if (cachedDb) return cachedDb;
    try {
        // Try importing the db module from the main app
        const { homedir } = await __turbopack_context__.A("[externals]/node:os [external] (node:os, cjs, async loader)");
        const { join } = await __turbopack_context__.A("[externals]/node:path [external] (node:path, cjs, async loader)");
        const { existsSync } = await __turbopack_context__.A("[externals]/node:fs [external] (node:fs, cjs, async loader)");
        const dbPath = process.env.DATA_DIR ? join(process.env.DATA_DIR, "storage.sqlite") : join(homedir(), ".omniroute", "storage.sqlite");
        if (!existsSync(dbPath)) {
            console.error(`[MCP Audit] Database not found at ${dbPath} — audit logging disabled`);
            return null;
        }
        try {
            const database = await openBetterSqliteAuditDb(dbPath);
            setCachedAuditDb(database);
            return database;
        } catch (nativeErr) {
            const nativeMessage = nativeErr instanceof Error ? nativeErr.message : String(nativeErr);
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isNativeSqliteLoadError"])(nativeErr)) {
                console.error("[MCP Audit] Failed to connect to database:", nativeMessage);
                return null;
            }
            const fallbackDb = await openFallbackAuditDb(dbPath, nativeMessage);
            setCachedAuditDb(fallbackDb);
            return fallbackDb;
        }
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[MCP Audit] Failed to connect to database:", message);
        return null;
    }
}
function closeAuditDb() {
    const database = getCachedAuditDb();
    if (!database) return false;
    setCachedAuditDb(null);
    try {
        try {
            if (database.open !== false) {
                database.pragma("wal_checkpoint(TRUNCATE)");
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.warn("[MCP Audit] WAL checkpoint failed during close:", message);
        }
    } finally{
        try {
            database.close();
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.warn("[MCP Audit] Failed to close database:", message);
        }
    }
    return true;
}
async function logToolCall(toolName, input, output, durationMs, success, errorCode) {
    try {
        const database = await getDb();
        if (!database) return; // Audit disabled if no DB
        const inputHash = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hashInput"])(input);
        const outputSummary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["summarizeOutput"])(output);
        const apiKeyId = process.env.OMNIROUTE_API_KEY_ID || null;
        database.prepare(`INSERT INTO mcp_tool_audit (tool_name, input_hash, output_summary, duration_ms, api_key_id, success, error_code)
         VALUES (?, ?, ?, ?, ?, ?, ?)`).run(toolName, inputHash, outputSummary, durationMs, apiKeyId, success ? 1 : 0, errorCode || null);
    } catch (err) {
        // Never let audit failure break tool execution
        const message = err instanceof Error ? err.message : String(err);
        console.error("[MCP Audit] Failed to log:", message);
    }
}
async function queryAuditEntries(filters = {}) {
    try {
        const database = await getDb();
        const limit = Math.max(1, Math.min(500, toPositiveInt(filters.limit, 50)));
        const offset = Math.max(0, toPositiveInt(filters.offset, 0));
        if (!database) return {
            entries: [],
            total: 0,
            limit,
            offset
        };
        const { whereSql, params } = buildAuditFilterSql(filters);
        const totalRow = database.prepare(`SELECT COUNT(*) as total FROM mcp_tool_audit ${whereSql}`).get(...params);
        const rows = database.prepare(`SELECT
           id,
           tool_name,
           input_hash,
           output_summary,
           duration_ms,
           api_key_id,
           success,
           error_code,
           created_at
         FROM mcp_tool_audit
         ${whereSql}
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`).all(...params, limit, offset);
        return {
            entries: rows.map(mapAuditEntry),
            total: toPositiveInt(totalRow?.total, 0),
            limit,
            offset
        };
    } catch  {
        return {
            entries: [],
            total: 0,
            limit: 50,
            offset: 0
        };
    }
}
async function getRecentAuditEntries(limit = 50) {
    const result = await queryAuditEntries({
        limit,
        offset: 0
    });
    return result.entries;
}
async function getAuditStats() {
    try {
        const database = await getDb();
        if (!database) return {
            totalCalls: 0,
            successRate: 0,
            avgDurationMs: 0,
            topTools: []
        };
        const stats = database.prepare(`SELECT 
           COUNT(*) as total,
           AVG(CASE WHEN success = 1 THEN 1.0 ELSE 0.0 END) as successRate,
           AVG(duration_ms) as avgDuration
         FROM mcp_tool_audit
         WHERE created_at > datetime('now', '-24 hours')`).get();
        const topTools = database.prepare(`SELECT tool_name as tool, COUNT(*) as count
         FROM mcp_tool_audit
         WHERE created_at > datetime('now', '-24 hours')
         GROUP BY tool_name
         ORDER BY count DESC
         LIMIT 10`).all();
        return {
            totalCalls: toNumber(stats?.total, 0),
            successRate: toNumber(stats?.successRate, 0),
            avgDurationMs: toNumber(stats?.avgDuration, 0),
            topTools: (topTools || []).map((entry)=>({
                    tool: toString(entry.tool),
                    count: toNumber(entry.count, 0)
                }))
        };
    } catch  {
        return {
            totalCalls: 0,
            successRate: 0,
            avgDurationMs: 0,
            topTools: []
        };
    }
}
}),
"[project]/open-sse/mcp-server/runtimeHeartbeat.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isMcpHeartbeatOnline",
    ()=>isMcpHeartbeatOnline,
    "isProcessAlive",
    ()=>isProcessAlive,
    "readMcpHeartbeat",
    ()=>readMcpHeartbeat,
    "resolveMcpHeartbeatPath",
    ()=>resolveMcpHeartbeatPath,
    "startMcpHeartbeat",
    ()=>startMcpHeartbeat
]);
/**
 * MCP Runtime Heartbeat
 *
 * Persists MCP stdio process liveness into DATA_DIR/runtime/mcp-heartbeat.json
 * so dashboard APIs can report real online/offline state.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
;
;
;
const HEARTBEAT_FILE = "mcp-heartbeat.json";
const RUNTIME_DIR = "runtime";
const DEFAULT_INTERVAL_MS = 5000;
function resolveDataDir() {
    const configured = process.env.DATA_DIR;
    if (typeof configured === "string" && configured.trim().length > 0) {
        return configured.trim();
    }
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["homedir"])(), ".omniroute");
}
function resolveMcpHeartbeatPath() {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(resolveDataDir(), RUNTIME_DIR, HEARTBEAT_FILE);
}
async function writeHeartbeat(snapshot) {
    const heartbeatPath = resolveMcpHeartbeatPath();
    const runtimeDir = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(resolveDataDir(), RUNTIME_DIR);
    await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["promises"].mkdir(runtimeDir, {
        recursive: true
    });
    await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["promises"].writeFile(heartbeatPath, JSON.stringify(snapshot, null, 2), "utf-8");
}
function startMcpHeartbeat(config) {
    const startedAt = new Date().toISOString();
    let timer = null;
    let stopped = false;
    const intervalMs = typeof config.intervalMs === "number" && config.intervalMs > 0 ? config.intervalMs : DEFAULT_INTERVAL_MS;
    const tick = async ()=>{
        if (stopped) return;
        const snapshot = {
            pid: process.pid,
            startedAt,
            lastHeartbeatAt: new Date().toISOString(),
            version: config.version,
            transport: "stdio",
            scopesEnforced: config.scopesEnforced,
            allowedScopes: [
                ...config.allowedScopes
            ],
            toolCount: config.toolCount
        };
        try {
            await writeHeartbeat(snapshot);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error("[MCP Heartbeat] Failed to write heartbeat:", message);
        }
    };
    void tick();
    timer = setInterval(()=>{
        void tick();
    }, intervalMs);
    if (typeof timer === "object" && "unref" in timer) timer.unref?.();
    return ()=>{
        if (stopped) return;
        stopped = true;
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        // Keep last snapshot on disk for post-mortem/offline reporting.
        void tick();
    };
}
async function readMcpHeartbeat() {
    const heartbeatPath = resolveMcpHeartbeatPath();
    try {
        const raw = await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["promises"].readFile(heartbeatPath, "utf-8");
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return null;
        if (typeof parsed.pid !== "number" || typeof parsed.startedAt !== "string" || typeof parsed.lastHeartbeatAt !== "string" || typeof parsed.version !== "string" || parsed.transport !== "stdio" || typeof parsed.scopesEnforced !== "boolean" || !Array.isArray(parsed.allowedScopes) || typeof parsed.toolCount !== "number") {
            return null;
        }
        const allowedScopes = parsed.allowedScopes.filter((scope)=>{
            return typeof scope === "string";
        });
        return {
            pid: parsed.pid,
            startedAt: parsed.startedAt,
            lastHeartbeatAt: parsed.lastHeartbeatAt,
            version: parsed.version,
            transport: "stdio",
            scopesEnforced: parsed.scopesEnforced,
            allowedScopes,
            toolCount: parsed.toolCount
        };
    } catch  {
        return null;
    }
}
function isProcessAlive(pid) {
    if (!Number.isFinite(pid) || pid <= 0) return false;
    try {
        process.kill(pid, 0);
        return true;
    } catch  {
        return false;
    }
}
function isMcpHeartbeatOnline(snapshot, options) {
    if (!snapshot) return false;
    const staleAfterMs = typeof options?.staleAfterMs === "number" && options.staleAfterMs > 0 ? options.staleAfterMs : DEFAULT_INTERVAL_MS * 3;
    const elapsed = Date.now() - new Date(snapshot.lastHeartbeatAt).getTime();
    if (!Number.isFinite(elapsed) || elapsed > staleAfterMs) return false;
    if (options?.requireLivePid === false) return true;
    return isProcessAlive(snapshot.pid);
}
}),
"[project]/open-sse/mcp-server/schemas/toolSearch.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "toolSearchInput",
    ()=>toolSearchInput,
    "toolSearchOutput",
    ()=>toolSearchOutput,
    "toolSearchTool",
    ()=>toolSearchTool
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const toolSearchInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    query: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).describe("Natural-language or keyword query over tool names/descriptions"),
    limit: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(1).max(25).optional().describe("Max results (default 8)")
}).describe("Search available MCP tools by keyword");
const toolSearchOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    query: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    count: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
    tools: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        description: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        scopes: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()),
        signature: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()
    }))
});
const toolSearchTool = {
    name: "omniroute_tool_search",
    description: "Search the available MCP tools by keyword and return the most relevant ones as compact one-line TypeScript signatures (token-efficient discovery instead of loading every tool schema).",
    inputSchema: toolSearchInput,
    outputSchema: toolSearchOutput,
    scopes: [
        "read:tools"
    ],
    auditLevel: "basic",
    phase: 1,
    sourceEndpoints: []
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/mcp-server/schemas/pickFastestModel.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "pickFastestModelInput",
    ()=>pickFastestModelInput,
    "pickFastestModelOutput",
    ()=>pickFastestModelOutput,
    "pickFastestModelTool",
    ()=>pickFastestModelTool
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const pickFastestModelInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    comboId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().describe("Optional combo id or name to scope the ranking to. Omit to rank across all enabled combos."),
    includeUnhealthy: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional().describe("When true, OPEN-circuit candidates are scored (sorted to the bottom) instead of filtered out."),
    weights: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        ttft: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0).optional(),
        tps: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0).optional(),
        e2e: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0).optional(),
        p95: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0).optional(),
        health: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0).optional(),
        reliability: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0).optional(),
        stability: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0).optional()
    }).partial().optional().describe("Optional speed-ranking weight overrides merged onto the defaults."),
    applyToCombo: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional().describe("When true + comboId present, switches the combo to auto/latency routing."),
    limit: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(1).max(50).optional().describe("Ranked result limit.")
});
const pickFastestModelOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    fastest: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        model: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        score: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        reason: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()
    }).nullable(),
    ranked: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        model: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        score: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        factors: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            ttft: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
            tps: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
            e2e: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
            p95: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
            health: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
            reliability: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
            stability: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
        }),
        metrics: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            avgTtftMs: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().nullable(),
            avgTokensPerSecond: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().nullable(),
            avgE2ELatencyMs: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().nullable(),
            p95LatencyMs: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().nullable(),
            latencyStdDev: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().nullable(),
            failureRate: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
            circuitBreakerState: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
                "CLOSED",
                "OPEN",
                "HALF_OPEN"
            ])
        }),
        reason: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()
    })),
    weights: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        ttft: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        tps: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        e2e: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        p95: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        health: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        reliability: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        stability: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
    }),
    comboScope: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()
    }).nullable(),
    appliedToCombo: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        strategy: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        autoRoutingStrategy: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()
    }).nullable()
});
const pickFastestModelTool = {
    name: "omniroute_pick_fastest_model",
    description: "Picks the fastest reliable provider-model pair from live telemetry and can apply latency routing to a combo.",
    inputSchema: pickFastestModelInput,
    outputSchema: pickFastestModelOutput,
    scopes: [
        "read:combos",
        "read:health",
        "read:usage"
    ],
    auditLevel: "basic",
    phase: 2,
    sourceEndpoints: [
        "/api/combos",
        "/api/monitoring/health",
        "/api/usage/quota",
        "/api/usage/analytics"
    ]
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/mcp-server/schemas/ccrTools.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "CCR_MCP_TOOLS",
    ()=>CCR_MCP_TOOLS,
    "ccrDeleteInput",
    ()=>ccrDeleteInput,
    "ccrDeleteOutput",
    ()=>ccrDeleteOutput,
    "ccrDeleteTool",
    ()=>ccrDeleteTool,
    "ccrEntryMetadataOutput",
    ()=>ccrEntryMetadataOutput,
    "ccrInspectInput",
    ()=>ccrInspectInput,
    "ccrInspectOutput",
    ()=>ccrInspectOutput,
    "ccrInspectTool",
    ()=>ccrInspectTool,
    "ccrListInput",
    ()=>ccrListInput,
    "ccrListOutput",
    ()=>ccrListOutput,
    "ccrListTool",
    ()=>ccrListTool,
    "ccrReferenceOutput",
    ()=>ccrReferenceOutput,
    "ccrRetrieveInput",
    ()=>ccrRetrieveInput,
    "ccrRetrieveOutput",
    ()=>ccrRetrieveOutput,
    "ccrRetrieveTool",
    ()=>ccrRetrieveTool,
    "ccrStatsInput",
    ()=>ccrStatsInput,
    "ccrStatsOutput",
    ()=>ccrStatsOutput,
    "ccrStatsTool",
    ()=>ccrStatsTool,
    "ccrStoreInput",
    ()=>ccrStoreInput,
    "ccrStoreOutput",
    ()=>ccrStoreOutput,
    "ccrStoreTool",
    ()=>ccrStoreTool
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const ccrHash = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().regex(/^[a-f0-9]{24}$/i).describe("24-hex content hash from a CCR marker or ccr:// URI");
const ccrEntryMetadataOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    hash: ccrHash,
    bytes: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().nonnegative(),
    chars: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().nonnegative(),
    lines: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().nonnegative(),
    contentType: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    source: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "compression",
        "mcp",
        "ionizer",
        "session-dedup"
    ]),
    createdAt: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().nonnegative(),
    lastAccessedAt: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().nonnegative(),
    expiresAt: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().nonnegative(),
    retrievalCount: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().nonnegative()
});
const ccrReferenceOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    hash: ccrHash,
    uri: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().startsWith("ccr://"),
    marker: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()
});
const ccrStoreInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    content: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).refine((content)=>Buffer.byteLength(content, "utf8") <= 2 * 1024 * 1024, {
        message: "Content exceeds the 2 MiB UTF-8 CCR block limit"
    }).describe("Verbatim content to keep in the in-memory CCR store (maximum 2 MiB UTF-8)"),
    contentType: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().trim().min(1).max(128).optional(),
    ttlSeconds: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(60).max(7 * 24 * 60 * 60).optional()
});
const ccrStoreOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].union([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        stored: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].literal(true),
        reference: ccrReferenceOutput,
        metadata: ccrEntryMetadataOutput
    }),
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        stored: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].literal(false),
        reason: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
            "block_too_large",
            "principal_budget_exceeded",
            "global_budget_exceeded"
        ])
    })
]);
const ccrStoreTool = {
    name: "omniroute_ccr_store",
    description: "Store verbatim content in the caller-isolated in-memory CCR store and return a ccr:// reference plus the compatible CCR marker. Entries expire automatically and are not persisted across restarts.",
    inputSchema: ccrStoreInput,
    outputSchema: ccrStoreOutput,
    scopes: [
        "write:compression"
    ],
    auditLevel: "basic",
    phase: 2,
    sourceEndpoints: []
};
const ccrRetrieveInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    hash: ccrHash,
    mode: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "full",
        "head",
        "tail",
        "lines",
        "grep",
        "stats"
    ]).optional(),
    n: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().positive().max(10_000).optional(),
    start: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().positive().optional(),
    end: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().positive().optional(),
    pattern: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().max(512).optional(),
    unique: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional()
});
const ccrRetrieveOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].union([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        found: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].literal(false),
        error: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()
    }),
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        found: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].literal(true),
        metadata: ccrEntryMetadataOutput,
        content: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
        tooLargeForFull: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
        suggestedModes: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
            "head",
            "tail",
            "lines",
            "grep",
            "stats"
        ])).optional(),
        error: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional()
    })
]);
const ccrRetrieveTool = {
    name: "omniroute_ccr_retrieve",
    description: "Retrieve caller-owned CCR content by hash. Full MCP responses are capped at 256 KiB; use head, tail, lines, grep, or stats for larger blocks.",
    inputSchema: ccrRetrieveInput,
    outputSchema: ccrRetrieveOutput,
    scopes: [
        "read:compression"
    ],
    auditLevel: "basic",
    phase: 2,
    sourceEndpoints: [
        "/api/compression/retrieve"
    ]
};
const ccrInspectInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    hash: ccrHash
});
const ccrInspectOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].union([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        found: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].literal(false)
    }),
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        found: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].literal(true),
        reference: ccrReferenceOutput,
        metadata: ccrEntryMetadataOutput
    })
]);
const ccrInspectTool = {
    name: "omniroute_ccr_inspect",
    description: "Inspect metadata for a caller-owned CCR block without returning its content.",
    inputSchema: ccrInspectInput,
    outputSchema: ccrInspectOutput,
    scopes: [
        "read:compression"
    ],
    auditLevel: "basic",
    phase: 2,
    sourceEndpoints: []
};
const ccrListInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    offset: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().nonnegative().optional(),
    limit: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(1).max(100).optional()
});
const ccrListOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    entries: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        reference: ccrReferenceOutput,
        metadata: ccrEntryMetadataOutput
    })),
    total: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().nonnegative(),
    offset: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().nonnegative(),
    limit: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().positive(),
    hasMore: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean()
});
const ccrListTool = {
    name: "omniroute_ccr_list",
    description: "List paginated metadata for CCR blocks owned by the current caller.",
    inputSchema: ccrListInput,
    outputSchema: ccrListOutput,
    scopes: [
        "read:compression"
    ],
    auditLevel: "basic",
    phase: 2,
    sourceEndpoints: []
};
const ccrDeleteInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    hash: ccrHash
});
const ccrDeleteOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    deleted: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean()
});
const ccrDeleteTool = {
    name: "omniroute_ccr_delete",
    description: "Delete a caller-owned block from the in-memory CCR store.",
    inputSchema: ccrDeleteInput,
    outputSchema: ccrDeleteOutput,
    scopes: [
        "write:compression"
    ],
    auditLevel: "basic",
    phase: 2,
    sourceEndpoints: []
};
const ccrStatsInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({});
const ccrStatsOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    storage: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].literal("memory"),
    entries: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().nonnegative(),
    bytes: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().nonnegative(),
    limits: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        maxEntries: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().positive(),
        maxBlockBytes: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().positive(),
        maxPrincipalBytes: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().positive(),
        maxGlobalBytes: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().positive(),
        defaultTtlSeconds: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().positive(),
        maxTtlSeconds: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().positive(),
        maxMcpFullBytes: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().positive()
    }),
    lifecycle: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        expiredEvictions: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().nonnegative(),
        capacityEvictions: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().nonnegative(),
        rejectedStores: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().nonnegative()
    })
});
const ccrStatsTool = {
    name: "omniroute_ccr_stats",
    description: "Return caller-scoped CCR entry and byte usage, lifecycle counters, and in-memory store limits.",
    inputSchema: ccrStatsInput,
    outputSchema: ccrStatsOutput,
    scopes: [
        "read:compression"
    ],
    auditLevel: "basic",
    phase: 2,
    sourceEndpoints: []
};
const CCR_MCP_TOOLS = [
    ccrStoreTool,
    ccrRetrieveTool,
    ccrInspectTool,
    ccrListTool,
    ccrDeleteTool,
    ccrStatsTool
];
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/mcp-server/schemas/tools.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "MCP_ADVANCED_TOOLS",
    ()=>MCP_ADVANCED_TOOLS,
    "MCP_ESSENTIAL_TOOLS",
    ()=>MCP_ESSENTIAL_TOOLS,
    "MCP_TOOLS",
    ()=>MCP_TOOLS,
    "MCP_TOOL_MAP",
    ()=>MCP_TOOL_MAP,
    "agentSkillsCoverageInput",
    ()=>agentSkillsCoverageInput,
    "agentSkillsCoverageOutput",
    ()=>agentSkillsCoverageOutput,
    "agentSkillsCoverageTool",
    ()=>agentSkillsCoverageTool,
    "agentSkillsGetInput",
    ()=>agentSkillsGetInput,
    "agentSkillsGetOutput",
    ()=>agentSkillsGetOutput,
    "agentSkillsGetTool",
    ()=>agentSkillsGetTool,
    "agentSkillsListInput",
    ()=>agentSkillsListInput,
    "agentSkillsListOutput",
    ()=>agentSkillsListOutput,
    "agentSkillsListTool",
    ()=>agentSkillsListTool,
    "bestComboForTaskInput",
    ()=>bestComboForTaskInput,
    "bestComboForTaskOutput",
    ()=>bestComboForTaskOutput,
    "bestComboForTaskTool",
    ()=>bestComboForTaskTool,
    "cacheFlushInput",
    ()=>cacheFlushInput,
    "cacheFlushOutput",
    ()=>cacheFlushOutput,
    "cacheFlushTool",
    ()=>cacheFlushTool,
    "cacheStatsInput",
    ()=>cacheStatsInput,
    "cacheStatsOutput",
    ()=>cacheStatsOutput,
    "cacheStatsTool",
    ()=>cacheStatsTool,
    "checkQuotaInput",
    ()=>checkQuotaInput,
    "checkQuotaOutput",
    ()=>checkQuotaOutput,
    "checkQuotaTool",
    ()=>checkQuotaTool,
    "compressionComboStatsInput",
    ()=>compressionComboStatsInput,
    "compressionComboStatsOutput",
    ()=>compressionComboStatsOutput,
    "compressionComboStatsTool",
    ()=>compressionComboStatsTool,
    "compressionConfigureInput",
    ()=>compressionConfigureInput,
    "compressionConfigureOutput",
    ()=>compressionConfigureOutput,
    "compressionConfigureTool",
    ()=>compressionConfigureTool,
    "compressionStatusInput",
    ()=>compressionStatusInput,
    "compressionStatusOutput",
    ()=>compressionStatusOutput,
    "compressionStatusTool",
    ()=>compressionStatusTool,
    "costReportInput",
    ()=>costReportInput,
    "costReportOutput",
    ()=>costReportOutput,
    "costReportTool",
    ()=>costReportTool,
    "createComboInput",
    ()=>createComboInput,
    "createComboOutput",
    ()=>createComboOutput,
    "createComboTool",
    ()=>createComboTool,
    "dbHealthCheckInput",
    ()=>dbHealthCheckInput,
    "dbHealthCheckOutput",
    ()=>dbHealthCheckOutput,
    "dbHealthCheckTool",
    ()=>dbHealthCheckTool,
    "explainRouteInput",
    ()=>explainRouteInput,
    "explainRouteOutput",
    ()=>explainRouteOutput,
    "explainRouteTool",
    ()=>explainRouteTool,
    "getComboMetricsInput",
    ()=>getComboMetricsInput,
    "getComboMetricsOutput",
    ()=>getComboMetricsOutput,
    "getComboMetricsTool",
    ()=>getComboMetricsTool,
    "getHealthInput",
    ()=>getHealthInput,
    "getHealthOutput",
    ()=>getHealthOutput,
    "getHealthTool",
    ()=>getHealthTool,
    "getProviderMetricsInput",
    ()=>getProviderMetricsInput,
    "getProviderMetricsOutput",
    ()=>getProviderMetricsOutput,
    "getProviderMetricsTool",
    ()=>getProviderMetricsTool,
    "getSessionSnapshotInput",
    ()=>getSessionSnapshotInput,
    "getSessionSnapshotOutput",
    ()=>getSessionSnapshotOutput,
    "getSessionSnapshotTool",
    ()=>getSessionSnapshotTool,
    "listCombosInput",
    ()=>listCombosInput,
    "listCombosOutput",
    ()=>listCombosOutput,
    "listCombosTool",
    ()=>listCombosTool,
    "listCompressionCombosInput",
    ()=>listCompressionCombosInput,
    "listCompressionCombosOutput",
    ()=>listCompressionCombosOutput,
    "listCompressionCombosTool",
    ()=>listCompressionCombosTool,
    "listModelsCatalogInput",
    ()=>listModelsCatalogInput,
    "listModelsCatalogOutput",
    ()=>listModelsCatalogOutput,
    "listModelsCatalogTool",
    ()=>listModelsCatalogTool,
    "oneproxyFetchInput",
    ()=>oneproxyFetchInput,
    "oneproxyFetchOutput",
    ()=>oneproxyFetchOutput,
    "oneproxyFetchTool",
    ()=>oneproxyFetchTool,
    "oneproxyRotateInput",
    ()=>oneproxyRotateInput,
    "oneproxyRotateOutput",
    ()=>oneproxyRotateOutput,
    "oneproxyRotateTool",
    ()=>oneproxyRotateTool,
    "oneproxyStatsInput",
    ()=>oneproxyStatsInput,
    "oneproxyStatsOutput",
    ()=>oneproxyStatsOutput,
    "oneproxyStatsTool",
    ()=>oneproxyStatsTool,
    "routeRequestInput",
    ()=>routeRequestInput,
    "routeRequestOutput",
    ()=>routeRequestOutput,
    "routeRequestTool",
    ()=>routeRequestTool,
    "setBudgetGuardInput",
    ()=>setBudgetGuardInput,
    "setBudgetGuardOutput",
    ()=>setBudgetGuardOutput,
    "setBudgetGuardTool",
    ()=>setBudgetGuardTool,
    "setCompressionEngineInput",
    ()=>setCompressionEngineInput,
    "setCompressionEngineOutput",
    ()=>setCompressionEngineOutput,
    "setCompressionEngineTool",
    ()=>setCompressionEngineTool,
    "setResilienceProfileInput",
    ()=>setResilienceProfileInput,
    "setResilienceProfileOutput",
    ()=>setResilienceProfileOutput,
    "setResilienceProfileTool",
    ()=>setResilienceProfileTool,
    "setRoutingStrategyInput",
    ()=>setRoutingStrategyInput,
    "setRoutingStrategyOutput",
    ()=>setRoutingStrategyOutput,
    "setRoutingStrategyTool",
    ()=>setRoutingStrategyTool,
    "simulateRouteInput",
    ()=>simulateRouteInput,
    "simulateRouteOutput",
    ()=>simulateRouteOutput,
    "simulateRouteTool",
    ()=>simulateRouteTool,
    "switchComboInput",
    ()=>switchComboInput,
    "switchComboOutput",
    ()=>switchComboOutput,
    "switchComboTool",
    ()=>switchComboTool,
    "syncPricingInput",
    ()=>syncPricingInput,
    "syncPricingOutput",
    ()=>syncPricingOutput,
    "syncPricingTool",
    ()=>syncPricingTool,
    "testComboInput",
    ()=>testComboInput,
    "testComboOutput",
    ()=>testComboOutput,
    "testComboTool",
    ()=>testComboTool,
    "webFetchInput",
    ()=>webFetchInput,
    "webFetchOutput",
    ()=>webFetchOutput,
    "webFetchTool",
    ()=>webFetchTool,
    "webSearchInput",
    ()=>webSearchInput,
    "webSearchOutput",
    ()=>webSearchOutput,
    "webSearchTool",
    ()=>webSearchTool
]);
/**
 * MCP Tool Schemas — Contracts for all 23 core and advanced OmniRoute MCP tools.
 *
 * Defines input/output Zod schemas, descriptions, scopes, and audit levels
 * for both essential (Phase 1) and advanced (Phase 2) MCP tools.
 *
 * Each tool wraps existing OmniRoute API endpoints and exposes them through
 * the Model Context Protocol, enabling AI agents in IDEs (VS Code, Cursor,
 * Copilot, Claude Desktop) to intelligently query gateway state.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$toolSearch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/schemas/toolSearch.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$pickFastestModel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/schemas/pickFastestModel.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$ccrTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/schemas/ccrTools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$routingStrategies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/routingStrategies.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$toolSearch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$pickFastestModel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$ccrTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$toolSearch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$pickFastestModel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$ccrTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
const getHealthInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({}).describe("No parameters required");
const getHealthOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    uptime: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    version: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    memoryUsage: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        heapUsed: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        heapTotal: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
    }),
    circuitBreakers: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        state: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
            "CLOSED",
            "OPEN",
            "HALF_OPEN"
        ]),
        failureCount: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        lastFailure: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable()
    })),
    rateLimits: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        rpm: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        currentUsage: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        isLimited: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean()
    })),
    cacheStats: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        hits: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        misses: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        hitRate: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
    }).optional(),
    cryptography: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        status: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
            "healthy",
            "missing_or_invalid"
        ]),
        provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()
    }).optional()
});
const getHealthTool = {
    name: "omniroute_get_health",
    description: "Returns the current health status of OmniRoute including uptime, memory usage, circuit breaker states for all providers, rate limit status, and cache statistics.",
    inputSchema: getHealthInput,
    outputSchema: getHealthOutput,
    scopes: [
        "read:health"
    ],
    auditLevel: "basic",
    phase: 1,
    sourceEndpoints: [
        "/api/monitoring/health",
        "/api/resilience",
        "/api/rate-limits"
    ]
};
const listCombosInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    includeMetrics: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional().describe("Include request count, success rate, latency, and cost metrics per combo")
});
const listCombosOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    combos: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        models: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
            model: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
            priority: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
        })),
        strategy: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$routingStrategies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ROUTING_STRATEGY_VALUES"]),
        enabled: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean(),
        metrics: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            requestCount: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
            successRate: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
            avgLatencyMs: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
            totalCost: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
        }).optional()
    }))
});
const listCombosTool = {
    name: "omniroute_list_combos",
    description: "Lists all configured combos (model chains) with their strategies and optionally includes performance metrics. Combos define how requests are routed across multiple providers.",
    inputSchema: listCombosInput,
    outputSchema: listCombosOutput,
    scopes: [
        "read:combos"
    ],
    auditLevel: "basic",
    phase: 1,
    sourceEndpoints: [
        "/api/combos",
        "/api/combos/metrics"
    ]
};
const getComboMetricsInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    comboId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().describe("ID of the combo to get metrics for")
});
const getComboMetricsOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    requests: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
    successRate: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
    avgLatency: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
    costTotal: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
    fallbackCount: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
    byProvider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        requests: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        successRate: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        avgLatency: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
    }))
});
const getComboMetricsTool = {
    name: "omniroute_get_combo_metrics",
    description: "Returns detailed performance metrics for a specific combo including request count, success rate, average latency, total cost, and per-provider breakdowns.",
    inputSchema: getComboMetricsInput,
    outputSchema: getComboMetricsOutput,
    scopes: [
        "read:combos"
    ],
    auditLevel: "basic",
    phase: 1,
    sourceEndpoints: [
        "/api/combos/metrics"
    ]
};
const switchComboInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    comboId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().describe("ID of the combo to activate/deactivate"),
    active: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().describe("Whether to enable or disable the combo")
});
const switchComboOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    success: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean(),
    combo: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        enabled: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean()
    })
});
const switchComboTool = {
    name: "omniroute_switch_combo",
    description: "Activates or deactivates a combo. When deactivated, requests will not be routed through this combo. Use to toggle between different routing strategies.",
    inputSchema: switchComboInput,
    outputSchema: switchComboOutput,
    scopes: [
        "write:combos"
    ],
    auditLevel: "full",
    phase: 1,
    sourceEndpoints: [
        "/api/combos"
    ]
};
const createComboInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().trim().min(1).max(100).describe("Unique combo name (letters, numbers, spaces, -, _, /, ., [ and ])"),
    description: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().max(2000).optional().describe("Optional human-readable description"),
    strategy: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$routingStrategies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ROUTING_STRATEGY_VALUES"]).optional().describe("Routing strategy (default: priority)"),
    models: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().describe("Provider name (e.g., 'claude', 'gemini')"),
        model: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().describe("Model ID for that provider")
    })).min(1).describe("Ordered model chain; order defines priority")
});
const createComboOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    success: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean(),
    combo: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        strategy: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        enabled: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean()
    })
});
const createComboTool = {
    name: "omniroute_create_combo",
    description: "Registers a new combo (model chain) with a name, ordered model list, and optional routing strategy. Full validation (name collisions, nested-combo DAG, composite tiers) is enforced by the combos API.",
    inputSchema: createComboInput,
    outputSchema: createComboOutput,
    scopes: [
        "write:combos"
    ],
    auditLevel: "full",
    phase: 1,
    sourceEndpoints: [
        "/api/combos"
    ]
};
const checkQuotaInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().describe("Filter by provider name (e.g., 'claude', 'gemini'). If omitted, returns all providers."),
    connectionId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().describe("Filter by specific connection ID")
});
const checkQuotaOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    providers: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        connectionId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        quotaUsed: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        quotaTotal: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().nullable(),
        percentRemaining: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        resetAt: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable(),
        tokenStatus: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
            "valid",
            "expiring",
            "expired",
            "refreshing"
        ])
    })),
    meta: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        generatedAt: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        filters: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable(),
            connectionId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable()
        }),
        totalProviders: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
    }).optional()
});
const checkQuotaTool = {
    name: "omniroute_check_quota",
    description: "Checks the remaining API quota for one or all providers. Returns quota used/total, percentage remaining, reset time, and token health status.",
    inputSchema: checkQuotaInput,
    outputSchema: checkQuotaOutput,
    scopes: [
        "read:quota"
    ],
    auditLevel: "basic",
    phase: 1,
    sourceEndpoints: [
        "/api/usage/quota",
        "/api/token-health",
        "/api/rate-limits"
    ]
};
const routeRequestInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    model: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().describe("Model identifier (e.g., 'claude-sonnet-4', 'gpt-4o')"),
    messages: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        role: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        content: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()
    })).describe("Chat messages in OpenAI format"),
    combo: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().describe("Specific combo to route through"),
    budget: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().optional().describe("Maximum cost in USD for this request"),
    role: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "coding",
        "review",
        "planning",
        "analysis"
    ]).optional().describe("Task role hint for intelligent routing"),
    stream: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional().default(false).describe("Whether to stream the response")
});
const routeRequestOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    response: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        content: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        model: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        tokens: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            prompt: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
            completion: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
        })
    }),
    routing: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        combo: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable(),
        fallbacksTriggered: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        cost: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        latencyMs: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        routingExplanation: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()
    })
});
const routeRequestTool = {
    name: "omniroute_route_request",
    description: "Sends a chat completion request through OmniRoute's intelligent routing pipeline. Supports combo selection, budget limits, and task role hints for optimal provider matching.",
    inputSchema: routeRequestInput,
    outputSchema: routeRequestOutput,
    scopes: [
        "execute:completions"
    ],
    auditLevel: "full",
    phase: 1,
    sourceEndpoints: [
        "/v1/chat/completions",
        "/v1/responses"
    ]
};
const costReportInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    period: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "session",
        "day",
        "week",
        "month"
    ]).optional().default("session").describe("Time period for the cost report")
});
const costReportOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    period: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    totalCost: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
    requestCount: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
    tokenCount: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        prompt: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        completion: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
    }),
    byProvider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        cost: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        requests: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
    })),
    byModel: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        model: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        cost: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        requests: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
    })),
    budget: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        limit: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().nullable(),
        remaining: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().nullable()
    })
});
const costReportTool = {
    name: "omniroute_cost_report",
    description: "Generates a cost report for the specified period showing total cost, request count, token usage, and breakdowns by provider and model. Also shows budget status if configured.",
    inputSchema: costReportInput,
    outputSchema: costReportOutput,
    scopes: [
        "read:usage"
    ],
    auditLevel: "basic",
    phase: 1,
    sourceEndpoints: [
        "/api/usage/analytics",
        "/api/usage/budget"
    ]
};
const listModelsCatalogInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().describe("Filter by provider name"),
    capability: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "chat",
        "embedding",
        "image",
        "audio",
        "video",
        "rerank",
        "moderation"
    ]).optional().describe("Filter by model capability")
});
const listModelsCatalogOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    models: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        capabilities: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()),
        status: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
            "available",
            "degraded",
            "unavailable"
        ]),
        thinkingEffort: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
        pricing: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            inputPerMillion: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().nullable(),
            outputPerMillion: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().nullable()
        }).optional()
    }))
});
const listModelsCatalogTool = {
    name: "omniroute_list_models_catalog",
    description: "Lists all available AI models across all providers with their capabilities, current status, and pricing information.",
    inputSchema: listModelsCatalogInput,
    outputSchema: listModelsCatalogOutput,
    scopes: [
        "read:models"
    ],
    auditLevel: "none",
    phase: 1,
    sourceEndpoints: [
        "/api/models/catalog",
        "/v1/models"
    ]
};
const webSearchInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    query: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Query is required").max(500, "Query must be 500 characters or fewer").describe("The search query string"),
    max_results: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(1).max(20).default(5).describe("Maximum number of search results to return"),
    search_type: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "web",
        "news"
    ]).default("web").describe("Type of search to perform"),
    provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "serper-search",
        "brave-search",
        "perplexity-search",
        "exa-search",
        "tavily-search",
        "google-pse-search",
        "linkup-search",
        "searchapi-search",
        "searxng-search"
    ]).optional().describe("Specific search provider to use")
});
const webSearchOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    query: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    results: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        title: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        url: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        display_url: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
        snippet: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        position: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().positive()
    })),
    cached: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean(),
    usage: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        queries_used: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0),
        search_cost_usd: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0)
    })
});
const webSearchTool = {
    name: "omniroute_web_search",
    description: "Performs a web search using OmniRoute's search gateway. Supports multiple providers (Serper, Brave, Perplexity, Exa, Tavily, Google PSE, Linkup, SearchAPI, SearXNG) with automatic failover. Returns search results with titles, URLs, snippets, and position data.",
    inputSchema: webSearchInput,
    outputSchema: webSearchOutput,
    scopes: [
        "execute:search"
    ],
    auditLevel: "basic",
    phase: 1,
    sourceEndpoints: [
        "/v1/search"
    ]
};
const webFetchInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    url: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string({
        error: "URL is required"
    }).min(1, "URL is required").describe("The URL to fetch content from"),
    provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "firecrawl",
        "jina-reader",
        "tavily-search",
        "tinyfish"
    ]).optional().describe("Specific fetch provider to use (default: first available)"),
    format: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "markdown",
        "html",
        "links",
        "screenshot"
    ]).optional().default("markdown").describe("Output format for the fetched content"),
    include_metadata: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional().default(false).describe("Include page metadata (title, description) in the response"),
    depth: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0).max(2).optional().describe("Crawl depth for Firecrawl (0 = single page, max 2)"),
    wait_for_selector: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().describe("CSS selector to wait for before extracting content (Firecrawl only)")
});
const webFetchOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    url: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    content: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    links: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()),
    metadata: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        title: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable(),
        description: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable()
    }).nullable(),
    screenshot_url: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable()
});
const webFetchTool = {
    name: "omniroute_web_fetch",
    description: "Fetches and extracts content from a URL using OmniRoute's web fetch gateway. Supports multiple providers (Firecrawl, Jina Reader, Tavily, TinyFish) with automatic failover. Returns the page content as markdown, HTML, links, or screenshot, along with metadata.",
    inputSchema: webFetchInput,
    outputSchema: webFetchOutput,
    scopes: [
        "execute:search"
    ],
    auditLevel: "basic",
    phase: 1,
    sourceEndpoints: [
        "/v1/web/fetch"
    ]
};
const simulateRouteInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    model: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().describe("Target model for simulation"),
    promptTokenEstimate: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().describe("Estimated prompt token count"),
    combo: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().describe("Specific combo to simulate (default: active combo)")
});
const simulateRouteOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    simulatedPath: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        model: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        probability: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        estimatedCost: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        healthStatus: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
            "CLOSED",
            "OPEN",
            "HALF_OPEN"
        ]),
        quotaAvailable: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
    })),
    fallbackTree: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        primary: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        fallbacks: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()),
        worstCaseCost: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        bestCaseCost: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
    })
});
const simulateRouteTool = {
    name: "omniroute_simulate_route",
    description: "Simulates (dry-run) the routing path a request would take without actually executing it. Shows the fallback tree, provider probabilities, estimated costs, and health status.",
    inputSchema: simulateRouteInput,
    outputSchema: simulateRouteOutput,
    scopes: [
        "read:health",
        "read:combos"
    ],
    auditLevel: "basic",
    phase: 2,
    sourceEndpoints: [
        "/api/combos",
        "/api/monitoring/health",
        "/api/resilience"
    ]
};
const setBudgetGuardInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    maxCost: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().describe("Maximum cost in USD for this session"),
    action: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "degrade",
        "block",
        "alert"
    ]).describe("Action when budget is exceeded"),
    degradeToTier: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "cheap",
        "free"
    ]).optional().describe("If action=degrade, which tier to fall back to")
});
const setBudgetGuardOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    sessionId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    budgetTotal: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
    budgetSpent: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
    budgetRemaining: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
    action: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    status: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "active",
        "warning",
        "exceeded"
    ])
});
const setBudgetGuardTool = {
    name: "omniroute_set_budget_guard",
    description: "Sets a budget guard that limits spending for the current session. When the budget is reached, it can degrade to cheaper models, block requests, or send alerts.",
    inputSchema: setBudgetGuardInput,
    outputSchema: setBudgetGuardOutput,
    scopes: [
        "write:budget"
    ],
    auditLevel: "full",
    phase: 2,
    sourceEndpoints: [
        "/api/usage/budget"
    ]
};
const setRoutingStrategyInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    comboId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().describe("Combo ID or name to update"),
    strategy: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$routingStrategies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ROUTING_STRATEGY_VALUES"]).describe("Routing strategy to apply"),
    autoRoutingStrategy: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$routingStrategies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AUTO_ROUTING_STRATEGY_VALUES"]).optional().describe("Optional strategy used by auto mode (only used when strategy='auto')")
});
const setRoutingStrategyOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    success: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean(),
    combo: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        strategy: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        autoRoutingStrategy: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable()
    })
});
const setRoutingStrategyTool = {
    name: "omniroute_set_routing_strategy",
    description: "Updates a combo routing strategy (priority/weighted/auto/etc.) at runtime. Supports selecting the sub-strategy used by auto mode (rules/cost/latency/sla-aware).",
    inputSchema: setRoutingStrategyInput,
    outputSchema: setRoutingStrategyOutput,
    scopes: [
        "write:combos"
    ],
    auditLevel: "full",
    phase: 2,
    sourceEndpoints: [
        "/api/combos",
        "/api/combos/{id}"
    ]
};
const setResilienceProfileInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    profile: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "aggressive",
        "balanced",
        "conservative"
    ]).describe("Resilience profile to apply")
});
const setResilienceProfileOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    applied: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean(),
    settings: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        circuitBreakerThreshold: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        retryCount: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        timeoutMs: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        fallbackDepth: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
    })
});
const setResilienceProfileTool = {
    name: "omniroute_set_resilience_profile",
    description: "Applies a resilience profile that adjusts circuit breaker thresholds, retry counts, timeouts, and fallback depth. 'aggressive' = fast fail, 'conservative' = max retries.",
    inputSchema: setResilienceProfileInput,
    outputSchema: setResilienceProfileOutput,
    scopes: [
        "write:resilience"
    ],
    auditLevel: "full",
    phase: 2,
    sourceEndpoints: [
        "/api/resilience"
    ]
};
const testComboInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    comboId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().describe("ID of the combo to test"),
    testPrompt: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().max(500).describe("Short test prompt (max 500 chars)")
});
const testComboOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    results: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        model: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        success: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean(),
        latencyMs: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        cost: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        tokenCount: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        error: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional()
    })),
    summary: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        totalProviders: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        successful: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        fastestProvider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        cheapestProvider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()
    })
});
const testComboTool = {
    name: "omniroute_test_combo",
    description: "Tests a combo by sending a short test prompt to each provider in the combo and reporting individual results including latency, cost, and success status.",
    inputSchema: testComboInput,
    outputSchema: testComboOutput,
    scopes: [
        "execute:completions",
        "read:combos"
    ],
    auditLevel: "full",
    phase: 2,
    sourceEndpoints: [
        "/api/combos/test",
        "/v1/chat/completions"
    ]
};
const getProviderMetricsInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().describe("Provider name (e.g., 'claude', 'antigravity', 'codex')")
});
const getProviderMetricsOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    successRate: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
    requestCount: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
    avgLatencyMs: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
    p50LatencyMs: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
    p95LatencyMs: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
    p99LatencyMs: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
    errorRate: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
    lastError: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        message: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        timestamp: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()
    }).nullable(),
    circuitBreakerState: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "CLOSED",
        "OPEN",
        "HALF_OPEN"
    ]),
    quotaInfo: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        used: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        total: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().nullable(),
        resetAt: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable()
    })
});
const getProviderMetricsTool = {
    name: "omniroute_get_provider_metrics",
    description: "Returns detailed performance metrics for a specific provider including success/error rates, latency percentiles (p50/p95/p99), circuit breaker state, and quota information.",
    inputSchema: getProviderMetricsInput,
    outputSchema: getProviderMetricsOutput,
    scopes: [
        "read:health"
    ],
    auditLevel: "basic",
    phase: 2,
    sourceEndpoints: [
        "/api/provider-metrics",
        "/api/resilience"
    ]
};
const bestComboForTaskInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    taskType: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "coding",
        "review",
        "planning",
        "analysis",
        "debugging",
        "documentation"
    ]).describe("Type of task to find the best combo for"),
    budgetConstraint: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().optional().describe("Maximum cost in USD"),
    latencyConstraint: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().optional().describe("Maximum acceptable latency in ms")
});
const bestComboForTaskOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    recommendedCombo: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        reason: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()
    }),
    alternatives: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        tradeoff: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()
    })),
    freeAlternative: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()
    }).nullable()
});
const bestComboForTaskTool = {
    name: "omniroute_best_combo_for_task",
    description: "Recommends the best combo for a given task type (coding, review, planning, etc.) considering budget and latency constraints. Also suggests alternatives and free options.",
    inputSchema: bestComboForTaskInput,
    outputSchema: bestComboForTaskOutput,
    scopes: [
        "read:combos",
        "read:health"
    ],
    auditLevel: "basic",
    phase: 2,
    sourceEndpoints: [
        "/api/combos",
        "/api/combos/metrics",
        "/api/monitoring/health"
    ]
};
const explainRouteInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    requestId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().describe("Request ID from the X-Request-Id header")
});
const explainRouteOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    requestId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    decision: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        comboUsed: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        providerSelected: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        modelUsed: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        score: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        factors: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
            value: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
            weight: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
            contribution: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
        })),
        fallbacksTriggered: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
            reason: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()
        })),
        costActual: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        latencyActual: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
    })
});
const explainRouteTool = {
    name: "omniroute_explain_route",
    description: "Explains why a specific request was routed to a particular provider. Shows the scoring factors, weights, fallbacks triggered, actual cost, and latency.",
    inputSchema: explainRouteInput,
    outputSchema: explainRouteOutput,
    scopes: [
        "read:health",
        "read:usage"
    ],
    auditLevel: "basic",
    phase: 2,
    sourceEndpoints: []
};
const getSessionSnapshotInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({}).describe("No parameters required");
const getSessionSnapshotOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    sessionStart: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    duration: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    requestCount: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
    costTotal: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
    tokenCount: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        prompt: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        completion: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
    }),
    topModels: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        model: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        count: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
    })),
    topProviders: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        count: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
    })),
    errors: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
    fallbacks: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
    budgetGuard: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        active: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean(),
        remaining: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
    }).nullable()
});
const getSessionSnapshotTool = {
    name: "omniroute_get_session_snapshot",
    description: "Returns a snapshot of the current working session including duration, request count, total cost, top models/providers used, error count, and budget guard status.",
    inputSchema: getSessionSnapshotInput,
    outputSchema: getSessionSnapshotOutput,
    scopes: [
        "read:usage"
    ],
    auditLevel: "none",
    phase: 2,
    sourceEndpoints: [
        "/api/usage/analytics",
        "/api/telemetry/summary"
    ]
};
const dbHealthCheckInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    autoRepair: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional().describe("When true, runs the database auto-repair flow before returning the result")
});
const dbHealthCheckOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    isHealthy: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean(),
    issues: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
            "integrity_check_failed",
            "broken_reference",
            "stale_snapshot",
            "invalid_state"
        ]),
        table: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        description: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        count: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
    })),
    repairedCount: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
    backupCreated: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean(),
    autoRepair: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean(),
    checkedAt: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()
});
const dbHealthCheckTool = {
    name: "omniroute_db_health_check",
    description: "Diagnoses OmniRoute database drift such as orphan quota/domain rows, invalid JSON state, and broken combo references. Set autoRepair=true to repair those rows before returning the report.",
    inputSchema: dbHealthCheckInput,
    outputSchema: dbHealthCheckOutput,
    scopes: [
        "read:health",
        "write:resilience"
    ],
    auditLevel: "full",
    phase: 2,
    sourceEndpoints: [
        "/api/db/health"
    ]
};
const syncPricingInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    sources: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()).optional().describe("External pricing sources to sync from (default: ['litellm'])"),
    dryRun: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional().describe("If true, preview sync results without saving to database")
});
const syncPricingOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    success: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean(),
    modelCount: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
    providerCount: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
    source: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    dryRun: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean(),
    error: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    warnings: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()).optional(),
    data: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].record(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(), __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].record(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(), __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].unknown())).optional()
});
const syncPricingTool = {
    name: "omniroute_sync_pricing",
    description: "Syncs pricing data from external sources (LiteLLM) into OmniRoute. Synced pricing fills gaps not covered by hardcoded defaults without overwriting user-set prices. Use dryRun=true to preview.",
    inputSchema: syncPricingInput,
    outputSchema: syncPricingOutput,
    scopes: [
        "pricing:write"
    ],
    auditLevel: "full",
    phase: 2,
    sourceEndpoints: [
        "/api/pricing/sync"
    ]
};
const cacheStatsInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({}).describe("No parameters required");
const cacheStatsOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    semanticCache: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        memoryEntries: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        dbEntries: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        hits: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        misses: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        hitRate: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        tokensSaved: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
    }),
    promptCache: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        totalRequests: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        requestsWithCacheControl: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        totalInputTokens: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        totalCachedTokens: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        totalCacheCreationTokens: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        tokensSaved: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        estimatedCostSaved: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
    }).nullable(),
    idempotency: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        activeKeys: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        windowMs: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
    }),
    config: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        semanticCacheEnabled: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean()
    }).optional()
});
const cacheStatsTool = {
    name: "omniroute_cache_stats",
    description: "Returns cache statistics including semantic cache hit rate, prompt cache metrics by provider, and idempotency layer stats.",
    inputSchema: cacheStatsInput,
    outputSchema: cacheStatsOutput,
    scopes: [
        "read:cache"
    ],
    auditLevel: "basic",
    phase: 2,
    sourceEndpoints: [
        "/api/cache"
    ]
};
const cacheFlushInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    signature: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().describe("Specific cache signature to invalidate"),
    model: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().describe("Invalidate all entries for a specific model")
});
const cacheFlushOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    ok: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean(),
    invalidated: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().optional(),
    scope: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional()
});
const cacheFlushTool = {
    name: "omniroute_cache_flush",
    description: "Flush cache entries. Provide signature to invalidate a single entry, model to invalidate all entries for a model, or omit both to clear all.",
    inputSchema: cacheFlushInput,
    outputSchema: cacheFlushOutput,
    scopes: [
        "write:cache"
    ],
    auditLevel: "full",
    phase: 2,
    sourceEndpoints: [
        "/api/cache"
    ]
};
const compressionStatusInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({}).describe("No parameters required");
const compressionStatusOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    enabled: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean(),
    strategy: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    settings: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        maxTokens: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        autoTriggerMode: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        targetRatio: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        preserveSystemPrompt: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean(),
        mcpDescriptionCompressionEnabled: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean()
    }),
    analytics: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        totalRequests: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        compressedRequests: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        tokensSaved: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        avgCompressionRatio: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        byMode: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].record(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(), __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            count: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
            tokensSaved: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
            avgSavingsPct: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
        })),
        validationFallbacks: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        requestsWithReceipts: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        realUsage: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            requestsWithReceipts: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
            promptTokens: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
            completionTokens: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
            totalTokens: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
            cacheReadTokens: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
            cacheWriteTokens: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
            estimatedUsdSaved: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
            bySource: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].record(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(), __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number())
        }),
        mcpDescriptionCompression: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            descriptionsCompressed: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
            charsSaved: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
            estimatedTokensSaved: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
        })
    }),
    cacheStats: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        hits: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        misses: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        hitRate: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        tokensSaved: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
    }).nullable()
});
const compressionStatusTool = {
    name: "omniroute_compression_status",
    description: "Returns current compression configuration, strategy, analytics summary (requests compressed, tokens saved, avg ratio), and provider-aware cache statistics.",
    inputSchema: compressionStatusInput,
    outputSchema: compressionStatusOutput,
    scopes: [
        "read:compression"
    ],
    auditLevel: "basic",
    phase: 2,
    sourceEndpoints: [
        "/api/compression/status"
    ]
};
const compressionConfigureInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    enabled: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
    strategy: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "off",
        "lite",
        "standard",
        "aggressive",
        "ultra",
        "rtk",
        "codex-responses",
        "stacked",
        "omniglyph"
    ]).optional().describe("Compression mode"),
    autoTriggerMode: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "off",
        "lite",
        "standard",
        "aggressive",
        "ultra",
        "rtk",
        "codex-responses",
        "stacked",
        "omniglyph"
    ]).optional(),
    maxTokens: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0).optional().describe("Maximum tokens before compression triggers"),
    targetRatio: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().optional().describe("Target compression ratio (0.0–1.0)"),
    preserveSystemPrompt: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
    mcpDescriptionCompressionEnabled: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional()
});
const compressionConfigureOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    success: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean(),
    updated: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].record(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(), __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].unknown()),
    settings: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        enabled: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean(),
        strategy: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        autoTriggerMode: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        maxTokens: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        targetRatio: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        preserveSystemPrompt: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean(),
        mcpDescriptionCompressionEnabled: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean()
    })
});
const compressionConfigureTool = {
    name: "omniroute_compression_configure",
    description: "Configure compression settings at runtime. Supports enabling/disabling compression, changing strategy (off/lite/standard/aggressive/ultra/rtk/codex-responses/stacked), adjusting maxTokens threshold, targetRatio, auto-trigger mode, system prompt preservation, and MCP description compression.",
    inputSchema: compressionConfigureInput,
    outputSchema: compressionConfigureOutput,
    scopes: [
        "write:compression"
    ],
    auditLevel: "full",
    phase: 2,
    sourceEndpoints: [
        "/api/compression/configure"
    ]
};
const setCompressionEngineInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    engine: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "off",
        "caveman",
        "rtk",
        "codex-responses",
        "stacked"
    ]).optional(),
    cavemanIntensity: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "lite",
        "full",
        "ultra"
    ]).optional(),
    rtkIntensity: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "minimal",
        "standard",
        "aggressive"
    ]).optional(),
    outputMode: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional()
});
const setCompressionEngineOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    success: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean(),
    settings: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].record(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(), __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].unknown())
});
const setCompressionEngineTool = {
    name: "omniroute_set_compression_engine",
    description: "Set the active compression engine and Caveman/RTK runtime options.",
    inputSchema: setCompressionEngineInput,
    outputSchema: setCompressionEngineOutput,
    scopes: [
        "write:compression"
    ],
    auditLevel: "full",
    phase: 2,
    sourceEndpoints: [
        "/api/settings/compression",
        "/api/context/rtk/config"
    ]
};
const listCompressionCombosInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({});
const listCompressionCombosOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    combos: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].record(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(), __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].unknown()))
});
const listCompressionCombosTool = {
    name: "omniroute_list_compression_combos",
    description: "List compression combos and their engine pipelines.",
    inputSchema: listCompressionCombosInput,
    outputSchema: listCompressionCombosOutput,
    scopes: [
        "read:compression"
    ],
    auditLevel: "basic",
    phase: 2,
    sourceEndpoints: [
        "/api/context/combos"
    ]
};
const compressionComboStatsInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    comboId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    since: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "24h",
        "7d",
        "30d",
        "all"
    ]).optional()
});
const compressionComboStatsOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].record(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(), __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].unknown());
const compressionComboStatsTool = {
    name: "omniroute_compression_combo_stats",
    description: "Get compression analytics grouped by engine and compression combo.",
    inputSchema: compressionComboStatsInput,
    outputSchema: compressionComboStatsOutput,
    scopes: [
        "read:compression"
    ],
    auditLevel: "basic",
    phase: 2,
    sourceEndpoints: [
        "/api/context/analytics"
    ]
};
const oneproxyFetchInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    protocol: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().describe("Filter by protocol: http, https, socks4, socks5"),
    countryCode: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().describe("Filter by country code (e.g. US, DE)"),
    minQuality: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().optional().describe("Minimum quality score (0-100)"),
    limit: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().optional().describe("Maximum number of proxies to return")
});
const oneproxyFetchOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    items: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        host: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        port: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        countryCode: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable(),
        qualityScore: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().nullable(),
        latencyMs: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().nullable(),
        anonymity: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable(),
        googleAccess: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean(),
        status: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()
    })),
    total: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
});
const oneproxyFetchTool = {
    name: "omniroute_oneproxy_fetch",
    description: "Fetch free proxies from the 1proxy marketplace with optional filters for protocol, country, and quality. Returns validated proxies with quality scores.",
    inputSchema: oneproxyFetchInput,
    outputSchema: oneproxyFetchOutput,
    scopes: [
        "read:proxies"
    ],
    auditLevel: "basic",
    phase: 2,
    sourceEndpoints: [
        "/api/settings/oneproxy"
    ]
};
const oneproxyRotateInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    strategy: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "random",
        "quality",
        "sequential"
    ]).optional().describe("Rotation strategy: quality (best first), random, or sequential")
});
const oneproxyRotateOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    host: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    port: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
    type: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    countryCode: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable(),
    qualityScore: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().nullable(),
    latencyMs: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().nullable()
});
const oneproxyRotateTool = {
    name: "omniroute_oneproxy_rotate",
    description: "Get the next available free proxy from the 1proxy pool using the specified rotation strategy.",
    inputSchema: oneproxyRotateInput,
    outputSchema: oneproxyRotateOutput,
    scopes: [
        "read:proxies"
    ],
    auditLevel: "basic",
    phase: 2,
    sourceEndpoints: [
        "/api/settings/oneproxy/rotate"
    ]
};
const oneproxyStatsInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({}).describe("No parameters required");
const oneproxyStatsOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    stats: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        total: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        active: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        avgQuality: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().nullable(),
        lastValidated: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable(),
        byProtocol: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            protocol: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
            count: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
        })),
        byCountry: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            countryCode: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
            count: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
        }))
    }),
    status: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        lastSyncSuccess: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean(),
        lastSyncError: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable(),
        lastSyncAt: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable(),
        lastSyncCount: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        consecutiveFailures: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number()
    })
});
const oneproxyStatsTool = {
    name: "omniroute_oneproxy_stats",
    description: "Returns 1proxy sync status and statistics: total proxies, average quality, sync history, and distribution by protocol and country.",
    inputSchema: oneproxyStatsInput,
    outputSchema: oneproxyStatsOutput,
    scopes: [
        "read:proxies"
    ],
    auditLevel: "basic",
    phase: 2,
    sourceEndpoints: [
        "/api/settings/oneproxy"
    ]
};
const agentSkillsListInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    category: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "api",
        "cli"
    ]).optional().describe("Filter by category: 'api' or 'cli'"),
    area: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().describe("Filter by area (e.g. 'providers', 'models', 'cli-serve')")
});
const agentSkillsListOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    skills: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        description: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        category: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
            "api",
            "cli"
        ]),
        area: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        endpoints: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()).optional(),
        cliCommands: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()).optional(),
        icon: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
        isEntry: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
        isNew: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
        rawUrl: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        githubUrl: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()
    })),
    count: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
    coverage: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        api: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            have: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
            total: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].literal(22)
        }),
        cli: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            have: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
            total: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].literal(20)
        }),
        totalSkills: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        generatedAt: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()
    })
});
const agentSkillsListTool = {
    name: "omniroute_agent_skills_list",
    description: "List OmniRoute agent skills with optional filtering by category (api/cli) or area. Returns skill metadata including id, name, description, endpoints/commands, and URLs.",
    inputSchema: agentSkillsListInput,
    outputSchema: agentSkillsListOutput,
    scopes: [
        "read:catalog"
    ],
    auditLevel: "none",
    phase: 2,
    sourceEndpoints: [
        "/api/agent-skills"
    ]
};
const agentSkillsGetInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().describe("Canonical skill ID (e.g. 'omni-providers', 'cli-serve')")
});
const agentSkillsGetOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    description: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    category: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "api",
        "cli"
    ]),
    area: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    endpoints: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()).optional(),
    cliCommands: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()).optional(),
    icon: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    isEntry: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
    isNew: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
    rawUrl: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    githubUrl: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    markdown: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        frontmatter: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
            description: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()
        }),
        body: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
        source: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
            "filesystem",
            "github",
            "generated"
        ]),
        fetchedAt: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()
    })
});
const agentSkillsGetTool = {
    name: "omniroute_agent_skills_get",
    description: "Get detailed metadata and SKILL.md markdown for a single agent skill by its canonical ID. Returns all skill fields plus the raw markdown content.",
    inputSchema: agentSkillsGetInput,
    outputSchema: agentSkillsGetOutput,
    scopes: [
        "read:catalog"
    ],
    auditLevel: "none",
    phase: 2,
    sourceEndpoints: [
        "/api/agent-skills/:id",
        "/api/agent-skills/:id/raw"
    ]
};
const agentSkillsCoverageInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({}).describe("No parameters required");
const agentSkillsCoverageOutput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    api: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        have: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        total: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].literal(22)
    }),
    cli: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        have: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
        total: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].literal(20)
    }),
    totalSkills: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number(),
    generatedAt: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()
});
const agentSkillsCoverageTool = {
    name: "omniroute_agent_skills_coverage",
    description: "Returns the current SKILL.md coverage stats: how many of the 22 API skills and 20 CLI skills have generated SKILL.md files on the filesystem vs the catalog total.",
    inputSchema: agentSkillsCoverageInput,
    outputSchema: agentSkillsCoverageOutput,
    scopes: [
        "read:catalog"
    ],
    auditLevel: "none",
    phase: 2,
    sourceEndpoints: [
        "/api/agent-skills"
    ]
};
;
const MCP_TOOLS = [
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$toolSearch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toolSearchTool"],
    getHealthTool,
    listCombosTool,
    getComboMetricsTool,
    switchComboTool,
    createComboTool,
    checkQuotaTool,
    routeRequestTool,
    costReportTool,
    listModelsCatalogTool,
    webSearchTool,
    webFetchTool,
    simulateRouteTool,
    setBudgetGuardTool,
    setRoutingStrategyTool,
    setResilienceProfileTool,
    testComboTool,
    getProviderMetricsTool,
    bestComboForTaskTool,
    explainRouteTool,
    getSessionSnapshotTool,
    dbHealthCheckTool,
    syncPricingTool,
    cacheStatsTool,
    cacheFlushTool,
    compressionStatusTool,
    compressionConfigureTool,
    setCompressionEngineTool,
    listCompressionCombosTool,
    compressionComboStatsTool,
    ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$ccrTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CCR_MCP_TOOLS"],
    oneproxyFetchTool,
    oneproxyRotateTool,
    oneproxyStatsTool,
    agentSkillsListTool,
    agentSkillsGetTool,
    agentSkillsCoverageTool,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$pickFastestModel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pickFastestModelTool"]
];
const MCP_ESSENTIAL_TOOLS = MCP_TOOLS.filter((t)=>t.phase === 1);
const MCP_ADVANCED_TOOLS = MCP_TOOLS.filter((t)=>t.phase === 2);
const MCP_TOOL_MAP = Object.fromEntries(MCP_TOOLS.map((t)=>[
        t.name,
        t
    ]));
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/mcp-server/tools/memoryTools.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "MemoryAddSchema",
    ()=>MemoryAddSchema,
    "MemoryClearSchema",
    ()=>MemoryClearSchema,
    "MemorySearchSchema",
    ()=>MemorySearchSchema,
    "memoryTools",
    ()=>memoryTools
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$retrieval$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/memory/retrieval.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/memory/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/memory/settings.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$retrieval$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$retrieval$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
const MemorySearchSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    apiKeyId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    query: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    type: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "factual",
        "episodic",
        "procedural",
        "semantic"
    ]).optional(),
    maxTokens: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().positive().max(8000).optional(),
    limit: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().positive().max(100).optional()
});
const MemoryAddSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    apiKeyId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    sessionId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    type: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "factual",
        "episodic",
        "procedural",
        "semantic"
    ]),
    key: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    content: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    metadata: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].record(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(), __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].unknown()).optional()
});
const MemoryClearSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    apiKeyId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    type: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "factual",
        "episodic",
        "procedural",
        "semantic"
    ]).optional(),
    olderThan: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional()
});
const memoryTools = {
    omniroute_memory_search: {
        name: "omniroute_memory_search",
        description: "Search memories by query, type, or API key with token budget enforcement",
        scopes: [
            "read:memory"
        ],
        inputSchema: MemorySearchSchema,
        handler: async (args)=>{
            // Plan 21 D16/Bug#7 fix: even on the error path the fallback must
            // respect DEFAULT_MEMORY_SETTINGS.strategy instead of hardcoding "exact".
            const memorySettings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMemorySettings"])().catch(()=>null) ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_MEMORY_SETTINGS"];
            const baseConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toMemoryRetrievalConfig"])(memorySettings, {
                query: args.query
            });
            const config = {
                ...baseConfig,
                enabled: true,
                maxTokens: args.maxTokens ?? (memorySettings.enabled ? memorySettings.maxTokens : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_MEMORY_SETTINGS"].maxTokens)
            };
            const memories = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$retrieval$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["retrieveMemories"])(args.apiKeyId, config);
            const filtered = args.type ? memories.filter((m)=>m.type === args.type) : memories;
            const limited = args.limit ? filtered.slice(0, args.limit) : filtered;
            return {
                success: true,
                data: {
                    memories: limited,
                    count: limited.length,
                    totalTokens: limited.reduce((sum, m)=>sum + Math.ceil(m.content.length / 4), 0)
                }
            };
        }
    },
    omniroute_memory_add: {
        name: "omniroute_memory_add",
        description: "Add a new memory entry",
        scopes: [
            "write:memory"
        ],
        inputSchema: MemoryAddSchema,
        handler: async (args)=>{
            const memory = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createMemory"])({
                apiKeyId: args.apiKeyId,
                sessionId: args.sessionId || "",
                type: args.type,
                key: args.key,
                content: args.content,
                metadata: args.metadata || {},
                expiresAt: null
            });
            return {
                success: true,
                data: {
                    memory,
                    message: "Memory created successfully"
                }
            };
        }
    },
    omniroute_memory_clear: {
        name: "omniroute_memory_clear",
        description: "Clear memories for an API key, optionally filtered by type or age",
        scopes: [
            "write:memory"
        ],
        inputSchema: MemoryClearSchema,
        handler: async (args)=>{
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listMemories"])({
                apiKeyId: args.apiKeyId,
                type: args.type
            });
            const existingMemories = Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : [];
            let toDelete = existingMemories;
            if (args.olderThan) {
                const cutoff = new Date(args.olderThan);
                toDelete = existingMemories.filter((m)=>new Date(m.createdAt) < cutoff);
            }
            let deletedCount = 0;
            for (const memory of toDelete){
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteMemory"])(memory.id);
                deletedCount++;
            }
            return {
                success: true,
                data: {
                    deletedCount,
                    message: `Cleared ${deletedCount} memories`
                }
            };
        }
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/mcp-server/tools/skillTools.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "SkillEnableSchema",
    ()=>SkillEnableSchema,
    "SkillExecuteSchema",
    ()=>SkillExecuteSchema,
    "SkillListSchema",
    ()=>SkillListSchema,
    "skillTools",
    ()=>skillTools
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/skills/registry.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$executor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/skills/executor.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$executor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$executor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const SkillListSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    apiKeyId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    enabled: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional()
});
const SkillEnableSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    apiKeyId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    skillId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    enabled: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean()
});
const SkillExecuteSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    apiKeyId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    skillName: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    input: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].record(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(), __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].unknown()),
    sessionId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional()
});
const skillTools = {
    omniroute_skills_list: {
        name: "omniroute_skills_list",
        description: "List all registered skills with optional filtering by API key or name",
        scopes: [
            "read:skills"
        ],
        inputSchema: SkillListSchema,
        handler: async (args)=>{
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["skillRegistry"].loadFromDatabase(args.apiKeyId);
            const skills = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["skillRegistry"].list(args.apiKeyId);
            let filtered = skills;
            if (args.name) {
                filtered = filtered.filter((s)=>s.name.includes(args.name));
            }
            if (args.enabled !== undefined) {
                filtered = filtered.filter((s)=>s.enabled === args.enabled);
            }
            return {
                skills: filtered.map((s)=>({
                        id: s.id,
                        name: s.name,
                        version: s.version,
                        description: s.description,
                        enabled: s.enabled,
                        createdAt: s.createdAt.toISOString()
                    })),
                count: filtered.length
            };
        }
    },
    omniroute_skills_enable: {
        name: "omniroute_skills_enable",
        description: "Enable or disable a specific skill by ID",
        scopes: [
            "write:skills"
        ],
        inputSchema: SkillEnableSchema,
        handler: async (args)=>{
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["skillRegistry"].loadFromDatabase(args.apiKeyId);
            const skill = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["skillRegistry"].setEnabledById(args.skillId, args.apiKeyId, args.enabled);
            if (!skill) {
                throw new Error(`Skill not found: ${args.skillId}`);
            }
            return {
                success: true,
                skillId: args.skillId,
                enabled: args.enabled
            };
        }
    },
    omniroute_skills_execute: {
        name: "omniroute_skills_execute",
        description: "Execute a skill with provided input and return the result",
        scopes: [
            "execute:skills"
        ],
        inputSchema: SkillExecuteSchema,
        handler: async (args)=>{
            const execution = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$executor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["skillExecutor"].execute(args.skillName, args.input, {
                apiKeyId: args.apiKeyId,
                sessionId: args.sessionId
            });
            return {
                id: execution.id,
                skillId: execution.skillId,
                status: execution.status,
                output: execution.output,
                error: execution.errorMessage,
                duration: execution.durationMs,
                createdAt: execution.createdAt.toISOString()
            };
        }
    },
    omniroute_skills_executions: {
        name: "omniroute_skills_executions",
        description: "List recent skill execution history",
        scopes: [
            "read:skills"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            apiKeyId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
            limit: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().positive().max(100).optional()
        }),
        handler: async (args)=>{
            const executions = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$executor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["skillExecutor"].listExecutions(args.apiKeyId, args.limit || 50);
            return {
                executions: executions.map((e)=>({
                        id: e.id,
                        skillId: e.skillId,
                        status: e.status,
                        duration: e.durationMs,
                        error: e.errorMessage,
                        createdAt: e.createdAt.toISOString()
                    })),
                count: executions.length
            };
        }
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/mcp-server/tools/agentSkillTools.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "AgentSkillsCoverageSchema",
    ()=>AgentSkillsCoverageSchema,
    "AgentSkillsGetSchema",
    ()=>AgentSkillsGetSchema,
    "AgentSkillsListSchema",
    ()=>AgentSkillsListSchema,
    "agentSkillTools",
    ()=>agentSkillTools
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$agentSkills$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/agentSkills/catalog.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const AgentSkillsListSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    category: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "api",
        "cli"
    ]).optional().describe("Filter by category: 'api' or 'cli'"),
    area: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().describe("Filter by area (e.g. 'providers', 'models', 'cli-serve')")
});
const AgentSkillsGetSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().describe("Canonical skill ID (e.g. 'omni-providers', 'cli-serve')")
});
const AgentSkillsCoverageSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({});
const agentSkillTools = {
    omniroute_agent_skills_list: {
        name: "omniroute_agent_skills_list",
        description: "List OmniRoute agent skills with optional filtering by category (api/cli) or area. Returns skill metadata including id, name, description, endpoints/commands, and URLs.",
        inputSchema: AgentSkillsListSchema,
        handler: async (args)=>{
            const skills = args.category || args.area ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$agentSkills$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["filterCatalog"])({
                category: args.category,
                area: args.area
            }) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$agentSkills$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCatalog"])();
            return {
                skills: skills.map((s)=>({
                        id: s.id,
                        name: s.name,
                        description: s.description,
                        category: s.category,
                        area: s.area,
                        endpoints: s.endpoints,
                        cliCommands: s.cliCommands,
                        icon: s.icon,
                        isEntry: s.isEntry,
                        isNew: s.isNew,
                        rawUrl: s.rawUrl,
                        githubUrl: s.githubUrl
                    })),
                count: skills.length,
                coverage: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$agentSkills$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["computeCoverage"])()
            };
        }
    },
    omniroute_agent_skills_get: {
        name: "omniroute_agent_skills_get",
        description: "Get detailed metadata and SKILL.md markdown for a single agent skill by its canonical ID. Returns all skill fields plus the raw markdown content.",
        inputSchema: AgentSkillsGetSchema,
        handler: async (args)=>{
            const skill = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$agentSkills$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSkillById"])(args.id);
            if (!skill) {
                throw new Error(`Skill not found: ${args.id}`);
            }
            const markdown = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$agentSkills$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchSkillMarkdown"])(args.id);
            return {
                ...skill,
                markdown
            };
        }
    },
    omniroute_agent_skills_coverage: {
        name: "omniroute_agent_skills_coverage",
        description: "Returns the current SKILL.md coverage stats: how many of the 22 API skills and 20 CLI skills have generated SKILL.md files on the filesystem vs the catalog total.",
        inputSchema: AgentSkillsCoverageSchema,
        handler: async (_args)=>{
            const coverage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$agentSkills$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["computeCoverage"])();
            return coverage;
        }
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/mcp-server/tools/poolTools.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "browserPoolStatusInput",
    ()=>browserPoolStatusInput,
    "handleBrowserPoolStatus",
    ()=>handleBrowserPoolStatus,
    "handlePoolHealth",
    ()=>handlePoolHealth,
    "handlePoolReset",
    ()=>handlePoolReset,
    "handlePoolSessions",
    ()=>handlePoolSessions,
    "handlePoolStatus",
    ()=>handlePoolStatus,
    "handlePoolWarm",
    ()=>handlePoolWarm,
    "poolHealthInput",
    ()=>poolHealthInput,
    "poolResetInput",
    ()=>poolResetInput,
    "poolSessionsInput",
    ()=>poolSessionsInput,
    "poolStatusInput",
    ()=>poolStatusInput,
    "poolTools",
    ()=>poolTools,
    "poolWarmInput",
    ()=>poolWarmInput
]);
/**
 * OmniRoute MCP Session Pool Tools — Manage and monitor anonymous web session pools.
 *
 * Tools:
 *   1. omniroute_pool_status   — Get pool stats for one or all providers
 *   2. omniroute_pool_sessions — List per-session details for a provider's pool
 *   3. omniroute_pool_reset    — Shut down and recreate a pool
 *   4. omniroute_pool_warm     — Warm up a pool to a target session count
 *   5. omniroute_pool_health   — Aggregated pool health with breaker state and issues
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$poolRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/sessionPool/poolRegistry.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$webSessionPoolHealth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/webSessionPoolHealth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$browserPool$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/browserPool.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$webSessionPoolHealth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$webSessionPoolHealth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
const poolStatusInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().describe("Provider name (e.g. 'pollinations'). Omit to list all pools")
});
const poolSessionsInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().describe("Provider name (e.g. 'pollinations')")
});
const poolResetInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().describe("Provider name (e.g. 'pollinations')")
});
const poolWarmInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().describe("Provider name (e.g. 'pollinations')"),
    count: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(1).max(50).default(6).describe("Target session count (1–50)")
});
const poolHealthInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().describe("Provider name (e.g. 'pollinations'). Omit to list all pools")
});
async function handlePoolStatus(args) {
    if (args.provider) {
        const stats = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$poolRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PoolRegistry"].getStats(args.provider);
        if (!stats) {
            return {
                error: `No pool found for provider '${args.provider}'`
            };
        }
        return {
            provider: args.provider,
            stats
        };
    }
    const all = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$poolRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PoolRegistry"].getAllStats();
    return {
        totalPools: all.length,
        providers: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$poolRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PoolRegistry"].listProviders(),
        pools: all
    };
}
async function handlePoolSessions(args) {
    const details = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$poolRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PoolRegistry"].getSessionDetails(args.provider);
    if (!details) {
        return {
            error: `No pool found for provider '${args.provider}'`
        };
    }
    const stats = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$poolRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PoolRegistry"].getStats(args.provider);
    return {
        provider: args.provider,
        sessionCount: details.length,
        stats,
        sessions: details
    };
}
async function handlePoolReset(args) {
    const existed = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$poolRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PoolRegistry"].resetPool(args.provider);
    return {
        provider: args.provider,
        reset: existed,
        message: existed ? `Pool '${args.provider}' shut down and removed. It will be recreated on next request.` : `No pool found for provider '${args.provider}'`
    };
}
async function handlePoolWarm(args) {
    // If pool doesn't exist yet, we can't warm it
    const pool = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$poolRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PoolRegistry"].getPool(args.provider);
    if (!pool) {
        return {
            error: `No pool found for provider '${args.provider}'`
        };
    }
    const before = pool.totalCount;
    await pool.warmUp(args.count);
    const after = pool.totalCount;
    return {
        provider: args.provider,
        targetCount: args.count,
        sessionsBefore: before,
        sessionsAfter: after,
        created: after - before
    };
}
async function handlePoolHealth(args) {
    const report = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$webSessionPoolHealth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getWebSessionPoolHealth"])(args.provider);
    return report;
}
const browserPoolStatusInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({});
async function handleBrowserPoolStatus() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$browserPool$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBrowserPoolMetrics"])();
}
const poolTools = {
    omniroute_pool_status: {
        name: "omniroute_pool_status",
        description: "Returns session pool status for a specific provider or all providers. Includes session counts by state (active/cooldown/dead), request totals, success rate, and throughput.",
        scopes: [
            "read:health"
        ],
        inputSchema: poolStatusInput,
        handler: (args)=>handlePoolStatus(args)
    },
    omniroute_pool_sessions: {
        name: "omniroute_pool_sessions",
        description: "Lists all sessions in a provider's pool with per-session details: fingerprint, status, request counts, inflight, cooldown remaining, and age.",
        scopes: [
            "read:health"
        ],
        inputSchema: poolSessionsInput,
        handler: (args)=>handlePoolSessions(args)
    },
    omniroute_pool_reset: {
        name: "omniroute_pool_reset",
        description: "Shuts down and removes all sessions for a provider's pool. A new pool will be created automatically on the next request.",
        scopes: [
            "write:resilience"
        ],
        inputSchema: poolResetInput,
        handler: (args)=>handlePoolReset(args)
    },
    omniroute_pool_warm: {
        name: "omniroute_pool_warm",
        description: "Warms a session pool to the specified session count (1–50). Sessions beyond the current count are created with fresh browser fingerprints.",
        scopes: [
            "write:resilience"
        ],
        inputSchema: poolWarmInput,
        handler: (args)=>handlePoolWarm(args)
    },
    omniroute_pool_health: {
        name: "omniroute_pool_health",
        description: "Returns aggregated web-session pool health: pool stats + circuit breaker state + per-session details + health status (healthy/degraded/down) + issues list.",
        scopes: [
            "read:health"
        ],
        inputSchema: poolHealthInput,
        handler: (args)=>handlePoolHealth(args)
    },
    omniroute_browser_pool_status: {
        name: "omniroute_browser_pool_status",
        description: "Returns the stealth browser pool's live status (enabled, active contexts, browser running, stealth available, idle age) plus cumulative lifecycle telemetry: browser launches/failures, context create/reuse/evict/release counts, context-create failures, and shutdowns with the last reason.",
        scopes: [
            "read:health"
        ],
        inputSchema: browserPoolStatusInput,
        handler: ()=>handleBrowserPoolStatus()
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/mcp-server/tools/gamificationTools.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "gamificationTools",
    ()=>gamificationTools
]);
/**
 * MCP Gamification Tools — leaderboard, badges, levels, sharing.
 *
 * @module mcp-server/tools/gamificationTools
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const gamificationTools = [
    {
        name: "gamification_leaderboard",
        description: "Get leaderboard rankings for a scope (global, weekly, monthly, tokens_shared).",
        scopes: [
            "read:gamification"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            scope: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
                "global",
                "weekly",
                "monthly",
                "tokens_shared"
            ]).default("global"),
            limit: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(1).max(100).default(50)
        }),
        handler: async (args)=>{
            const { getTopN } = await __turbopack_context__.A("[project]/src/lib/gamification/leaderboard.ts [app-route] (ecmascript, async loader)");
            const entries = await getTopN(args.scope, args.limit);
            return {
                entries
            };
        }
    },
    {
        name: "gamification_rank",
        description: "Get rank for an API key in a leaderboard scope.",
        scopes: [
            "read:gamification"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            apiKeyId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
            scope: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
                "global",
                "weekly",
                "monthly",
                "tokens_shared"
            ]).default("global")
        }),
        handler: async (args)=>{
            const { getRank } = await __turbopack_context__.A("[project]/src/lib/gamification/leaderboard.ts [app-route] (ecmascript, async loader)");
            const rank = await getRank(args.apiKeyId, args.scope);
            return {
                rank
            };
        }
    },
    {
        name: "gamification_profile",
        description: "Get XP, level, and badges for an API key.",
        scopes: [
            "read:gamification"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            apiKeyId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()
        }),
        handler: async (args)=>{
            const { getXp, getBadges } = await __turbopack_context__.A("[project]/src/lib/db/gamification.ts [app-route] (ecmascript, async loader)");
            const { calculateLevel, getLevelTitle, getLevelTier } = await __turbopack_context__.A("[project]/src/lib/gamification/xp.ts [app-route] (ecmascript, async loader)");
            const { getStreak } = await __turbopack_context__.A("[project]/src/lib/gamification/streaks.ts [app-route] (ecmascript, async loader)");
            const xp = getXp(args.apiKeyId);
            const badges = getBadges(args.apiKeyId);
            const streak = await getStreak(args.apiKeyId);
            const level = xp ? calculateLevel(xp.totalXp) : 1;
            return {
                totalXp: xp?.totalXp || 0,
                level,
                title: getLevelTitle(level),
                tier: getLevelTier(level),
                streak: streak.currentStreak,
                longestStreak: streak.longestStreak,
                badges: badges.map((b)=>({
                        id: b.badgeId,
                        unlockedAt: b.unlockedAt
                    }))
            };
        }
    },
    {
        name: "gamification_badges",
        description: "List all badge definitions or earned badges for an API key.",
        scopes: [
            "read:gamification"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            apiKeyId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
            category: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional()
        }),
        handler: async (args)=>{
            const { getBadgeDefinitions, getBadges } = await __turbopack_context__.A("[project]/src/lib/db/gamification.ts [app-route] (ecmascript, async loader)");
            if (args.apiKeyId) {
                const badges = getBadges(args.apiKeyId);
                return {
                    earned: badges
                };
            }
            const definitions = getBadgeDefinitions(args.category);
            return {
                definitions
            };
        }
    },
    {
        name: "gamification_transfer",
        description: "Transfer tokens between API keys.",
        scopes: [
            "write:gamification"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            fromApiKeyId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
            toApiKeyId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
            amount: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().positive(),
            reason: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional()
        }),
        handler: async (args)=>{
            const { transferTokens } = await __turbopack_context__.A("[project]/src/lib/gamification/sharing.ts [app-route] (ecmascript, async loader)");
            const result = await transferTokens(args.fromApiKeyId, args.toApiKeyId, args.amount, args.reason);
            return result;
        }
    },
    {
        name: "gamification_invite",
        description: "Create an invite token for server connection.",
        scopes: [
            "write:gamification"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            apiKeyId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
            serverUrl: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
            maxUses: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().positive().default(1)
        }),
        handler: async (args)=>{
            const { createInvite } = await __turbopack_context__.A("[project]/src/lib/gamification/invites.ts [app-route] (ecmascript, async loader)");
            const result = await createInvite(args.apiKeyId, args.serverUrl, args.maxUses);
            return result;
        }
    },
    {
        name: "gamification_servers",
        description: "List connected community servers.",
        scopes: [
            "read:gamification"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({}),
        handler: async ()=>{
            const { listServers } = await __turbopack_context__.A("[project]/src/lib/gamification/servers.ts [app-route] (ecmascript, async loader)");
            return {
                servers: await listServers()
            };
        }
    },
    {
        name: "gamification_anomalies",
        description: "Get flagged anomalous XP activity (admin only).",
        scopes: [
            "read:gamification"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({}),
        handler: async ()=>{
            const { getAnomalies } = await __turbopack_context__.A("[project]/src/lib/gamification/antiCheat.ts [app-route] (ecmascript, async loader)");
            return {
                anomalies: await getAnomalies()
            };
        }
    }
];
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/mcp-server/tools/pluginTools.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "pluginTools",
    ()=>pluginTools
]);
/**
 * MCP Plugin Tools — 8 tools for plugin management.
 *
 * @module mcp-server/tools/pluginTools
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$plugins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/plugins.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$manager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/plugins/manager.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$manifest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/plugins/manifest.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$manager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$manifest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$manager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$manifest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
/**
 * Validate a path is safe for plugin installation.
 * Prevents directory traversal and null byte injection.
 */ function validatePluginPath(path) {
    // Reject null bytes
    if (path.includes("\0")) {
        throw new Error("Invalid path: contains null bytes");
    }
    // Must be absolute
    if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["isAbsolute"])(path)) {
        throw new Error("Path must be absolute");
    }
    // Normalize and resolve to prevent traversal
    const normalized = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["normalize"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["resolve"])(path));
    // Reject paths with traversal patterns
    if (normalized.includes("..") || normalized.includes("~")) {
        throw new Error("Invalid path: directory traversal detected");
    }
    return normalized;
}
const pluginTools = [
    {
        name: "plugin_list",
        description: "List all installed plugins with their status, hooks, and metadata.",
        scopes: [
            "read:plugins"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            status: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
                "installed",
                "active",
                "inactive",
                "error"
            ]).optional().describe("Filter by plugin status")
        }),
        handler: async (args)=>{
            const plugins = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$plugins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listPlugins"])(args.status);
            return {
                plugins: plugins.map((p)=>({
                        name: p.name,
                        version: p.version,
                        description: p.description,
                        status: p.status,
                        enabled: p.enabled === 1,
                        hooks: JSON.parse(p.hooks || "[]"),
                        permissions: JSON.parse(p.permissions || "[]"),
                        installedAt: p.installedAt,
                        activatedAt: p.activatedAt
                    }))
            };
        }
    },
    {
        name: "plugin_install",
        description: "Install a plugin from a local directory path.",
        scopes: [
            "write:plugins"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            path: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().describe("Absolute path to the plugin directory containing plugin.json")
        }),
        handler: async (args)=>{
            const safePath = validatePluginPath(args.path);
            const plugin = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$manager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pluginManager"].install(safePath);
            return {
                success: true,
                plugin: {
                    name: plugin.name,
                    version: plugin.version,
                    status: plugin.status
                }
            };
        }
    },
    {
        name: "plugin_activate",
        description: "Activate an installed plugin (loads hooks into the request pipeline).",
        scopes: [
            "write:plugins"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().describe("Plugin name (kebab-case)")
        }),
        handler: async (args)=>{
            try {
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$manager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pluginManager"].activate(args.name);
                return {
                    success: true,
                    message: `Plugin '${args.name}' activated`
                };
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                return {
                    success: false,
                    error: msg
                };
            }
        }
    },
    {
        name: "plugin_deactivate",
        description: "Deactivate an active plugin (unloads hooks from the request pipeline).",
        scopes: [
            "write:plugins"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().describe("Plugin name (kebab-case)")
        }),
        handler: async (args)=>{
            try {
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$manager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pluginManager"].deactivate(args.name);
                return {
                    success: true,
                    message: `Plugin '${args.name}' deactivated`
                };
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                return {
                    success: false,
                    error: msg
                };
            }
        }
    },
    {
        name: "plugin_uninstall",
        description: "Uninstall a plugin (deactivates, removes files, removes from DB).",
        scopes: [
            "write:plugins"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().describe("Plugin name (kebab-case)")
        }),
        handler: async (args)=>{
            try {
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$manager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pluginManager"].uninstall(args.name);
                return {
                    success: true,
                    message: `Plugin '${args.name}' uninstalled`
                };
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                return {
                    success: false,
                    error: msg
                };
            }
        }
    },
    {
        name: "plugin_configure",
        description: "Get or update a plugin's configuration.",
        scopes: [
            "write:plugins"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().describe("Plugin name"),
            config: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].record(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(), __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].unknown()).optional().describe("New config values to merge (omit to just read current config)")
        }),
        handler: async (args)=>{
            const plugin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$plugins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPluginByName"])(args.name);
            if (!plugin) return {
                success: false,
                error: `Plugin '${args.name}' not found`
            };
            if (args.config) {
                const current = JSON.parse(plugin.config || "{}");
                const merged = {
                    ...current,
                    ...args.config
                };
                // Validate merged config against configSchema if the plugin declares one
                const rawSchema = JSON.parse(plugin.configSchema || "{}");
                if (Object.keys(rawSchema).length > 0) {
                    const validation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$manifest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validatePluginConfig"])(merged, rawSchema);
                    if (!validation.valid) {
                        // Return a generic message — do NOT leak raw field-level detail externally
                        return {
                            success: false,
                            error: "Config validation failed: one or more values are invalid"
                        };
                    }
                }
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$plugins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updatePluginConfig"])(args.name, merged);
                return {
                    success: true,
                    config: merged
                };
            }
            return {
                config: JSON.parse(plugin.config || "{}"),
                configSchema: JSON.parse(plugin.configSchema || "{}")
            };
        }
    },
    {
        name: "plugin_executions",
        description: "View plugin execution metrics (from plugin_analytics table).",
        scopes: [
            "read:plugins"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().describe("Filter by plugin name"),
            limit: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(1).max(100).default(20).describe("Max results to return")
        }),
        handler: async (args)=>{
            const { getPluginAnalytics, getPluginAnalyticsSummary } = await __turbopack_context__.A("[project]/src/lib/db/plugins.ts [app-route] (ecmascript, async loader)");
            const limit = args.limit || 20;
            if (args.name) {
                const rows = getPluginAnalytics(args.name).slice(0, limit);
                return {
                    metrics: rows
                };
            }
            // No name filter: return all plugins' summaries
            const allPlugins = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$plugins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listPlugins"])();
            const metrics = allPlugins.slice(0, limit).map((p)=>getPluginAnalyticsSummary(p.name));
            return {
                metrics
            };
        }
    },
    {
        name: "plugin_scan",
        description: "Scan the plugin directory for new plugins and sync with DB.",
        scopes: [
            "write:plugins"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({}),
        handler: async ()=>{
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$manager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pluginManager"].scan();
            return {
                discovered: result.discovered,
                errors: result.errors
            };
        }
    }
];
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/mcp-server/tools/notionTools.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "notionTools",
    ()=>notionTools
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$notion$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/notion/api.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$notion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/notion.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
function requireToken() {
    const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$notion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getNotionToken"])();
    if (!token) throw new Error("Notion integration token not configured. Set it in Settings > Context Sources.");
    return token;
}
const notionTools = [
    {
        name: "notion_search",
        description: "Search pages and databases in Notion by text query. Returns matching page titles, IDs, and URL.",
        scopes: [
            "read:notion"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            query: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).max(500).describe("Search query text"),
            pageSize: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(1).max(100).default(20).describe("Results per page (max 100)"),
            startCursor: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().describe("Pagination cursor")
        }),
        handler: async (args)=>{
            const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$notion$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createNotionClient"])(requireToken());
            return client.searchPagesAndDatabases(args.query, args.startCursor, args.pageSize);
        }
    },
    {
        name: "notion_get_page",
        description: "Get the content and metadata of a Notion page by its ID.",
        scopes: [
            "read:notion"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            pageId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).describe("Notion page ID (32-char hex or UUID)")
        }),
        handler: async (args)=>{
            const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$notion$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createNotionClient"])(requireToken());
            return client.getPage(args.pageId);
        }
    },
    {
        name: "notion_list_block_children",
        description: "List all block children of a Notion block or page. Returns the block tree structure.",
        scopes: [
            "read:notion"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            blockId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).describe("Block ID to fetch children from"),
            pageSize: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(1).max(100).default(50).describe("Blocks per page (max 100)"),
            startCursor: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().describe("Pagination cursor")
        }),
        handler: async (args)=>{
            const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$notion$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createNotionClient"])(requireToken());
            return client.listBlockChildren(args.blockId, args.startCursor, args.pageSize);
        }
    },
    {
        name: "notion_query_database",
        description: "Query a Notion database with optional filters and sorts. Returns matching entries.",
        scopes: [
            "read:notion"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            databaseId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).describe("Notion database ID (32-char hex or UUID)"),
            filter: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].unknown().optional().describe("Optional filter object (Notion API filter format)"),
            sorts: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].unknown()).optional().describe("Optional sort array (Notion API sort format)"),
            pageSize: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(1).max(100).default(50).describe("Results per page (max 100)"),
            startCursor: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().describe("Pagination cursor")
        }),
        handler: async (args)=>{
            const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$notion$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createNotionClient"])(requireToken());
            return client.queryDatabase(args.databaseId, args.filter, args.sorts, args.startCursor, args.pageSize);
        }
    },
    {
        name: "notion_get_database",
        description: "Get metadata and schema of a Notion database by its ID.",
        scopes: [
            "read:notion"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            databaseId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).describe("Notion database ID (32-char hex or UUID)")
        }),
        handler: async (args)=>{
            const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$notion$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createNotionClient"])(requireToken());
            return client.getDatabase(args.databaseId);
        }
    },
    {
        name: "notion_append_blocks",
        description: "Append block children to an existing Notion block or page. Maximum 100 blocks per request.",
        scopes: [
            "write:notion"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            blockId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).describe("Target block or page ID to append to"),
            children: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].unknown()).describe("Array of block objects to append"),
            after: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().describe("Block ID to append after (position parameter)")
        }),
        handler: async (args)=>{
            const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$notion$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createNotionClient"])(requireToken());
            return client.appendBlocks(args.blockId, args.children, args.after);
        }
    }
];
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/mcp-server/tools/obsidianTools.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "obsidianTools",
    ()=>obsidianTools
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$obsidian$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/obsidian/api.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$obsidian$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/obsidian.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
function extractApiKeyId(extra) {
    const id = extra?.authInfo?.clientId;
    return typeof id === "string" && id.length > 0 && id !== "anonymous" && id !== "env-key" ? id : undefined;
}
function requireToken(apiKeyId) {
    const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$obsidian$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getObsidianConfigForApiKey"])(apiKeyId);
    if (!config.token) {
        throw new Error("Obsidian API token not configured. Set it in Settings > Context Sources" + (apiKeyId ? " or in your API key's context source settings" : "") + ".");
    }
    return config.token;
}
function getClient(apiKeyId) {
    const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$obsidian$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getObsidianConfigForApiKey"])(apiKeyId);
    const token = requireToken(apiKeyId);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$obsidian$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createObsidianClient"])(token, config.baseUrl);
}
const obsidianTools = [
    {
        name: "obsidian_check_status",
        description: "Check whether the Obsidian Local REST API is reachable and authenticated. Returns connection status.",
        scopes: [
            "read:obsidian"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({}),
        handler: async (_args, extra)=>{
            const client = getClient(extractApiKeyId(extra));
            return client.checkStatus();
        }
    },
    {
        name: "obsidian_search_simple",
        description: "Search note content in Obsidian vault by text query. Returns matching snippets with file paths.",
        scopes: [
            "read:obsidian"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            query: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).max(500).describe("Search query text"),
            contextLength: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(20).max(500).default(100).describe("Characters of context around each match")
        }),
        handler: async (args, extra)=>{
            const client = getClient(extractApiKeyId(extra));
            return client.searchSimple(args.query, args.contextLength);
        }
    },
    {
        name: "obsidian_search_structured",
        description: "Search Obsidian vault using a JSON Logic expression for complex queries (and, or, regex, path filters, etc.).",
        scopes: [
            "read:obsidian"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            jsonLogic: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].unknown().describe("JSON Logic expression for the search query")
        }),
        handler: async (args, extra)=>{
            const client = getClient(extractApiKeyId(extra));
            return client.searchStructured(args.jsonLogic);
        }
    },
    {
        name: "obsidian_read_note",
        description: "Read the full content of a note in the Obsidian vault by its vault-relative path. Optionally target a specific heading or block.",
        scopes: [
            "read:obsidian"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            path: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).describe("Vault-relative path (e.g., 'notes/my-note.md')"),
            targetType: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
                "heading",
                "block",
                "frontmatter"
            ]).optional().describe("Scope the read to a specific type of target"),
            target: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().describe("Target identifier: heading text, block index (e.g., '^block-id'), or 'frontmatter'")
        }),
        handler: async (args, extra)=>{
            const client = getClient(extractApiKeyId(extra));
            return client.readNote(args.path, args.targetType, args.target);
        }
    },
    {
        name: "obsidian_list_vault",
        description: "List files and directories in the Obsidian vault. Returns a tree of file/folder entries.",
        scopes: [
            "read:obsidian"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            path: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().default("").describe("Vault-relative directory path to list (empty for root)")
        }),
        handler: async (args, extra)=>{
            const client = getClient(extractApiKeyId(extra));
            return client.listVault(args.path);
        }
    },
    {
        name: "obsidian_get_document_map",
        description: "Get the document structure of a note as a map of headings and their line numbers.",
        scopes: [
            "read:obsidian"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            path: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).describe("Vault-relative path to the note")
        }),
        handler: async (args, extra)=>{
            const client = getClient(extractApiKeyId(extra));
            return client.getDocumentMap(args.path);
        }
    },
    {
        name: "obsidian_get_note_metadata",
        description: "Get metadata (frontmatter, tags, links, char/word count) for a note without reading its full content.",
        scopes: [
            "read:obsidian"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            path: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).describe("Vault-relative path to the note")
        }),
        handler: async (args, extra)=>{
            const client = getClient(extractApiKeyId(extra));
            return client.getNoteMetadata(args.path);
        }
    },
    {
        name: "obsidian_get_active_file",
        description: "Get the path and content of the currently active file in Obsidian.",
        scopes: [
            "read:obsidian"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({}),
        handler: async (_args, extra)=>{
            const client = getClient(extractApiKeyId(extra));
            return client.getActiveFile();
        }
    },
    {
        name: "obsidian_get_periodic_note",
        description: "Get the daily, weekly, or monthly periodic note for a given date (or today if no date specified).",
        scopes: [
            "read:obsidian"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            period: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
                "daily",
                "weekly",
                "monthly"
            ]).describe("Period type"),
            year: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().optional().describe("Year (required if month/day provided)"),
            month: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(1).max(12).optional().describe("Month"),
            day: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(1).max(31).optional().describe("Day")
        }),
        handler: async (args, extra)=>{
            const client = getClient(extractApiKeyId(extra));
            return client.getPeriodicNote(args.period, args.year, args.month, args.day);
        }
    },
    {
        name: "obsidian_get_tags",
        description: "List all tags used across the Obsidian vault with their frequencies.",
        scopes: [
            "read:obsidian"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({}),
        handler: async (_args, extra)=>{
            const client = getClient(extractApiKeyId(extra));
            return client.getTags();
        }
    },
    {
        name: "obsidian_list_commands",
        description: "List all available Obsidian commands with their IDs and names. Use IDs with obsidian_execute_command.",
        scopes: [
            "read:obsidian"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({}),
        handler: async (_args, extra)=>{
            const client = getClient(extractApiKeyId(extra));
            return client.commandList();
        }
    },
    {
        name: "obsidian_write_note",
        description: "Create or overwrite a note in the Obsidian vault with the given markdown content.",
        scopes: [
            "write:obsidian"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            path: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).describe("Vault-relative path to write to (e.g., 'notes/new-note.md')"),
            content: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).describe("Full markdown content to write")
        }),
        handler: async (args, extra)=>{
            const client = getClient(extractApiKeyId(extra));
            await client.writeNote(args.path, args.content);
            return {
                success: true,
                message: `Note written to ${args.path}`
            };
        }
    },
    {
        name: "obsidian_append_note",
        description: "Append content to an existing note. Optionally append to a specific heading or block.",
        scopes: [
            "write:obsidian"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            path: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).describe("Vault-relative path to the note"),
            content: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).describe("Markdown content to append"),
            targetType: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
                "heading",
                "block",
                "frontmatter"
            ]).optional().describe("Target type to append to"),
            target: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().describe("Target identifier (heading text, block index, or 'frontmatter')")
        }),
        handler: async (args, extra)=>{
            const client = getClient(extractApiKeyId(extra));
            await client.appendNote(args.path, args.content, args.targetType, args.target);
            return {
                success: true,
                message: `Content appended to ${args.path}`
            };
        }
    },
    {
        name: "obsidian_patch_note",
        description: "Surgically patch a note — append, prepend, or replace content at a specific heading, block, or frontmatter field.",
        scopes: [
            "write:obsidian"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            path: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).describe("Vault-relative path to the note"),
            operation: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
                "append",
                "prepend",
                "replace"
            ]).describe("Patch operation"),
            targetType: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
                "heading",
                "block",
                "frontmatter"
            ]).describe("Target type"),
            target: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).describe("Target identifier: heading text, block ID, or frontmatter key"),
            content: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).describe("Content to apply with the patch operation"),
            createTargetIfMissing: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional().default(false).describe("Create the target heading/block if it does not exist")
        }),
        handler: async (args, extra)=>{
            const client = getClient(extractApiKeyId(extra));
            return client.patchNote(args.path, args.operation, args.targetType, args.target, args.content, args.createTargetIfMissing);
        }
    },
    {
        name: "obsidian_delete_note",
        description: "Permanently delete a note from the Obsidian vault.",
        scopes: [
            "write:obsidian"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            path: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).describe("Vault-relative path to the note to delete")
        }),
        handler: async (args, extra)=>{
            const client = getClient(extractApiKeyId(extra));
            await client.deleteNote(args.path);
            return {
                success: true,
                message: `Deleted ${args.path}`
            };
        }
    },
    {
        name: "obsidian_move_note",
        description: "Move or rename a note within the Obsidian vault.",
        scopes: [
            "write:obsidian"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            path: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).describe("Current vault-relative path"),
            destination: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).describe("New vault-relative path (can include new parent directory)")
        }),
        handler: async (args, extra)=>{
            const client = getClient(extractApiKeyId(extra));
            await client.moveNote(args.path, args.destination);
            return {
                success: true,
                message: `Moved ${args.path} to ${args.destination}`
            };
        }
    },
    {
        name: "obsidian_execute_command",
        description: "Execute an Obsidian command by its command ID. Use obsidian_list_commands to discover available command IDs.",
        scopes: [
            "write:obsidian"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            commandId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).describe("Obsidian command ID (e.g., 'editor:insert-link')")
        }),
        handler: async (args, extra)=>{
            const client = getClient(extractApiKeyId(extra));
            await client.executeCommand(args.commandId);
            return {
                success: true,
                message: `Executed command: ${args.commandId}`
            };
        }
    },
    {
        name: "obsidian_open_file",
        description: "Open a file in Obsidian. If the file exists it opens in the editor; if not, it creates a new file.",
        scopes: [
            "write:obsidian"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            path: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).describe("Vault-relative path to the file to open")
        }),
        handler: async (args, extra)=>{
            const client = getClient(extractApiKeyId(extra));
            await client.openFile(args.path);
            return {
                success: true,
                message: `Opened ${args.path} in Obsidian`
            };
        }
    },
    {
        name: "obsidian_sync_status",
        description: "Get the OmniRoute sync plugin status: whether the server is running, vault name, port, uptime, and last sync results. Requires the sync auth token to be configured in OmniRoute settings.",
        scopes: [
            "read:obsidian"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({}),
        handler: async (_args, extra)=>{
            const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$obsidian$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSyncToken"])() || requireToken(extractApiKeyId(extra));
            const syncClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$obsidian$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSyncServerClient"])(token);
            return syncClient.getStatus();
        }
    },
    {
        name: "obsidian_sync_trigger",
        description: "Trigger an immediate bidirectional sync between desktop and mobile Obsidian vaults. Returns the sync result (files pulled, pushed, deleted, conflicts). Requires the sync auth token to be configured in OmniRoute settings.",
        scopes: [
            "write:obsidian"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({}),
        handler: async (_args, extra)=>{
            const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$obsidian$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSyncToken"])() || requireToken(extractApiKeyId(extra));
            const syncClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$obsidian$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSyncServerClient"])(token);
            const result = await syncClient.triggerSync();
            return {
                success: true,
                ...result
            };
        }
    },
    {
        name: "obsidian_sync_conflicts",
        description: "List unresolved sync conflicts. Each conflict shows the file path, conflict file path, and when it was detected. Requires the sync auth token to be configured in OmniRoute settings.",
        scopes: [
            "read:obsidian"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({}),
        handler: async (_args, extra)=>{
            const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$obsidian$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSyncToken"])() || requireToken(extractApiKeyId(extra));
            const syncClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$obsidian$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSyncServerClient"])(token);
            return syncClient.getConflicts();
        }
    },
    {
        name: "obsidian_sync_resolve_conflict",
        description: "Resolve a sync conflict by choosing which version to keep. Use 'local' for the mobile version, 'remote' for the desktop version, or 'keep-both' to preserve both. Requires the sync auth token to be configured in OmniRoute settings.",
        scopes: [
            "write:obsidian"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            path: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).describe("Vault-relative path of the conflicting file (without .conflict- suffix)"),
            resolution: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
                "local",
                "remote",
                "keep-both"
            ]).describe("Which version to keep: local (mobile), remote (desktop), or keep-both")
        }),
        handler: async (args, extra)=>{
            const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$obsidian$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSyncToken"])() || requireToken(extractApiKeyId(extra));
            const syncClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$obsidian$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSyncServerClient"])(token);
            const result = await syncClient.resolveConflict(args.path, args.resolution);
            return {
                success: true,
                result
            };
        }
    }
];
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/mcp-server/tools/localCorpusTools.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "localCorpusTools",
    ()=>localCorpusTools
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localCorpus$2f$configured$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/localCorpus/configured.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const localCorpusTools = [
    {
        name: "local_corpus_status",
        description: "Show whether the read-only local corpus is configured and summarize its in-memory index without exposing the absolute root path.",
        scopes: [
            "read:local-corpus"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({}).strict(),
        handler: async ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localCorpus$2f$configured$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getConfiguredLocalCorpusStatus"])()
    },
    {
        name: "local_corpus_search",
        description: "Search text files under the explicitly configured local corpus root. The index refreshes incrementally and returns relative paths with line-scoped snippets.",
        scopes: [
            "read:local-corpus"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            query: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().trim().min(1).max(500).describe("Text to search for"),
            limit: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(1).max(20).default(10).describe("Maximum results"),
            refresh: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().default(false).describe("Force an incremental rescan before searching")
        }).strict(),
        handler: async (args)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localCorpus$2f$configured$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["searchConfiguredLocalCorpus"])(args.query, {
                limit: args.limit,
                refresh: args.refresh
            })
    },
    {
        name: "local_corpus_read",
        description: "Read a bounded line range from a permitted text file under the configured local corpus root. Absolute paths and path traversal are rejected.",
        scopes: [
            "read:local-corpus"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            relativePath: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().trim().min(1).max(2_048).describe("Path relative to the corpus root"),
            startLine: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(1).optional().describe("First line to return (1-based)"),
            endLine: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(1).optional().describe("Last line to return (inclusive)")
        }).strict(),
        handler: async (args)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localCorpus$2f$configured$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readConfiguredLocalCorpus"])(args.relativePath, {
                startLine: args.startLine,
                endLine: args.endLine
            })
    }
];
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/mcp-server/descriptionCompressor.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "compressDescriptionsInPlace",
    ()=>compressDescriptionsInPlace,
    "compressMcpDescription",
    ()=>compressMcpDescription,
    "compressMcpListMetadata",
    ()=>compressMcpListMetadata,
    "compressMcpRegistryMetadata",
    ()=>compressMcpRegistryMetadata,
    "getMcpDescriptionCompressionStats",
    ()=>getMcpDescriptionCompressionStats,
    "isMcpDescriptionCompressionEnabled",
    ()=>isMcpDescriptionCompressionEnabled,
    "maybeCompressMcpDescription",
    ()=>maybeCompressMcpDescription,
    "resetMcpDescriptionCompressionStats",
    ()=>resetMcpDescriptionCompressionStats,
    "snapshotMcpDescriptionCompressionStats",
    ()=>snapshotMcpDescriptionCompressionStats
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$caveman$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/caveman.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$cavemanRules$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/cavemanRules.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$preservation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/preservation.ts [app-route] (ecmascript)");
;
;
;
const descriptionCompressionStats = {
    descriptionsCompressed: 0,
    charsBefore: 0,
    charsAfter: 0,
    charsSaved: 0,
    estimatedTokensSaved: 0
};
const persistedDescriptionCompressionStats = {
    descriptionsCompressed: 0,
    charsBefore: 0,
    charsAfter: 0,
    charsSaved: 0,
    estimatedTokensSaved: 0
};
const MCP_LIST_CONTAINER_KEYS = new Set([
    "tools",
    "prompts",
    "resources",
    "resourceTemplates"
]);
const MCP_METADATA_DESCRIPTION_FIELDS = [
    "description"
];
function isDisabledEnvValue(value) {
    return !!value && [
        "0",
        "false",
        "off",
        "no"
    ].includes(value.trim().toLowerCase());
}
function isMcpDescriptionCompressionEnabled(options = {}) {
    if (isDisabledEnvValue(process.env.OMNIROUTE_MCP_COMPRESS_DESCRIPTIONS)) return false;
    if (isDisabledEnvValue(process.env.OMNIROUTE_MCP_DESCRIPTION_COMPRESSION)) return false;
    return options.enabled !== false;
}
function compressMcpDescription(description) {
    if (!description) {
        return {
            compressed: description,
            before: 0,
            after: 0,
            changed: false
        };
    }
    const { text, blocks } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$preservation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractPreservedBlocks"])(description);
    const rules = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$cavemanRules$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRulesForContext"])("all", "full");
    const applied = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$caveman$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyRulesToText"])(text, rules).text;
    const normalized = applied.replace(/[ \t]{2,}/g, " ").replace(/[ \t]([,.;:!?])/g, "$1").replace(/\n{3,}/g, "\n\n").replace(/(^|[.!?][ \t]|\n[ \t]*)([a-z])/g, (_match, prefix, char)=>{
        return `${prefix}${char.toUpperCase()}`;
    }).trim();
    const compressed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$preservation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["restorePreservedBlocks"])(normalized, blocks);
    return {
        compressed,
        before: description.length,
        after: compressed.length,
        changed: compressed !== description
    };
}
function maybeCompressMcpDescription(description, options = {}) {
    if (!isMcpDescriptionCompressionEnabled(options)) return description;
    const result = compressMcpDescription(description);
    if (result.changed && result.after < result.before) {
        descriptionCompressionStats.descriptionsCompressed += 1;
        descriptionCompressionStats.charsBefore += result.before;
        descriptionCompressionStats.charsAfter += result.after;
        descriptionCompressionStats.charsSaved += result.before - result.after;
        descriptionCompressionStats.estimatedTokensSaved += Math.ceil((result.before - result.after) / 4);
        return result.compressed;
    }
    return description;
}
function compressDescriptionsInPlace(value, fieldNames = [
    "description"
], options = {}) {
    if (!value || typeof value !== "object") return;
    const fields = new Set(fieldNames);
    if (Array.isArray(value)) {
        for (const item of value)compressDescriptionsInPlace(item, fieldNames, options);
        return;
    }
    for (const [key, nested] of Object.entries(value)){
        if (fields.has(key) && typeof nested === "string") {
            value[key] = maybeCompressMcpDescription(nested, options);
        } else if (nested && typeof nested === "object") {
            compressDescriptionsInPlace(nested, fieldNames, options);
        }
    }
}
function clonePlainMetadata(value) {
    if (!value || typeof value !== "object") return value;
    return JSON.parse(JSON.stringify(value));
}
function compressMcpListContainersInPlace(value, options = {}) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
        for (const item of value)compressMcpListContainersInPlace(item, options);
        return;
    }
    for (const [key, nested] of Object.entries(value)){
        if (MCP_LIST_CONTAINER_KEYS.has(key) && Array.isArray(nested)) {
            compressDescriptionsInPlace(nested, MCP_METADATA_DESCRIPTION_FIELDS, options);
        } else if (nested && typeof nested === "object") {
            compressMcpListContainersInPlace(nested, options);
        }
    }
}
function compressMcpListMetadata(value, options = {}) {
    if (!isMcpDescriptionCompressionEnabled(options)) return value;
    const clone = clonePlainMetadata(value);
    compressMcpListContainersInPlace(clone, options);
    return clone;
}
function compressMcpRegistryMetadata(metadata, options = {}) {
    if (!isMcpDescriptionCompressionEnabled(options)) return metadata;
    const clone = {
        ...metadata
    };
    if (typeof clone.description === "string") {
        clone.description = maybeCompressMcpDescription(clone.description, options);
    }
    return clone;
}
function getMcpDescriptionCompressionStats() {
    return {
        ...descriptionCompressionStats
    };
}
function getUnpersistedMcpDescriptionCompressionStats() {
    return {
        descriptionsCompressed: descriptionCompressionStats.descriptionsCompressed - persistedDescriptionCompressionStats.descriptionsCompressed,
        charsBefore: descriptionCompressionStats.charsBefore - persistedDescriptionCompressionStats.charsBefore,
        charsAfter: descriptionCompressionStats.charsAfter - persistedDescriptionCompressionStats.charsAfter,
        charsSaved: descriptionCompressionStats.charsSaved - persistedDescriptionCompressionStats.charsSaved,
        estimatedTokensSaved: descriptionCompressionStats.estimatedTokensSaved - persistedDescriptionCompressionStats.estimatedTokensSaved
    };
}
async function snapshotMcpDescriptionCompressionStats() {
    const delta = getUnpersistedMcpDescriptionCompressionStats();
    if (delta.descriptionsCompressed <= 0 || delta.charsSaved <= 0 || delta.estimatedTokensSaved <= 0) {
        return {
            descriptionsCompressed: 0,
            charsBefore: 0,
            charsAfter: 0,
            charsSaved: 0,
            estimatedTokensSaved: 0
        };
    }
    const originalTokens = Math.max(delta.estimatedTokensSaved, Math.ceil(delta.charsBefore / 4));
    const compressedTokens = Math.max(0, originalTokens - delta.estimatedTokensSaved);
    const { insertCompressionAnalyticsRow } = await __turbopack_context__.A("[project]/src/lib/db/compressionAnalytics.ts [app-route] (ecmascript, async loader)");
    insertCompressionAnalyticsRow({
        timestamp: new Date().toISOString(),
        mode: "mcp-description",
        engine: "mcp-description",
        original_tokens: originalTokens,
        compressed_tokens: compressedTokens,
        tokens_saved: delta.estimatedTokensSaved,
        mcp_description_tokens_saved: delta.estimatedTokensSaved
    });
    persistedDescriptionCompressionStats.descriptionsCompressed = descriptionCompressionStats.descriptionsCompressed;
    persistedDescriptionCompressionStats.charsBefore = descriptionCompressionStats.charsBefore;
    persistedDescriptionCompressionStats.charsAfter = descriptionCompressionStats.charsAfter;
    persistedDescriptionCompressionStats.charsSaved = descriptionCompressionStats.charsSaved;
    persistedDescriptionCompressionStats.estimatedTokensSaved = descriptionCompressionStats.estimatedTokensSaved;
    return delta;
}
function resetMcpDescriptionCompressionStats() {
    descriptionCompressionStats.descriptionsCompressed = 0;
    descriptionCompressionStats.charsBefore = 0;
    descriptionCompressionStats.charsAfter = 0;
    descriptionCompressionStats.charsSaved = 0;
    descriptionCompressionStats.estimatedTokensSaved = 0;
    persistedDescriptionCompressionStats.descriptionsCompressed = 0;
    persistedDescriptionCompressionStats.charsBefore = 0;
    persistedDescriptionCompressionStats.charsAfter = 0;
    persistedDescriptionCompressionStats.charsSaved = 0;
    persistedDescriptionCompressionStats.estimatedTokensSaved = 0;
}
}),
"[project]/open-sse/mcp-server/scopeEnforcement.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "evaluateToolScopes",
    ()=>evaluateToolScopes,
    "resolveCallerScopeContext",
    ()=>resolveCallerScopeContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/schemas/tools.ts [app-route] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
function normalizeScopeList(raw) {
    if (!Array.isArray(raw)) return [];
    const normalized = raw.filter((value)=>typeof value === "string").map((value)=>value.trim()).filter(Boolean);
    return Array.from(new Set(normalized));
}
function extractMetaScopeList(meta) {
    if (!meta || typeof meta !== "object") return [];
    const metaRecord = meta;
    const direct = normalizeScopeList(metaRecord.scopes);
    if (direct.length > 0) return direct;
    const auth = metaRecord.auth;
    if (auth && typeof auth === "object") {
        const authScopes = normalizeScopeList(auth.scopes);
        if (authScopes.length > 0) return authScopes;
    }
    const omni = metaRecord.omniroute;
    if (omni && typeof omni === "object") {
        const omniScopes = normalizeScopeList(omni.scopes);
        if (omniScopes.length > 0) return omniScopes;
    }
    return [];
}
function scopeMatches(grantedScope, requiredScope) {
    if (grantedScope === "*" || grantedScope === requiredScope) {
        return true;
    }
    if (grantedScope.endsWith("*")) {
        const prefix = grantedScope.slice(0, -1);
        return requiredScope.startsWith(prefix);
    }
    return false;
}
function resolveCallerScopeContext(extra, fallbackScopes = []) {
    const callerId = typeof extra?.authInfo?.clientId === "string" && extra.authInfo.clientId.trim() || typeof extra?.sessionId === "string" && extra.sessionId.trim() || "anonymous";
    const authScopes = normalizeScopeList(extra?.authInfo?.scopes);
    if (authScopes.length > 0) {
        return {
            callerId,
            scopes: authScopes,
            source: "authInfo"
        };
    }
    const metaScopes = extractMetaScopeList(extra?._meta);
    if (metaScopes.length > 0) {
        return {
            callerId,
            scopes: metaScopes,
            source: "meta"
        };
    }
    const fallback = normalizeScopeList(fallbackScopes);
    if (fallback.length > 0) {
        return {
            callerId,
            scopes: fallback,
            source: "env"
        };
    }
    return {
        callerId,
        scopes: [],
        source: "none"
    };
}
function evaluateToolScopes(toolName, callerScopes, enforceScopes, inlineScopes) {
    const provided = normalizeScopeList(callerScopes);
    if (!enforceScopes) {
        return {
            allowed: true,
            required: [],
            provided,
            missing: []
        };
    }
    const toolScopes = inlineScopes ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["MCP_TOOL_MAP"][toolName]?.scopes;
    const required = Array.isArray(toolScopes) ? Array.from(toolScopes) : [];
    if (required.length === 0) {
        return {
            allowed: false,
            required: [],
            provided,
            missing: [],
            reason: "tool_definition_missing"
        };
    }
    const missing = required.filter((requiredScope)=>!provided.some((grantedScope)=>scopeMatches(grantedScope, requiredScope)));
    return {
        allowed: missing.length === 0,
        required,
        provided,
        missing,
        reason: missing.length > 0 ? "missing_scopes" : undefined
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/mcp-server/httpAuthContext.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getMcpHttpAuthHeadersForInternalFetch",
    ()=>getMcpHttpAuthHeadersForInternalFetch,
    "resolveMcpCallerAuthInfo",
    ()=>resolveMcpCallerAuthInfo,
    "withMcpHttpAuthContext",
    ()=>withMcpHttpAuthContext
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$async_hooks__$5b$external$5d$__$28$node$3a$async_hooks$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:async_hooks [external] (node:async_hooks, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/sse/services/auth.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeys.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const mcpHttpAuthContext = new __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$async_hooks__$5b$external$5d$__$28$node$3a$async_hooks$2c$__cjs$29$__["AsyncLocalStorage"]();
function headerValue(request, name) {
    const value = request.headers.get(name);
    return value && value.trim().length > 0 ? value : undefined;
}
function getMcpHttpAuthHeadersForInternalFetch() {
    const context = mcpHttpAuthContext.getStore();
    const headers = {};
    if (context?.authorization) headers.Authorization = context.authorization;
    if (context?.cookie) headers.Cookie = context.cookie;
    if (context?.xApiKey && context?.anthropicVersion) {
        headers["x-api-key"] = context.xApiKey;
        headers["anthropic-version"] = context.anthropicVersion;
    }
    return headers;
}
async function resolveMcpCallerAuthInfo(request) {
    const rawKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["extractApiKey"])(request, {
        allowUrl: false
    });
    if (!rawKey) return undefined;
    try {
        if (!await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isValidApiKey"])(rawKey)) return undefined;
        const meta = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getApiKeyMetadata"])(rawKey);
        if (!meta || !meta.id) return undefined;
        return {
            token: rawKey,
            clientId: String(meta.id),
            scopes: meta.scopes ?? []
        };
    } catch  {
        // Fail closed: an unresolved caller falls through to the meta/env scope
        // chain rather than ever synthesizing a false per-key scope grant.
        return undefined;
    }
}
async function withMcpHttpAuthContext(request, callback) {
    return mcpHttpAuthContext.run({
        authorization: headerValue(request, "authorization"),
        cookie: headerValue(request, "cookie"),
        xApiKey: headerValue(request, "x-api-key"),
        anthropicVersion: headerValue(request, "anthropic-version")
    }, callback);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/mcp-server/mcpCallerIdentity.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "resolveMcpCallerApiKeyId",
    ()=>resolveMcpCallerApiKeyId,
    "resolvePrincipalFromHeaders",
    ()=>resolvePrincipalFromHeaders
]);
/**
 * #5649 — resolve the MCP caller's API-key **principal id** for content stores
 * (CCR) that are keyed by principal.
 *
 * The CCR store keys blocks by `String(apiKeyInfo.id)` at compression time
 * (`chatCore` → `apiKeyInfo = getApiKeyMetadata(rawKey)`). MCP tool retrieval must
 * resolve the SAME id or the block is not found. On the MCP HTTP transports
 * (SSE / Streamable HTTP) the raw key lives in `httpAuthContext`'s
 * AsyncLocalStorage (set by `withMcpHttpAuthContext`), NOT in the tool handler's
 * `extra.authInfo` (OmniRoute authenticates with API keys, not OAuth client ids —
 * so `extra.authInfo.clientId` is never populated and the caller resolved to
 * "anonymous", producing a cross-principal store-key miss).
 *
 * On stdio transport (`omniroute --mcp`) there is no HTTP context, so we fall
 * back to the OMNIROUTE_API_KEY / ROUTER_API_KEY environment variable.
 *
 * Resolving through the same `getApiKeyMetadata` lookup keeps cross-tenant IDOR
 * isolation intact: a different key → a different id → a miss; no key → undefined
 * → the anonymous (`__anon__`) bucket, which only matches unauthenticated stores.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$httpAuthContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/httpAuthContext.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/sse/services/auth.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeys.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$httpAuthContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$httpAuthContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function resolvePrincipalFromHeaders(headers, lookup = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getApiKeyMetadata"]) {
    // Nothing to resolve without an Authorization / x-api-key header.
    if (!headers.Authorization && !headers["x-api-key"]) return undefined;
    const rawKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["extractApiKey"])({
        headers: new Headers(headers)
    }, {
        allowUrl: false
    });
    if (!rawKey) return undefined;
    try {
        const meta = await lookup(rawKey);
        return meta?.id != null && meta.id !== "" ? String(meta.id) : undefined;
    } catch  {
        // Fail closed: an unresolved principal can only reach the anonymous bucket.
        return undefined;
    }
}
async function resolveMcpCallerApiKeyId() {
    // 1. Try per-request HTTP auth headers (SSE / Streamable HTTP transport)
    const fromHeaders = await resolvePrincipalFromHeaders((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$httpAuthContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMcpHttpAuthHeadersForInternalFetch"])());
    if (fromHeaders !== undefined) return fromHeaders;
    // 2. Fallback: env var (stdio transport, no HTTP context)
    return resolvePrincipalFromEnv();
}
/**
 * Resolve the principal id from the OMNIROUTE_API_KEY (or ROUTER_API_KEY) env var.
 * Used when the MCP server runs on stdio transport and there's no HTTP context.
 * Uses the same getApiKeyMetadata() lookup as storage (chatCore.ts:1336).
 *
 * NOTE: When the key matches the configured env key, getApiKeyMetadata returns
 * `{id: "env-key"}` (not a DB row ID). This is correct — storage on the same
 * process uses the same env var and gets the same `"env-key"` principal, so the
 * store key matches.
 */ async function resolvePrincipalFromEnv() {
    const rawKey = process.env.OMNIROUTE_API_KEY || process.env.ROUTER_API_KEY;
    if (!rawKey) return undefined;
    try {
        const meta = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getApiKeyMetadata"])(rawKey);
        return meta?.id != null && meta.id !== "" ? String(meta.id) : undefined;
    } catch  {
        return undefined;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/mcp-server/tools/compressionTools.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildCcrStoreAuditInput",
    ()=>buildCcrStoreAuditInput,
    "compressionTools",
    ()=>compressionTools,
    "handleCcrDeleteTool",
    ()=>handleCcrDeleteTool,
    "handleCcrInspectTool",
    ()=>handleCcrInspectTool,
    "handleCcrListTool",
    ()=>handleCcrListTool,
    "handleCcrRetrieveTool",
    ()=>handleCcrRetrieveTool,
    "handleCcrStatsTool",
    ()=>handleCcrStatsTool,
    "handleCcrStoreTool",
    ()=>handleCcrStoreTool,
    "handleCompressionComboStats",
    ()=>handleCompressionComboStats,
    "handleCompressionConfigure",
    ()=>handleCompressionConfigure,
    "handleCompressionStatus",
    ()=>handleCompressionStatus,
    "handleListCompressionCombos",
    ()=>handleListCompressionCombos,
    "handleRtkDiscover",
    ()=>handleRtkDiscover,
    "handleRtkLearn",
    ()=>handleRtkLearn,
    "handleSetCompressionEngine",
    ()=>handleSetCompressionEngine
]);
/**
 * OmniRoute MCP Compression Tools — Manage and monitor prompt compression.
 *
 * Tools:
 *   1. omniroute_compression_status   — Get compression config, analytics, and cache stats
 *   2. omniroute_compression_configure — Update compression settings
 *   3. CCR lifecycle tools             — Store, retrieve, inspect, list, delete, and stats
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/audit.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compression$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/compression.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compressionAnalytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/compressionAnalytics.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compressionCacheStats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/compressionCacheStats.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compressionCombos$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/compressionCombos.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$descriptionCompressor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/descriptionCompressor.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/schemas/tools.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$ccrTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/schemas/ccrTools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$ccr$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/ccr/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$rawOutput$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/rawOutput.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$discover$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/discover.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$learn$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/learn.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$scopeEnforcement$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/scopeEnforcement.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$mcpCallerIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/mcpCallerIdentity.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$ccrTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$scopeEnforcement$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$mcpCallerIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$ccrTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$scopeEnforcement$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$mcpCallerIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
async function handleCompressionStatus(args, extra) {
    const start = Date.now();
    try {
        const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compression$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompressionSettings"])();
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$descriptionCompressor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["snapshotMcpDescriptionCompressionStats"])();
        const analyticsSummary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compressionAnalytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompressionAnalyticsSummary"])();
        const mcpDescriptionStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$descriptionCompressor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMcpDescriptionCompressionStats"])();
        const cacheStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compressionCacheStats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCacheStatsSummary"])();
        const result = {
            enabled: settings.enabled,
            strategy: settings.defaultMode || "standard",
            settings: {
                maxTokens: settings.autoTriggerTokens,
                autoTriggerMode: settings.autoTriggerMode ?? "lite",
                targetRatio: 0.7,
                preserveSystemPrompt: settings.preserveSystemPrompt,
                mcpDescriptionCompressionEnabled: settings.mcpDescriptionCompressionEnabled !== false
            },
            analytics: {
                totalRequests: analyticsSummary.totalRequests,
                compressedRequests: Object.values(analyticsSummary.byMode ?? {}).reduce((sum, mode)=>sum + mode.count, 0),
                tokensSaved: analyticsSummary.totalTokensSaved,
                avgCompressionRatio: analyticsSummary.avgSavingsPct,
                byMode: analyticsSummary.byMode ?? {},
                byEngine: analyticsSummary.byEngine ?? {},
                byCompressionCombo: analyticsSummary.byCompressionCombo ?? {},
                validationFallbacks: analyticsSummary.validationFallbacks,
                requestsWithReceipts: analyticsSummary.realUsage.requestsWithReceipts,
                realUsage: analyticsSummary.realUsage,
                mcpDescriptionCompression: {
                    descriptionsCompressed: mcpDescriptionStats.descriptionsCompressed,
                    charsBefore: mcpDescriptionStats.charsBefore,
                    charsAfter: mcpDescriptionStats.charsAfter,
                    charsSaved: mcpDescriptionStats.charsSaved,
                    estimatedTokensSaved: mcpDescriptionStats.estimatedTokensSaved,
                    persistedEstimatedTokensSaved: analyticsSummary.mcpDescriptionCompression.estimatedTokensSaved,
                    persistedSnapshots: analyticsSummary.mcpDescriptionCompression.snapshots,
                    source: "mcp_metadata_estimate",
                    notProviderUsage: true
                }
            },
            cacheStats: cacheStats ? {
                hits: Math.round(cacheStats.cacheHitRate * (cacheStats.totalRequests || 1)),
                misses: Math.round((1 - cacheStats.cacheHitRate) * (cacheStats.totalRequests || 1)),
                hitRate: `${(cacheStats.cacheHitRate * 100).toFixed(2)}%`,
                tokensSaved: Math.round(cacheStats.avgNetSavings)
            } : null
        };
        const duration = Date.now() - start;
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_compression_status", args, result, duration, true);
        return result;
    } catch (error) {
        const duration = Date.now() - start;
        const errorMessage = error instanceof Error ? error.message : String(error);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_compression_status", args, {
            error: errorMessage
        }, duration, false, "ERROR");
        throw error;
    }
}
async function handleCompressionConfigure(args, extra) {
    const start = Date.now();
    try {
        const updates = {};
        if (args.enabled !== undefined) {
            updates.enabled = args.enabled;
        }
        if (args.strategy !== undefined) {
            updates.defaultMode = args.strategy;
        }
        if (args.autoTriggerMode !== undefined) {
            updates.autoTriggerMode = args.autoTriggerMode;
        }
        if (args.maxTokens !== undefined) {
            updates.autoTriggerTokens = args.maxTokens;
        }
        if (args.preserveSystemPrompt !== undefined) {
            updates.preserveSystemPrompt = args.preserveSystemPrompt;
        }
        if (args.mcpDescriptionCompressionEnabled !== undefined) {
            updates.mcpDescriptionCompressionEnabled = args.mcpDescriptionCompressionEnabled;
        }
        const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compression$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateCompressionSettings"])(updates);
        const result = {
            success: true,
            updated: updates,
            settings: {
                enabled: settings.enabled,
                strategy: settings.defaultMode || "standard",
                autoTriggerMode: settings.autoTriggerMode ?? "lite",
                maxTokens: settings.autoTriggerTokens,
                targetRatio: 0.7,
                preserveSystemPrompt: settings.preserveSystemPrompt,
                mcpDescriptionCompressionEnabled: settings.mcpDescriptionCompressionEnabled !== false
            }
        };
        const duration = Date.now() - start;
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_compression_configure", args, result, duration, true);
        return result;
    } catch (error) {
        const duration = Date.now() - start;
        const errorMessage = error instanceof Error ? error.message : String(error);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_compression_configure", args, {
            error: errorMessage
        }, duration, false, "ERROR");
        throw error;
    }
}
;
;
;
;
;
;
async function resolveCcrPrincipal(extra, scopes) {
    const apiKeyPrincipal = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$mcpCallerIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveMcpCallerApiKeyId"])();
    if (apiKeyPrincipal) return apiKeyPrincipal;
    const { callerId } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$scopeEnforcement$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveCallerScopeContext"])(extra, scopes);
    return callerId === "anonymous" ? undefined : callerId;
}
function buildCcrStoreAuditInput(args) {
    return {
        bytes: Buffer.byteLength(args.content, "utf8"),
        contentType: args.contentType,
        ttlSeconds: args.ttlSeconds
    };
}
async function handleCcrStoreTool(args, extra) {
    const start = Date.now();
    const principal = await resolveCcrPrincipal(extra, [
        "write:compression"
    ]);
    const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$ccr$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tryStoreBlock"])(args.content, principal, {
        contentType: args.contentType,
        source: "mcp",
        ttlSeconds: args.ttlSeconds
    });
    const auditInput = buildCcrStoreAuditInput(args);
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$ccr$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isCcrStoreRejection"])(result)) {
        const output = {
            stored: false,
            reason: result.reason
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_ccr_store", auditInput, output, Date.now() - start, false, result.reason);
        return output;
    }
    const output = {
        stored: true,
        reference: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$ccr$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildCcrReference"])(result.hash, result.metadata.chars),
        metadata: result.metadata
    };
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_ccr_store", auditInput, output, Date.now() - start, true);
    return output;
}
async function handleCcrRetrieveTool(args, extra) {
    const start = Date.now();
    const principal = await resolveCcrPrincipal(extra, [
        "read:compression"
    ]);
    const metadata = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$ccr$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inspectCcrBlock"])(args.hash, principal);
    if (!metadata) {
        const output = {
            found: false,
            error: "CCR block not found or expired"
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_ccr_retrieve", args, output, Date.now() - start, false, "NOT_FOUND");
        return output;
    }
    if ((!args.mode || args.mode === "full") && metadata.bytes > __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$ccr$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MAX_CCR_MCP_FULL_BYTES"]) {
        const output = {
            found: true,
            tooLargeForFull: true,
            metadata,
            suggestedModes: [
                "head",
                "tail",
                "lines",
                "grep",
                "stats"
            ]
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_ccr_retrieve", args, output, Date.now() - start, true);
        return output;
    }
    const queried = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$ccr$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleCcrRetrieve"])(args, principal);
    const refreshedMetadata = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$ccr$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inspectCcrBlock"])(args.hash, principal) ?? metadata;
    const output = "content" in queried ? {
        found: true,
        metadata: refreshedMetadata,
        content: queried.content
    } : {
        found: true,
        metadata: refreshedMetadata,
        error: queried.error
    };
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_ccr_retrieve", args, {
        ...output,
        ...typeof output.content === "string" ? {
            content: `[${Buffer.byteLength(output.content, "utf8")} bytes]`
        } : {}
    }, Date.now() - start, !("error" in output), "error" in output ? "INVALID_QUERY" : undefined);
    return output;
}
async function handleCcrInspectTool(args, extra) {
    const start = Date.now();
    const principal = await resolveCcrPrincipal(extra, [
        "read:compression"
    ]);
    const metadata = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$ccr$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inspectCcrBlock"])(args.hash, principal);
    const output = metadata ? {
        found: true,
        reference: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$ccr$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildCcrReference"])(args.hash, metadata.chars),
        metadata
    } : {
        found: false
    };
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_ccr_inspect", args, output, Date.now() - start, Boolean(metadata));
    return output;
}
async function handleCcrListTool(args, extra) {
    const start = Date.now();
    const principal = await resolveCcrPrincipal(extra, [
        "read:compression"
    ]);
    const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$ccr$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listCcrBlocks"])(principal, args);
    const output = {
        ...result,
        entries: result.entries.map((metadata)=>({
                reference: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$ccr$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildCcrReference"])(metadata.hash, metadata.chars),
                metadata
            }))
    };
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_ccr_list", args, output, Date.now() - start, true);
    return output;
}
async function handleCcrDeleteTool(args, extra) {
    const start = Date.now();
    const principal = await resolveCcrPrincipal(extra, [
        "write:compression"
    ]);
    const output = {
        deleted: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$ccr$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteCcrBlock"])(args.hash, principal)
    };
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_ccr_delete", args, output, Date.now() - start, true);
    return output;
}
async function handleCcrStatsTool(args, extra) {
    const start = Date.now();
    const principal = await resolveCcrPrincipal(extra, [
        "read:compression"
    ]);
    const output = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$ccr$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCcrStoreStats"])(principal);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_ccr_stats", args, output, Date.now() - start, true);
    return output;
}
async function handleSetCompressionEngine(args) {
    const updates = {
        enabled: true
    };
    const current = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compression$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompressionSettings"])();
    if (args.engine) {
        updates.defaultMode = args.engine === "caveman" ? "standard" : args.engine;
        if (args.engine === "off") {
            updates.enabled = false;
        } else if (args.engine !== "stacked") {
            const selectedEngine = args.engine === "caveman" ? "caveman" : args.engine;
            updates.engines = Object.fromEntries(Object.entries(current.engines).map(([id, toggle])=>[
                    id,
                    {
                        ...toggle,
                        enabled: id === selectedEngine,
                        ...id === "caveman" && args.cavemanIntensity ? {
                            level: args.cavemanIntensity
                        } : {},
                        ...id === "rtk" && args.rtkIntensity ? {
                            level: args.rtkIntensity
                        } : {}
                    }
                ]));
        }
    }
    if (args.cavemanIntensity) {
        updates.cavemanConfig = {
            ...current.cavemanConfig ?? {},
            intensity: args.cavemanIntensity
        };
    }
    if (args.rtkIntensity) {
        updates.rtkConfig = {
            ...current.rtkConfig ?? {},
            intensity: args.rtkIntensity
        };
    }
    if (args.outputMode !== undefined) {
        updates.cavemanOutputMode = {
            ...current.cavemanOutputMode ?? {},
            enabled: args.outputMode
        };
    }
    const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compression$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateCompressionSettings"])(updates);
    return {
        success: true,
        settings: settings
    };
}
async function handleListCompressionCombos() {
    return {
        combos: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compressionCombos$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listCompressionCombos"])()
    };
}
async function handleCompressionComboStats(args) {
    const summary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compressionAnalytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompressionAnalyticsSummary"])(args.since === "all" ? undefined : args.since);
    if (!args.comboId) return summary;
    return {
        comboId: args.comboId,
        summary,
        combo: summary.byCompressionCombo[args.comboId] ?? {
            count: 0,
            tokensSaved: 0
        }
    };
}
// T07 — RTK learn/discover exposed via MCP (read-only; suggestions only). Mines the opt-in
// raw-output sample store, exactly like the /api/context/rtk/{discover,learn} routes.
const rtkDiscoverInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    limit: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().positive().max(2000).optional().describe("Max samples to scan (default 500)")
});
const rtkLearnInput = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    command: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).max(500).describe("The command to learn an RTK filter draft for"),
    limit: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().positive().max(2000).optional().describe("Max samples to scan (default 500)")
});
function resolveSampleLimit(limit) {
    if (!Number.isFinite(limit) || !limit || limit <= 0) return 500;
    return Math.min(2000, Math.floor(limit));
}
async function handleRtkDiscover(args) {
    const start = Date.now();
    const samples = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$rawOutput$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listRtkCommandSamples"])({
        limit: resolveSampleLimit(args.limit)
    });
    const candidates = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$discover$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["discoverRepeatedNoise"])(samples);
    const result = {
        sampleCount: samples.length,
        candidates
    };
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_rtk_discover", args, result, Date.now() - start, true);
    return result;
}
async function handleRtkLearn(args) {
    const start = Date.now();
    const command = args.command.trim();
    const targetId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$learn$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["commandToId"])(command);
    const matching = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$rawOutput$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listRtkCommandSamples"])({
        limit: resolveSampleLimit(args.limit)
    }).filter((sample)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$learn$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["commandToId"])(sample.command) === targetId);
    const filter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$learn$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["suggestFilter"])(command, matching);
    const result = {
        command,
        sampleCount: matching.length,
        filter
    };
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_rtk_learn", args, result, Date.now() - start, true);
    return result;
}
const compressionTools = {
    omniroute_compression_status: {
        name: "omniroute_compression_status",
        description: "Returns current compression configuration, strategy, analytics summary (requests compressed, tokens saved, avg ratio), and provider-aware cache statistics.",
        scopes: [
            "read:compression"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["compressionStatusInput"],
        handler: (args)=>handleCompressionStatus(args)
    },
    omniroute_compression_configure: {
        name: "omniroute_compression_configure",
        description: "Configure compression settings at runtime. Supports enabling/disabling compression, changing strategy (off/lite/standard/aggressive/ultra/rtk/stacked), adjusting maxTokens threshold, targetRatio, auto-trigger mode, system prompt preservation, and MCP description compression.",
        scopes: [
            "write:compression"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["compressionConfigureInput"],
        handler: (args)=>handleCompressionConfigure(args)
    },
    omniroute_set_compression_engine: {
        name: "omniroute_set_compression_engine",
        description: "Set the active compression engine and Caveman/RTK runtime options.",
        scopes: [
            "write:compression"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["setCompressionEngineInput"],
        handler: (args)=>handleSetCompressionEngine(args)
    },
    omniroute_list_compression_combos: {
        name: "omniroute_list_compression_combos",
        description: "List compression combos and their engine pipelines.",
        scopes: [
            "read:compression"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["listCompressionCombosInput"],
        handler: (_args)=>handleListCompressionCombos()
    },
    omniroute_compression_combo_stats: {
        name: "omniroute_compression_combo_stats",
        description: "Get compression analytics grouped by engine and compression combo.",
        scopes: [
            "read:compression"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["compressionComboStatsInput"],
        handler: (args)=>handleCompressionComboStats(args)
    },
    omniroute_ccr_store: {
        name: "omniroute_ccr_store",
        description: "Store verbatim content in the caller-isolated in-memory CCR store and return a ccr:// reference plus the compatible CCR marker. Entries expire automatically and are not persisted across restarts.",
        scopes: [
            "write:compression"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$ccrTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ccrStoreInput"],
        handler: handleCcrStoreTool
    },
    omniroute_ccr_retrieve: {
        name: "omniroute_ccr_retrieve",
        description: "Retrieve the verbatim content block stored by the CCR compression engine. " + "When a large block is compressed, a marker `[CCR retrieve hash=<24hex> chars=N]` " + "is inserted. Pass the hash from the marker to this tool to get the original text back. " + "Optional `mode` (head/tail/lines/grep/stats) retrieves a slice or summary instead of the whole block; omit for the full block. " + "Scope: read:compression. Always available (sticky-on).",
        scopes: [
            "read:compression"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$ccrTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ccrRetrieveInput"],
        handler: handleCcrRetrieveTool
    },
    omniroute_ccr_inspect: {
        name: "omniroute_ccr_inspect",
        description: "Inspect metadata for a caller-owned CCR block without returning its content.",
        scopes: [
            "read:compression"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$ccrTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ccrInspectInput"],
        handler: handleCcrInspectTool
    },
    omniroute_ccr_list: {
        name: "omniroute_ccr_list",
        description: "List paginated metadata for CCR blocks owned by the current caller.",
        scopes: [
            "read:compression"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$ccrTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ccrListInput"],
        handler: handleCcrListTool
    },
    omniroute_ccr_delete: {
        name: "omniroute_ccr_delete",
        description: "Delete a caller-owned block from the in-memory CCR store.",
        scopes: [
            "write:compression"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$ccrTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ccrDeleteInput"],
        handler: handleCcrDeleteTool
    },
    omniroute_ccr_stats: {
        name: "omniroute_ccr_stats",
        description: "Return caller-scoped CCR entry and byte usage, lifecycle counters, and in-memory store limits.",
        scopes: [
            "read:compression"
        ],
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$ccrTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ccrStatsInput"],
        handler: handleCcrStatsTool
    },
    omniroute_rtk_discover: {
        name: "omniroute_rtk_discover",
        description: "Mine the opt-in RTK raw-output sample store for recurring noise lines and return them " + "as ranked candidates the operator can turn into strip/collapse filters. Read-only; " + "suggestions only. Scope: read:compression.",
        scopes: [
            "read:compression"
        ],
        inputSchema: rtkDiscoverInput,
        handler: (args)=>handleRtkDiscover(args)
    },
    omniroute_rtk_learn: {
        name: "omniroute_rtk_learn",
        description: "Suggest an RTK filter draft for a specific command, learned from that command's captured " + "outputs in the opt-in raw-output sample store. Read-only; returns a draft for the operator " + "to review and save. Scope: read:compression.",
        scopes: [
            "read:compression"
        ],
        inputSchema: rtkLearnInput,
        handler: (args)=>handleRtkLearn(args)
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/mcp-server/toolSearch/catalog.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getAllToolDefinitions",
    ()=>getAllToolDefinitions
]);
/**
 * getAllToolDefinitions — unified catalog of all MCP tool definitions.
 *
 * Aggregates the same collections referenced by TOTAL_MCP_TOOL_COUNT in server.ts:
 *   MCP_TOOLS + memoryTools + skillTools + agentSkillTools + poolTools +
 *   gamificationTools + pluginTools + notionTools + obsidianTools
 *
 * Tolerates both Array and Record shapes. Deduplicates by name (first wins).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/schemas/tools.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$memoryTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/tools/memoryTools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$skillTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/tools/skillTools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$agentSkillTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/tools/agentSkillTools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$poolTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/tools/poolTools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$gamificationTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/tools/gamificationTools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$pluginTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/tools/pluginTools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$notionTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/tools/notionTools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$obsidianTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/tools/obsidianTools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$localCorpusTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/tools/localCorpusTools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$compressionTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/tools/compressionTools.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$memoryTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$skillTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$agentSkillTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$poolTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$gamificationTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$pluginTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$notionTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$obsidianTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$localCorpusTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$compressionTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$memoryTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$skillTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$agentSkillTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$poolTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$gamificationTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$pluginTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$notionTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$obsidianTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$localCorpusTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$compressionTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
function normalizeEntry(raw) {
    const name = typeof raw.name === "string" ? raw.name : null;
    const description = typeof raw.description === "string" ? raw.description : "";
    if (!name) return null;
    const scopes = Array.isArray(raw.scopes) ? raw.scopes.filter((s)=>typeof s === "string") : [];
    return {
        name,
        description,
        scopes,
        inputSchema: raw.inputSchema
    };
}
function collectFromArray(arr) {
    const result = [];
    for (const item of arr){
        const entry = normalizeEntry(item);
        if (entry) result.push(entry);
    }
    return result;
}
function collectFromRecord(rec) {
    return collectFromArray(Object.values(rec));
}
function collectAny(collection) {
    if (Array.isArray(collection)) return collectFromArray(collection);
    if (collection && typeof collection === "object") {
        return collectFromRecord(collection);
    }
    return [];
}
function getAllToolDefinitions() {
    const collections = [
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["MCP_TOOLS"],
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$memoryTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["memoryTools"],
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$skillTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["skillTools"],
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$agentSkillTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["agentSkillTools"],
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$poolTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["poolTools"],
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$gamificationTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["gamificationTools"],
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$pluginTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pluginTools"],
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$notionTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notionTools"],
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$obsidianTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["obsidianTools"],
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$localCorpusTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["localCorpusTools"],
        // Keep the concrete handler collection in the catalog as a parity guard. Canonical CCR
        // definitions now live in MCP_TOOLS too; deduplication below keeps each name visible once.
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$compressionTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["compressionTools"]
    ];
    const seen = new Set();
    const result = [];
    for (const collection of collections){
        for (const entry of collectAny(collection)){
            if (!seen.has(entry.name)) {
                seen.add(entry.name);
                result.push(entry);
            }
        }
    }
    return result;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/mcp-server/toolSearch/search.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * searchTools — pure lexical scoring over tool names + descriptions.
 *
 * Anti-ReDoS: never compiles `new RegExp(query)`.
 * Uses only `String.prototype.indexOf` loops (same pattern as
 * `src/lib/memory/retrieval.ts::getRelevanceScore`).
 */ __turbopack_context__.s([
    "searchTools",
    ()=>searchTools
]);
const NAME_PHRASE_BONUS = 25;
const NAME_TOKEN_BONUS = 6;
const DESC_PHRASE_BONUS = 20;
const DESC_TOKEN_BONUS = 3;
const MIN_LIMIT = 1;
const MAX_LIMIT = 25;
function countOccurrences(haystack, needle) {
    if (!needle) return 0;
    let count = 0;
    let pos = 0;
    while((pos = haystack.indexOf(needle, pos)) !== -1){
        count++;
        pos += needle.length;
    }
    return count;
}
function scoreEntry(entry, normalizedQuery, tokens) {
    const nameLower = entry.name.toLowerCase();
    const descLower = entry.description.toLowerCase();
    let score = 0;
    // Name scoring (higher weight)
    if (nameLower.includes(normalizedQuery)) {
        score += NAME_PHRASE_BONUS;
    }
    for (const token of tokens){
        score += countOccurrences(nameLower, token) * NAME_TOKEN_BONUS;
    }
    // Description scoring
    if (descLower.includes(normalizedQuery)) {
        score += DESC_PHRASE_BONUS;
    }
    for (const token of tokens){
        score += countOccurrences(descLower, token) * DESC_TOKEN_BONUS;
    }
    return score;
}
function searchTools(entries, query, limit = 8) {
    const clampedLimit = Math.max(MIN_LIMIT, Math.min(MAX_LIMIT, limit));
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];
    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
    const scored = [];
    for (const entry of entries){
        const score = scoreEntry(entry, normalizedQuery, tokens);
        if (score > 0) {
            scored.push({
                ...entry,
                score
            });
        }
    }
    scored.sort((a, b)=>{
        if (b.score !== a.score) return b.score - a.score;
        return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    });
    return scored.slice(0, clampedLimit);
}
}),
"[project]/open-sse/mcp-server/toolSearch/signature.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * zodToTsSignature — converts a Zod v4 object schema into a compact one-line
 * TypeScript function signature string. Never throws.
 *
 * Example output: `omniroute_tool_search(args: { query: string; limit?: number })`
 */ __turbopack_context__.s([
    "zodToTsSignature",
    ()=>zodToTsSignature
]);
function unwrap(field) {
    const t = field.type ?? field._def?.type;
    if (t === "optional" || t === "default" || t === "nullable") {
        const inner = field._def?.innerType;
        if (inner && typeof inner === "object") return unwrap(inner);
    }
    return field;
}
function isOptional(field) {
    const t = field.type ?? field._def?.type;
    return t === "optional";
}
function zodTypeToTs(field, depth = 0) {
    const core = unwrap(field);
    const t = core.type ?? core._def?.type;
    if (t === "string") return "string";
    if (t === "number") return "number";
    if (t === "boolean") return "boolean";
    if (t === "enum") {
        const entries = core._def?.entries;
        if (entries && typeof entries === "object") {
            const vals = Object.keys(entries);
            return vals.map((v)=>`'${v}'`).join(" | ");
        }
        return "string";
    }
    if (t === "array") {
        const element = core._def?.element;
        if (element && typeof element === "object") {
            return `${zodTypeToTs(element, depth)}[]`;
        }
        return "unknown[]";
    }
    if (t === "object" && depth < 2) {
        const shape = core.shape ?? core._def?.shape;
        if (shape && typeof shape === "object") {
            const fields = Object.entries(shape).map(([k, v])=>{
                const opt = isOptional(v) ? "?" : "";
                return `${k}${opt}: ${zodTypeToTs(v, depth + 1)}`;
            }).join("; ");
            return `{ ${fields} }`;
        }
    }
    return "unknown";
}
function zodToTsSignature(name, inputSchema) {
    if (!inputSchema) return `${name}()`;
    try {
        const schema = inputSchema;
        const t = schema.type ?? schema._def?.type;
        if (t !== "object") return `${name}()`;
        const shape = schema.shape ?? schema._def?.shape;
        if (!shape || typeof shape !== "object" || Object.keys(shape).length === 0) {
            return `${name}()`;
        }
        const fields = Object.entries(shape).map(([k, v])=>{
            const opt = isOptional(v) ? "?" : "";
            return `${k}${opt}: ${zodTypeToTs(v)}`;
        }).join("; ");
        return `${name}(args: { ${fields} })`;
    } catch  {
        return `${name}(args: object)`;
    }
}
}),
"[project]/open-sse/mcp-server/toolSearch/handler.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleToolSearch",
    ()=>handleToolSearch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$toolSearch$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/toolSearch/catalog.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$toolSearch$2f$search$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/toolSearch/search.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$toolSearch$2f$signature$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/toolSearch/signature.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$toolSearch$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$toolSearch$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
function handleToolSearch(args) {
    const entries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$toolSearch$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAllToolDefinitions"])().filter((t)=>t.name !== "omniroute_tool_search");
    const hits = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$toolSearch$2f$search$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["searchTools"])(entries, args.query, args.limit ?? 8);
    return {
        query: args.query,
        count: hits.length,
        tools: hits.map((h)=>({
                name: h.name,
                description: h.description,
                scopes: [
                    ...h.scopes
                ],
                signature: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$toolSearch$2f$signature$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["zodToTsSignature"])(h.name, h.inputSchema)
            }))
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/mcp-server/toolSearch/register.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "registerToolSearchTool",
    ()=>registerToolSearchTool
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$toolSearch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/schemas/toolSearch.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$toolSearch$2f$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/toolSearch/handler.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$toolSearch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$toolSearch$2f$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$toolSearch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$toolSearch$2f$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function registerToolSearchTool(server, withScopeEnforcement) {
    server.registerTool("omniroute_tool_search", {
        description: "Search MCP tools by keyword; returns compact one-line TS signatures for token-efficient discovery.",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$toolSearch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toolSearchInput"]
    }, withScopeEnforcement("omniroute_tool_search", (args)=>{
        const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$toolSearch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toolSearchInput"].parse(args ?? {});
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$toolSearch$2f$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleToolSearch"])(parsed);
        return Promise.resolve({
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        });
    }));
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/mcp-server/toolCount.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * countUniqueMcpTools — de-duplicated MCP tool count.
 *
 * The various tool collections registered by the MCP server (array-shaped, e.g.
 * `MCP_TOOLS`, and record-shaped, e.g. `memoryTools`) are not guaranteed disjoint by
 * tool `name` — some tools (e.g. the agent-skills trio) are intentionally defined in
 * both an array collection and a record collection for registration purposes. Summing
 * `collection.length` / `Object.keys(collection).length` across all sources therefore
 * double-counts any name that appears in more than one source.
 *
 * This helper unions every collection's tool names into a `Set` and returns the size
 * of that set, so the reported tool count always reflects distinct, user-visible tool
 * names regardless of how many internal collections a given tool happens to appear in.
 */ __turbopack_context__.s([
    "countUniqueMcpTools",
    ()=>countUniqueMcpTools
]);
function collectionNames(collection) {
    const items = Array.isArray(collection) ? collection : Object.values(collection);
    return items.map((item)=>item.name);
}
function countUniqueMcpTools(collectionsByLabel) {
    const uniqueNames = new Set();
    for (const collection of Object.values(collectionsByLabel)){
        for (const name of collectionNames(collection)){
            uniqueNames.add(name);
        }
    }
    return uniqueNames.size;
}
}),
"[project]/open-sse/mcp-server/tools/advancedTools.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleBestComboForTask",
    ()=>handleBestComboForTask,
    "handleCacheFlush",
    ()=>handleCacheFlush,
    "handleCacheStats",
    ()=>handleCacheStats,
    "handleDbHealthCheck",
    ()=>handleDbHealthCheck,
    "handleExplainRoute",
    ()=>handleExplainRoute,
    "handleGetProviderMetrics",
    ()=>handleGetProviderMetrics,
    "handleGetSessionSnapshot",
    ()=>handleGetSessionSnapshot,
    "handleOneproxyFetch",
    ()=>handleOneproxyFetch,
    "handleOneproxyRotate",
    ()=>handleOneproxyRotate,
    "handleOneproxyStats",
    ()=>handleOneproxyStats,
    "handleSetBudgetGuard",
    ()=>handleSetBudgetGuard,
    "handleSetResilienceProfile",
    ()=>handleSetResilienceProfile,
    "handleSetRoutingStrategy",
    ()=>handleSetRoutingStrategy,
    "handleSimulateRoute",
    ()=>handleSimulateRoute,
    "handleSyncPricing",
    ()=>handleSyncPricing,
    "handleTestCombo",
    ()=>handleTestCombo
]);
/**
 * OmniRoute MCP Advanced Tools — 13 intelligence tools that differentiate
 * OmniRoute from all other AI gateways.
 *
 * Tools:
 *   1. omniroute_simulate_route     — Dry-run routing simulation
 *   2. omniroute_set_budget_guard   — Session budget with degrade/block/alert
 *   3. omniroute_set_routing_strategy — Runtime strategy switch for combos
 *   4. omniroute_set_resilience_profile — Circuit breaker/retry profiles
 *   5. omniroute_test_combo         — Live test each provider in a combo
 *   6. omniroute_get_provider_metrics — Detailed per-provider metrics
 *   7. omniroute_best_combo_for_task — AI-powered combo recommendation
 *   8. omniroute_explain_route      — Post-hoc routing decision explainer
 *   9. omniroute_get_session_snapshot — Full session state snapshot
 *  10. omniroute_db_health_check   — Diagnose and repair DB state drift
 *  11. omniroute_sync_pricing      — Sync provider pricing from external source
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/audit.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$httpAuthContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/httpAuthContext.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$contracts$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/contracts/quota.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$resolveOmniRouteBaseUrl$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/resolveOmniRouteBaseUrl.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/combos/steps.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$routingStrategies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/routingStrategies.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$httpAuthContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$httpAuthContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
const OMNIROUTE_BASE_URL = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$resolveOmniRouteBaseUrl$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveOmniRouteBaseUrl"])();
const OMNIROUTE_API_KEY = process.env.OMNIROUTE_API_KEY || "";
async function apiFetch(path, options = {}) {
    const url = `${OMNIROUTE_BASE_URL}${path}`;
    const headers = {
        "Content-Type": "application/json",
        // Static env key is only a fallback; the per-caller MCP identity forwarded via
        // withMcpHttpAuthContext must win over it (#5819).
        ...OMNIROUTE_API_KEY ? {
            Authorization: `Bearer ${OMNIROUTE_API_KEY}`
        } : {},
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$httpAuthContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMcpHttpAuthHeadersForInternalFetch"])(),
        ...options.headers || {}
    };
    const response = await fetch(url, {
        ...options,
        headers,
        signal: AbortSignal.timeout(30000)
    });
    if (!response.ok) {
        const text = await response.text().catch(()=>"Unknown error");
        throw new Error(`API [${response.status}]: ${text}`);
    }
    return response.json();
}
function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
function toRecord(value) {
    return isRecord(value) ? value : {};
}
function toArrayOfRecords(value) {
    return Array.isArray(value) ? value.filter(isRecord) : [];
}
function toString(value, fallback = "") {
    return typeof value === "string" ? value : fallback;
}
function toNumber(value, fallback = 0) {
    const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim().length > 0 ? Number(value) : Number.NaN;
    return Number.isFinite(parsed) ? parsed : fallback;
}
function toBoolean(value, fallback = false) {
    return typeof value === "boolean" ? value : fallback;
}
function getComboModels(combo) {
    const directModels = toArrayOfRecords(combo.models);
    const nestedModels = toArrayOfRecords(toRecord(combo.data).models);
    const sourceModels = directModels.length > 0 ? directModels : nestedModels;
    return sourceModels.map((model)=>({
            provider: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getComboModelProvider"])(model) || ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getComboModelString"])(model) ? "unknown" : "combo"),
            model: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getComboModelString"])(model) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getComboStepTarget"])(model) || "",
            inputCostPer1M: toNumber(model.inputCostPer1M, 3.0)
        }));
}
function normalizeCombosResponse(raw) {
    if (Array.isArray(raw)) return raw.filter(isRecord);
    const source = toRecord(raw);
    return Array.isArray(source.combos) ? source.combos.filter(isRecord) : [];
}
let activeBudgetGuard = null;
const RESILIENCE_PROFILES = {
    aggressive: {
        requestQueue: {
            requestsPerMinute: 180,
            minTimeBetweenRequestsMs: 100,
            concurrentRequests: 16
        },
        connectionCooldown: {
            oauth: {
                baseCooldownMs: 30000,
                useUpstreamRetryHints: false,
                maxBackoffSteps: 4
            },
            apikey: {
                baseCooldownMs: 2000,
                useUpstreamRetryHints: true,
                maxBackoffSteps: 3
            }
        },
        providerBreaker: {
            oauth: {
                failureThreshold: 2,
                resetTimeoutMs: 30000
            },
            apikey: {
                failureThreshold: 3,
                resetTimeoutMs: 15000
            }
        }
    },
    balanced: {
        requestQueue: {
            requestsPerMinute: 100,
            minTimeBetweenRequestsMs: 200,
            concurrentRequests: 10
        },
        connectionCooldown: {
            oauth: {
                baseCooldownMs: 60000,
                useUpstreamRetryHints: false,
                maxBackoffSteps: 8
            },
            apikey: {
                baseCooldownMs: 3000,
                useUpstreamRetryHints: true,
                maxBackoffSteps: 5
            }
        },
        providerBreaker: {
            oauth: {
                failureThreshold: 3,
                resetTimeoutMs: 60000
            },
            apikey: {
                failureThreshold: 5,
                resetTimeoutMs: 30000
            }
        }
    },
    conservative: {
        requestQueue: {
            requestsPerMinute: 60,
            minTimeBetweenRequestsMs: 350,
            concurrentRequests: 6
        },
        connectionCooldown: {
            oauth: {
                baseCooldownMs: 120000,
                useUpstreamRetryHints: false,
                maxBackoffSteps: 10
            },
            apikey: {
                baseCooldownMs: 30000,
                useUpstreamRetryHints: false,
                maxBackoffSteps: 8
            }
        },
        providerBreaker: {
            oauth: {
                failureThreshold: 8,
                resetTimeoutMs: 120000
            },
            apikey: {
                failureThreshold: 8,
                resetTimeoutMs: 60000
            }
        }
    }
};
const TASK_FITNESS = {
    coding: {
        preferred: [
            "claude",
            "deepseek",
            "codex"
        ],
        traits: [
            "fast",
            "code-optimized"
        ]
    },
    review: {
        preferred: [
            "claude",
            "gemini",
            "openai"
        ],
        traits: [
            "analytical",
            "thorough"
        ]
    },
    planning: {
        preferred: [
            "gemini",
            "claude",
            "openai"
        ],
        traits: [
            "reasoning",
            "structured"
        ]
    },
    analysis: {
        preferred: [
            "gemini",
            "claude"
        ],
        traits: [
            "deep-reasoning",
            "large-context"
        ]
    },
    debugging: {
        preferred: [
            "claude",
            "deepseek",
            "codex"
        ],
        traits: [
            "code-aware",
            "fast"
        ]
    },
    documentation: {
        preferred: [
            "gemini",
            "claude",
            "openai"
        ],
        traits: [
            "clear",
            "structured"
        ]
    }
};
async function handleSimulateRoute(args) {
    const start = Date.now();
    try {
        // Fetch combos and health data for simulation
        const [combosRaw, healthRaw, quotaRaw] = await Promise.allSettled([
            apiFetch("/api/combos"),
            apiFetch("/api/monitoring/health"),
            apiFetch("/api/usage/quota")
        ]);
        const combos = combosRaw.status === "fulfilled" ? normalizeCombosResponse(combosRaw.value) : [];
        const health = healthRaw.status === "fulfilled" ? toRecord(healthRaw.value) : {};
        const quota = quotaRaw.status === "fulfilled" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$contracts$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeQuotaResponse"])(quotaRaw.value) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$contracts$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeQuotaResponse"])({});
        // Find target combo
        const targetCombo = args.combo ? combos.find((combo)=>toString(combo.id) === args.combo || toString(combo.name) === args.combo) : combos.find((combo)=>combo.enabled !== false);
        if (!targetCombo) {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            error: "No matching combo found"
                        })
                    }
                ],
                isError: true
            };
        }
        const models = getComboModels(targetCombo);
        const breakers = toArrayOfRecords(health.circuitBreakers);
        const providers = quota.providers;
        // Simulate path
        const simulatedPath = models.map((model, idx)=>{
            const cb = breakers.find((breaker)=>toString(breaker.provider) === model.provider);
            const q = providers.find((providerEntry)=>providerEntry.provider === model.provider);
            const estimatedCost = args.promptTokenEstimate / 1_000_000 * model.inputCostPer1M;
            return {
                provider: model.provider,
                model: model.model || args.model,
                probability: idx === 0 ? 0.85 : 0.15 / Math.max(models.length - 1, 1),
                estimatedCost: Math.round(estimatedCost * 10000) / 10000,
                healthStatus: toString(cb?.state, "CLOSED"),
                quotaAvailable: q?.percentRemaining ?? 100
            };
        });
        const costs = simulatedPath.map((pathEntry)=>pathEntry.estimatedCost);
        const result = {
            simulatedPath,
            fallbackTree: {
                primary: simulatedPath[0]?.provider || "unknown",
                fallbacks: simulatedPath.slice(1).map((pathEntry)=>pathEntry.provider),
                worstCaseCost: Math.max(...costs, 0),
                bestCaseCost: Math.min(...costs, 0)
            }
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_simulate_route", args, result, Date.now() - start, true);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_simulate_route", args, null, Date.now() - start, false, msg);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${msg}`
                }
            ],
            isError: true
        };
    }
}
async function handleSetBudgetGuard(args) {
    const start = Date.now();
    try {
        // Get current session cost
        let spent = 0;
        try {
            const analytics = toRecord(await apiFetch("/api/usage/analytics?period=session"));
            spent = toNumber(analytics.totalCost, 0);
        } catch  {
        /* ignore if analytics not available */ }
        activeBudgetGuard = {
            sessionId: `budget_${Date.now()}`,
            maxCost: args.maxCost,
            action: args.action,
            degradeToTier: args.degradeToTier,
            spent,
            createdAt: new Date().toISOString()
        };
        const remaining = Math.max(0, args.maxCost - spent);
        const result = {
            sessionId: activeBudgetGuard.sessionId,
            budgetTotal: args.maxCost,
            budgetSpent: Math.round(spent * 10000) / 10000,
            budgetRemaining: Math.round(remaining * 10000) / 10000,
            action: args.action,
            status: remaining <= 0 ? "exceeded" : remaining < args.maxCost * 0.2 ? "warning" : "active"
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_set_budget_guard", {
            maxCost: args.maxCost,
            action: args.action
        }, result, Date.now() - start, true);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_set_budget_guard", args, null, Date.now() - start, false, msg);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${msg}`
                }
            ],
            isError: true
        };
    }
}
async function handleSetRoutingStrategy(args) {
    const start = Date.now();
    try {
        const combos = normalizeCombosResponse(await apiFetch("/api/combos"));
        const combo = combos.find((comboEntry)=>toString(comboEntry.id) === args.comboId || toString(comboEntry.name) === args.comboId);
        if (!combo) {
            const msg = `Combo '${args.comboId}' not found`;
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_set_routing_strategy", args, null, Date.now() - start, false, msg);
            return {
                content: [
                    {
                        type: "text",
                        text: `Error: ${msg}`
                    }
                ],
                isError: true
            };
        }
        const comboId = toString(combo.id);
        if (!comboId) {
            const msg = "Matched combo has no id";
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_set_routing_strategy", args, null, Date.now() - start, false, msg);
            return {
                content: [
                    {
                        type: "text",
                        text: `Error: ${msg}`
                    }
                ],
                isError: true
            };
        }
        const comboData = toRecord(combo.data);
        const currentConfig = toRecord(Object.keys(toRecord(combo.config)).length > 0 ? combo.config : comboData.config);
        const normalizedStrategy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$routingStrategies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeRoutingStrategy"])(args.strategy);
        let nextConfig = undefined;
        if (normalizedStrategy === "auto" && args.autoRoutingStrategy) {
            const currentAutoConfig = toRecord(currentConfig.auto);
            nextConfig = {
                ...currentConfig,
                auto: {
                    ...currentAutoConfig,
                    routerStrategy: args.autoRoutingStrategy
                }
            };
        }
        const payload = {
            strategy: normalizedStrategy
        };
        if (nextConfig && Object.keys(nextConfig).length > 0) {
            payload.config = nextConfig;
        }
        const updatedCombo = toRecord(await apiFetch(`/api/combos/${encodeURIComponent(comboId)}`, {
            method: "PUT",
            body: JSON.stringify(payload)
        }));
        const updatedConfig = toRecord(updatedCombo.config);
        const resolvedAutoStrategy = toString(toRecord(updatedConfig.auto).routerStrategy) || (normalizedStrategy === "auto" ? args.autoRoutingStrategy ?? "rules" : "");
        const result = {
            success: true,
            combo: {
                id: toString(updatedCombo.id, comboId),
                name: toString(updatedCombo.name, toString(combo.name, comboId)),
                strategy: toString(updatedCombo.strategy, normalizedStrategy),
                autoRoutingStrategy: toString(updatedCombo.strategy, normalizedStrategy) === "auto" ? resolvedAutoStrategy : null
            }
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_set_routing_strategy", args, result, Date.now() - start, true);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_set_routing_strategy", args, null, Date.now() - start, false, msg);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${msg}`
                }
            ],
            isError: true
        };
    }
}
async function handleSetResilienceProfile(args) {
    const start = Date.now();
    try {
        const settings = RESILIENCE_PROFILES[args.profile];
        if (!settings) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error: Invalid profile "${args.profile}"`
                    }
                ],
                isError: true
            };
        }
        // Apply to OmniRoute via API using the plan-aligned resilience structure.
        await apiFetch("/api/resilience", {
            method: "PATCH",
            body: JSON.stringify(settings)
        });
        const result = {
            applied: true,
            profile: args.profile,
            settings
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_set_resilience_profile", args, result, Date.now() - start, true);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_set_resilience_profile", args, null, Date.now() - start, false, msg);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${msg}`
                }
            ],
            isError: true
        };
    }
}
async function handleTestCombo(args) {
    const start = Date.now();
    try {
        // Get combo details
        const combos = normalizeCombosResponse(await apiFetch("/api/combos"));
        const combo = combos.find((comboEntry)=>toString(comboEntry.id) === args.comboId || toString(comboEntry.name) === args.comboId);
        if (!combo) {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            error: `Combo "${args.comboId}" not found`
                        })
                    }
                ],
                isError: true
            };
        }
        const models = getComboModels(combo);
        const prompt = (args.testPrompt || "Say hello").slice(0, 200);
        // Test each provider in parallel
        const results = await Promise.allSettled(models.map(async (model)=>{
            const providerStart = Date.now();
            try {
                const resp = toRecord(await apiFetch("/v1/chat/completions", {
                    method: "POST",
                    body: JSON.stringify({
                        model: model.model || "auto",
                        messages: [
                            {
                                role: "user",
                                content: prompt
                            }
                        ],
                        max_tokens: 50,
                        stream: false
                    })
                }));
                const usage = toRecord(resp.usage);
                return {
                    provider: model.provider,
                    model: model.model || toString(resp.model, "unknown"),
                    success: true,
                    latencyMs: Date.now() - providerStart,
                    cost: toNumber(resp.cost, 0),
                    tokenCount: toNumber(usage.prompt_tokens, 0) + toNumber(usage.completion_tokens, 0)
                };
            } catch (err) {
                return {
                    provider: model.provider,
                    model: model.model || "unknown",
                    success: false,
                    latencyMs: Date.now() - providerStart,
                    cost: 0,
                    tokenCount: 0,
                    error: err instanceof Error ? err.message : String(err)
                };
            }
        }));
        const providerResults = results.map((r)=>r.status === "fulfilled" ? r.value : {
                provider: "unknown",
                model: "unknown",
                success: false,
                latencyMs: 0,
                cost: 0,
                tokenCount: 0,
                error: "Promise rejected"
            });
        const successful = providerResults.filter((r)=>r.success);
        const fastest = successful.sort((a, b)=>a.latencyMs - b.latencyMs)[0];
        const cheapest = successful.sort((a, b)=>a.cost - b.cost)[0];
        const result = {
            results: providerResults,
            summary: {
                totalProviders: providerResults.length,
                successful: successful.length,
                fastestProvider: fastest?.provider || "none",
                cheapestProvider: cheapest?.provider || "none"
            }
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_test_combo", {
            comboId: args.comboId
        }, result.summary, Date.now() - start, true);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_test_combo", args, null, Date.now() - start, false, msg);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${msg}`
                }
            ],
            isError: true
        };
    }
}
async function handleGetProviderMetrics(args) {
    const start = Date.now();
    try {
        const [healthRaw, quotaRaw, analyticsRaw] = await Promise.allSettled([
            apiFetch("/api/monitoring/health"),
            apiFetch(`/api/usage/quota?provider=${encodeURIComponent(args.provider)}`),
            apiFetch(`/api/usage/analytics?period=session&provider=${encodeURIComponent(args.provider)}`)
        ]);
        const health = healthRaw.status === "fulfilled" ? toRecord(healthRaw.value) : {};
        const quota = quotaRaw.status === "fulfilled" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$contracts$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeQuotaResponse"])(quotaRaw.value, {
            provider: args.provider
        }) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$contracts$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeQuotaResponse"])({});
        const analytics = analyticsRaw.status === "fulfilled" ? toRecord(analyticsRaw.value) : {};
        const cb = toArrayOfRecords(health.circuitBreakers).find((breaker)=>toString(breaker.provider) === args.provider);
        const providerQuota = quota.providers.find((p)=>p.provider === args.provider) || null;
        const result = {
            provider: args.provider,
            successRate: toNumber(analytics.successRate, 1.0),
            requestCount: toNumber(analytics.requestCount, 0),
            avgLatencyMs: toNumber(analytics.avgLatencyMs, 0),
            p50LatencyMs: toNumber(analytics.p50LatencyMs, 0),
            p95LatencyMs: toNumber(analytics.p95LatencyMs, 0),
            p99LatencyMs: toNumber(analytics.p99LatencyMs, 0),
            errorRate: toNumber(analytics.errorRate, 0),
            lastError: toString(analytics.lastError) || null,
            circuitBreakerState: toString(cb?.state, "CLOSED"),
            quotaInfo: providerQuota ? {
                used: providerQuota.quotaUsed,
                total: providerQuota.quotaTotal,
                resetAt: providerQuota.resetAt
            } : {
                used: 0,
                total: null,
                resetAt: null
            }
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_get_provider_metrics", args, result, Date.now() - start, true);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_get_provider_metrics", args, null, Date.now() - start, false, msg);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${msg}`
                }
            ],
            isError: true
        };
    }
}
async function handleBestComboForTask(args) {
    const start = Date.now();
    try {
        const fitness = TASK_FITNESS[args.taskType] || TASK_FITNESS.coding;
        const combos = normalizeCombosResponse(await apiFetch("/api/combos"));
        const enabledCombos = combos.filter((combo)=>combo.enabled !== false);
        if (enabledCombos.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            error: "No enabled combos available"
                        })
                    }
                ],
                isError: true
            };
        }
        // Score combos by task fitness
        const scored = enabledCombos.map((combo)=>{
            const models = getComboModels(combo);
            let score = 0;
            // Provider preference scoring
            for (const model of models){
                const prefIdx = fitness.preferred.indexOf(model.provider);
                if (prefIdx >= 0) score += (fitness.preferred.length - prefIdx) * 10;
            }
            // Name-based trait scoring
            const name = toString(combo.name).toLowerCase();
            for (const trait of fitness.traits){
                if (name.includes(trait)) score += 5;
            }
            // Check if it's a free combo
            const isFree = name.includes("free") || models.every((model)=>model.provider.toLowerCase().includes("free"));
            return {
                combo,
                score,
                isFree
            };
        });
        scored.sort((a, b)=>b.score - a.score);
        const best = scored[0];
        const alternatives = scored.slice(1, 4).map((s)=>({
                id: s.combo.id,
                name: s.combo.name,
                tradeoff: s.isFree ? "free but may have limits" : s.score < best.score * 0.5 ? "cheaper but slower" : "similar quality, different providers"
            }));
        const freeAlt = scored.find((s)=>s.isFree && s !== best);
        const result = {
            recommendedCombo: {
                id: best.combo.id,
                name: best.combo.name,
                reason: `Best match for "${args.taskType}": preferred providers (${fitness.preferred.slice(0, 3).join(", ")})`
            },
            alternatives,
            freeAlternative: freeAlt ? {
                id: freeAlt.combo.id,
                name: freeAlt.combo.name
            } : null
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_best_combo_for_task", args, result.recommendedCombo, Date.now() - start, true);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_best_combo_for_task", args, null, Date.now() - start, false, msg);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${msg}`
                }
            ],
            isError: true
        };
    }
}
async function handleExplainRoute(args) {
    const start = Date.now();
    try {
        // Query routing_decisions table via API
        let decision = null;
        try {
            decision = toRecord(await apiFetch(`/api/routing/decisions/${encodeURIComponent(args.requestId)}`));
        } catch  {
        // Fall back to a generic explanation
        }
        const result = decision ? {
            requestId: args.requestId,
            decision: {
                comboUsed: decision.comboUsed || "default",
                providerSelected: decision.providerSelected || "unknown",
                modelUsed: decision.modelUsed || "unknown",
                score: decision.score || 0,
                factors: decision.factors || [
                    {
                        name: "health",
                        value: 1,
                        weight: 0.3,
                        contribution: 0.3
                    },
                    {
                        name: "quota",
                        value: 1,
                        weight: 0.25,
                        contribution: 0.25
                    },
                    {
                        name: "cost",
                        value: 0.8,
                        weight: 0.2,
                        contribution: 0.16
                    },
                    {
                        name: "latency",
                        value: 0.9,
                        weight: 0.15,
                        contribution: 0.135
                    },
                    {
                        name: "task_fit",
                        value: 0.7,
                        weight: 0.1,
                        contribution: 0.07
                    }
                ],
                fallbacksTriggered: decision.fallbacksTriggered || [],
                costActual: decision.costActual || 0,
                latencyActual: decision.latencyActual || 0
            }
        } : {
            requestId: args.requestId,
            decision: {
                comboUsed: "unknown",
                providerSelected: "unknown",
                modelUsed: "unknown",
                score: 0,
                factors: [],
                fallbacksTriggered: [],
                costActual: 0,
                latencyActual: 0
            },
            note: "Routing decision not found. The /api/routing/decisions endpoint may not be implemented yet, or the requestId is invalid."
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_explain_route", args, {
            requestId: args.requestId
        }, Date.now() - start, true);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_explain_route", args, null, Date.now() - start, false, msg);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${msg}`
                }
            ],
            isError: true
        };
    }
}
async function handleSyncPricing(args) {
    const start = Date.now();
    try {
        const result = toRecord(await apiFetch("/api/pricing/sync", {
            method: "POST",
            body: JSON.stringify({
                sources: args.sources,
                dryRun: args.dryRun ?? false
            })
        }));
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_sync_pricing", args, result, Date.now() - start, true);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_sync_pricing", args, null, Date.now() - start, false, msg);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${msg}`
                }
            ],
            isError: true
        };
    }
}
async function handleGetSessionSnapshot() {
    const start = Date.now();
    try {
        const analytics = toRecord(await apiFetch("/api/usage/analytics?period=session").catch(()=>({})));
        const tokenCount = toRecord(analytics.tokenCount);
        const byModel = toArrayOfRecords(analytics.byModel);
        const byProvider = toArrayOfRecords(analytics.byProvider);
        const result = {
            sessionStart: toString(analytics.sessionStart, new Date().toISOString()),
            duration: toString(analytics.duration, "unknown"),
            requestCount: toNumber(analytics.requestCount, 0),
            costTotal: toNumber(analytics.totalCost, 0),
            tokenCount: {
                prompt: toNumber(tokenCount.prompt, 0),
                completion: toNumber(tokenCount.completion, 0)
            },
            topModels: byModel.slice(0, 5).map((model)=>({
                    model: toString(model.model, "unknown"),
                    count: toNumber(model.requests, 0)
                })),
            topProviders: byProvider.slice(0, 5).map((provider)=>({
                    provider: toString(provider.name, "unknown"),
                    count: toNumber(provider.requests, 0)
                })),
            errors: toNumber(analytics.errorCount, 0),
            fallbacks: toNumber(analytics.fallbackCount, 0),
            budgetGuard: activeBudgetGuard ? {
                active: true,
                remaining: Math.max(0, activeBudgetGuard.maxCost - activeBudgetGuard.spent),
                action: activeBudgetGuard.action
            } : null
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_get_session_snapshot", {}, {
            requestCount: result.requestCount
        }, Date.now() - start, true);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_get_session_snapshot", {}, null, Date.now() - start, false, msg);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${msg}`
                }
            ],
            isError: true
        };
    }
}
async function handleDbHealthCheck(args) {
    const start = Date.now();
    const autoRepair = args.autoRepair === true;
    try {
        const { runManagedDbHealthCheck } = await __turbopack_context__.A("[project]/src/lib/db/core.ts [app-route] (ecmascript, async loader)");
        const result = runManagedDbHealthCheck({
            autoRepair
        });
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_db_health_check", args, {
            isHealthy: toBoolean(result.isHealthy, false),
            repairedCount: toNumber(result.repairedCount, 0)
        }, Date.now() - start, true);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_db_health_check", args, null, Date.now() - start, false, msg);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${msg}`
                }
            ],
            isError: true
        };
    }
}
async function handleCacheStats() {
    const start = Date.now();
    try {
        const raw = toRecord(await apiFetch("/api/cache"));
        const semanticCache = toRecord(raw.semanticCache);
        const promptCache = raw.promptCache ? toRecord(raw.promptCache) : null;
        const idempotency = toRecord(raw.idempotency);
        const config = raw.config ? toRecord(raw.config) : null;
        const result = {
            semanticCache: {
                memoryEntries: toNumber(semanticCache.memoryEntries, 0),
                dbEntries: toNumber(semanticCache.dbEntries, 0),
                hits: toNumber(semanticCache.hits, 0),
                misses: toNumber(semanticCache.misses, 0),
                hitRate: toString(semanticCache.hitRate, "0%"),
                tokensSaved: toNumber(semanticCache.tokensSaved, 0)
            },
            promptCache: promptCache ? {
                totalRequests: toNumber(promptCache.totalRequests, 0),
                requestsWithCacheControl: toNumber(promptCache.requestsWithCacheControl, 0),
                totalInputTokens: toNumber(promptCache.totalInputTokens, 0),
                totalCachedTokens: toNumber(promptCache.totalCachedTokens, 0),
                totalCacheCreationTokens: toNumber(promptCache.totalCacheCreationTokens, 0),
                tokensSaved: toNumber(promptCache.tokensSaved, 0),
                estimatedCostSaved: toNumber(promptCache.estimatedCostSaved, 0)
            } : null,
            idempotency: {
                activeKeys: toNumber(idempotency.activeKeys, 0),
                windowMs: toNumber(idempotency.windowMs, 0)
            },
            config: config ? {
                semanticCacheEnabled: toBoolean(config.semanticCacheEnabled, true)
            } : undefined
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_cache_stats", {}, result, Date.now() - start, true);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_cache_stats", {}, null, Date.now() - start, false, msg);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${msg}`
                }
            ],
            isError: true
        };
    }
}
async function handleCacheFlush(args) {
    const start = Date.now();
    try {
        const params = new URLSearchParams();
        let scope = "all";
        if (args.signature) {
            params.set("signature", args.signature);
            scope = "signature";
        } else if (args.model) {
            params.set("model", args.model);
            scope = "model";
        }
        const query = params.toString();
        const path = query ? `/api/cache?${query}` : "/api/cache";
        const raw = toRecord(await apiFetch(path, {
            method: "DELETE"
        }));
        const result = {
            ok: toBoolean(raw.ok, true),
            invalidated: toNumber(raw.invalidated ?? raw.cleared, 0),
            scope
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_cache_flush", args, result, Date.now() - start, true);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_cache_flush", args, null, Date.now() - start, false, msg);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${msg}`
                }
            ],
            isError: true
        };
    }
}
async function handleOneproxyFetch(args = {}) {
    const start = Date.now();
    try {
        const params = new URLSearchParams();
        if (args.protocol) params.set("protocol", args.protocol);
        if (args.countryCode) params.set("countryCode", args.countryCode);
        if (args.minQuality) params.set("minQuality", String(args.minQuality));
        if (args.limit) params.set("limit", String(args.limit));
        const query = params.toString();
        const path = query ? `/api/settings/oneproxy?${query}` : "/api/settings/oneproxy";
        const raw = toRecord(await apiFetch(path));
        const items = toArrayOfRecords(raw.items).map((r)=>({
                id: toString(r.id, ""),
                host: toString(r.host, ""),
                port: toNumber(r.port, 0),
                type: toString(r.type, "http"),
                countryCode: typeof r.country_code === "string" ? r.country_code : null,
                qualityScore: r.quality_score != null ? toNumber(r.quality_score) : null,
                latencyMs: r.latency_ms != null ? toNumber(r.latency_ms) : null,
                anonymity: typeof r.anonymity === "string" ? r.anonymity : null,
                googleAccess: r.google_access === 1 || r.google_access === true,
                status: toString(r.status, "active")
            }));
        const result = {
            items,
            total: toNumber(raw.total, items.length)
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_oneproxy_fetch", args, result, Date.now() - start, true);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_oneproxy_fetch", args, null, Date.now() - start, false, msg);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${msg}`
                }
            ],
            isError: true
        };
    }
}
async function handleOneproxyRotate(args = {}) {
    const start = Date.now();
    try {
        const body = {};
        if (args.strategy) body.strategy = args.strategy;
        const raw = toRecord(await apiFetch("/api/settings/oneproxy/rotate", {
            method: "POST",
            body: JSON.stringify(body)
        }));
        const result = {
            id: toString(raw.id, ""),
            host: toString(raw.host, ""),
            port: toNumber(raw.port, 0),
            type: toString(raw.type, "http"),
            countryCode: typeof raw.country_code === "string" ? raw.country_code : null,
            qualityScore: raw.quality_score != null ? toNumber(raw.quality_score) : null,
            latencyMs: raw.latency_ms != null ? toNumber(raw.latency_ms) : null
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_oneproxy_rotate", args, result, Date.now() - start, true);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_oneproxy_rotate", args, null, Date.now() - start, false, msg);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${msg}`
                }
            ],
            isError: true
        };
    }
}
async function handleOneproxyStats(args = {}) {
    const start = Date.now();
    try {
        const raw = toRecord(await apiFetch("/api/settings/oneproxy?action=stats"));
        const statsRaw = toRecord(raw.stats);
        const statusRaw = toRecord(raw.status);
        const stats = {
            total: toNumber(statsRaw.total, 0),
            active: toNumber(statsRaw.active, 0),
            avgQuality: statsRaw.avg_quality != null ? toNumber(statsRaw.avg_quality) : null,
            lastValidated: typeof statsRaw.last_validated === "string" ? statsRaw.last_validated : null,
            byProtocol: toArrayOfRecords(statsRaw.by_protocol || statsRaw.byProtocol).map((r)=>({
                    protocol: toString(r.protocol, ""),
                    count: toNumber(r.count, 0)
                })),
            byCountry: toArrayOfRecords(statsRaw.by_country || statsRaw.byCountry).map((r)=>({
                    countryCode: toString(r.countryCode || r.country_code, ""),
                    count: toNumber(r.count, 0)
                }))
        };
        const status = {
            lastSyncSuccess: toBoolean(statusRaw.last_sync_success, false),
            lastSyncError: typeof statusRaw.last_sync_error === "string" ? statusRaw.last_sync_error : null,
            lastSyncAt: typeof statusRaw.last_sync_at === "string" ? statusRaw.last_sync_at : null,
            lastSyncCount: toNumber(statusRaw.last_sync_count, 0),
            consecutiveFailures: toNumber(statusRaw.consecutive_failures, 0)
        };
        const result = {
            stats,
            status
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_oneproxy_stats", args, result, Date.now() - start, true);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_oneproxy_stats", args, null, Date.now() - start, false, msg);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${msg}`
                }
            ],
            isError: true
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/mcp-server/tools/pickFastestModel.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handlePickFastestModel",
    ()=>handlePickFastestModel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/audit.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$httpAuthContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/httpAuthContext.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$contracts$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/contracts/quota.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$resolveOmniRouteBaseUrl$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/resolveOmniRouteBaseUrl.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/combos/steps.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$speedRanking$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/speedRanking.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$httpAuthContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$httpAuthContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
const OMNIROUTE_BASE_URL = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$resolveOmniRouteBaseUrl$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveOmniRouteBaseUrl"])();
const OMNIROUTE_API_KEY = process.env.OMNIROUTE_API_KEY || "";
async function apiFetch(path, options = {}) {
    const url = `${OMNIROUTE_BASE_URL}${path}`;
    const headers = {
        "Content-Type": "application/json",
        ...OMNIROUTE_API_KEY ? {
            Authorization: `Bearer ${OMNIROUTE_API_KEY}`
        } : {},
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$httpAuthContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMcpHttpAuthHeadersForInternalFetch"])(),
        ...options.headers || {}
    };
    const response = await fetch(url, {
        ...options,
        headers,
        signal: AbortSignal.timeout(30000)
    });
    if (!response.ok) {
        const text = await response.text().catch(()=>"Unknown error");
        throw new Error(`API [${response.status}]: ${text}`);
    }
    return response.json();
}
function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
function toRecord(value) {
    return isRecord(value) ? value : {};
}
function toArrayOfRecords(value) {
    return Array.isArray(value) ? value.filter(isRecord) : [];
}
function toString(value, fallback = "") {
    return typeof value === "string" ? value : fallback;
}
function toNumber(value, fallback = 0) {
    const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim().length > 0 ? Number(value) : Number.NaN;
    return Number.isFinite(parsed) ? parsed : fallback;
}
function getComboModels(combo) {
    const directModels = toArrayOfRecords(combo.models);
    const nestedModels = toArrayOfRecords(toRecord(combo.data).models);
    const sourceModels = directModels.length > 0 ? directModels : nestedModels;
    return sourceModels.map((model)=>({
            provider: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getComboModelProvider"])(model) || ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getComboModelString"])(model) ? "unknown" : "combo"),
            model: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getComboModelString"])(model) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getComboStepTarget"])(model) || "",
            inputCostPer1M: toNumber(model.inputCostPer1M, 3.0)
        }));
}
function normalizeCombosResponse(raw) {
    if (Array.isArray(raw)) return raw.filter(isRecord);
    const source = toRecord(raw);
    return Array.isArray(source.combos) ? source.combos.filter(isRecord) : [];
}
function settledValue(result) {
    return result.status === "fulfilled" ? result.value : undefined;
}
async function fetchTelemetrySources() {
    const [combosRaw, healthRaw, quotaRaw, analyticsRaw] = await Promise.allSettled([
        apiFetch("/api/combos"),
        apiFetch("/api/monitoring/health"),
        apiFetch("/api/usage/quota"),
        apiFetch("/api/usage/analytics?period=session")
    ]);
    const analytics = toRecord(settledValue(analyticsRaw));
    return {
        combos: normalizeCombosResponse(settledValue(combosRaw)),
        breakers: toArrayOfRecords(toRecord(settledValue(healthRaw)).circuitBreakers),
        providers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$contracts$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeQuotaResponse"])(settledValue(quotaRaw) ?? {}).providers,
        analyticsByProvider: toRecord(toRecord(analytics.byProvider)),
        analyticsTop: analytics
    };
}
function selectComboScope(combos, comboId) {
    const targetCombo = comboId ? combos.find((combo)=>toString(combo.id) === comboId || toString(combo.name) === comboId) : undefined;
    return {
        targetCombo,
        scopedCombos: targetCombo ? [
            targetCombo
        ] : combos.filter((combo)=>combo.enabled !== false)
    };
}
function noCandidatesResult(error) {
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({
                    error
                })
            }
        ],
        isError: true
    };
}
function providerAnalytics(sources, provider) {
    const perProvider = toRecord(sources.analyticsByProvider[provider]);
    return perProvider.requests ? perProvider : toRecord(sources.analyticsTop.byProvider && toRecord(sources.analyticsTop.byProvider)[provider]);
}
function buildCandidate(model, sources) {
    const cb = sources.breakers.find((breaker)=>toString(breaker.provider) === model.provider);
    const q = sources.providers.find((providerEntry)=>providerEntry.provider === model.provider);
    const analytics = providerAnalytics(sources, model.provider);
    const cbState = toString(cb?.state, "CLOSED");
    const p95 = toNumber(analytics.p95LatencyMs, NaN);
    const errorRate = toNumber(analytics.errorRate, 0);
    return {
        provider: model.provider,
        model: model.model,
        circuitBreakerState: cbState,
        avgE2ELatencyMs: toNumber(analytics.avgLatencyMs, NaN),
        p95LatencyMs: Number.isFinite(p95) ? p95 : 0,
        avgTokensPerSecond: toNumber(analytics.avgTokensPerSecond ?? analytics.tps, NaN),
        avgTtftMs: toNumber(analytics.avgTtftMs ?? analytics.ttftMs, NaN),
        latencyStdDev: toNumber(analytics.latencyStdDev, NaN),
        errorRate: Number.isFinite(errorRate) ? errorRate : 0,
        failureRate: Number.isFinite(errorRate) ? errorRate : 0,
        quotaRemaining: q?.quotaUsed != null && q?.quotaTotal ? Math.max(0, 100 - q.quotaUsed / q.quotaTotal * 100) : 100,
        quotaTotal: q?.quotaTotal ?? 100,
        costPer1MTokens: [REDIGIDO-PRESERVACAO] ?? 0
    };
}
function buildSpeedCandidates(scopedCombos, sources) {
    const speedCandidates = [];
    for (const combo of scopedCombos){
        for (const model of getComboModels(combo)){
            if (model.provider && model.model) speedCandidates.push(buildCandidate(model, sources));
        }
    }
    return speedCandidates;
}
function candidateCompletenessScore(candidate) {
    return (candidate.circuitBreakerState ? 1 : 0) + (candidate.quotaRemaining != null ? 1 : 0);
}
function dedupeCandidates(candidates) {
    const deduped = new Map();
    for (const candidate of candidates){
        const key = `${candidate.provider}::${candidate.model}`;
        const existing = deduped.get(key);
        if (!existing || candidateCompletenessScore(candidate) > candidateCompletenessScore(existing)) {
            deduped.set(key, candidate);
        }
    }
    return [
        ...deduped.values()
    ];
}
async function applyWinnerToCombo(targetCombo, winner) {
    const comboId = toString(targetCombo.id);
    const comboData = toRecord(targetCombo.data);
    const baseConfig = toRecord(targetCombo.config);
    const currentConfig = Object.keys(baseConfig).length > 0 ? baseConfig : toRecord(comboData.config);
    const nextConfig = {
        ...currentConfig,
        auto: {
            ...toRecord(currentConfig.auto),
            routerStrategy: "latency"
        }
    };
    const updatedCombo = toRecord(await apiFetch(`/api/combos/${encodeURIComponent(comboId)}`, {
        method: "PUT",
        body: JSON.stringify({
            strategy: "auto",
            config: nextConfig
        })
    }));
    const updatedConfig = toRecord(updatedCombo.config);
    return {
        id: toString(updatedCombo.id, comboId),
        name: toString(updatedCombo.name, toString(targetCombo.name, comboId)),
        strategy: toString(updatedCombo.strategy, "auto"),
        autoRoutingStrategy: toString(toRecord(updatedConfig.auto).routerStrategy, "latency")
    };
}
async function handlePickFastestModel(args) {
    const start = Date.now();
    try {
        const sources = await fetchTelemetrySources();
        const { targetCombo, scopedCombos } = selectComboScope(sources.combos, args.comboId);
        if (scopedCombos.length === 0) {
            return noCandidatesResult("No matching combos available");
        }
        const finalCandidates = dedupeCandidates(buildSpeedCandidates(scopedCombos, sources));
        if (finalCandidates.length === 0) {
            return noCandidatesResult("No provider×model candidates available to rank");
        }
        const weights = args.weights ? {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$speedRanking$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_SPEED_WEIGHTS"],
            ...args.weights
        } : __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$speedRanking$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_SPEED_WEIGHTS"];
        const ranked = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$speedRanking$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rankBySpeed"])(finalCandidates, weights, {
            includeUnhealthy: args.includeUnhealthy === true
        });
        const limit = Math.min(Math.max(toNumber(args.limit, 10), 1), 50);
        const trimmed = ranked.slice(0, limit);
        const winner = trimmed[0];
        let appliedToCombo = null;
        if (args.applyToCombo && targetCombo && winner) {
            appliedToCombo = await applyWinnerToCombo(targetCombo, winner);
        }
        const result = {
            fastest: winner ? {
                provider: winner.provider,
                model: winner.model,
                score: winner.score,
                reason: winner.reason
            } : null,
            ranked: trimmed.map((entry)=>({
                    provider: entry.provider,
                    model: entry.model,
                    score: entry.score,
                    factors: entry.factors,
                    metrics: entry.metrics,
                    reason: entry.reason
                })),
            weights,
            comboScope: targetCombo ? {
                id: toString(targetCombo.id),
                name: toString(targetCombo.name)
            } : null,
            appliedToCombo
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_pick_fastest_model", args, result, Date.now() - start, true);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_pick_fastest_model", args, null, Date.now() - start, false, msg);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${msg}`
                }
            ],
            isError: true
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/mcp-server/tools/githubSkillTools.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

/**
 * githubSkillTools.ts — MCP tools for GitHub agent skill discovery and import.
 *
 * Provides tools to:
 *   - Search GitHub for repos with SKILL.md / agent skill files
 *   - Score and rank discovered skills
 *   - Scan skill content for blocked patterns (malware, secrets)
 *   - Install skills into Hermes, Claude, Gemini, OpenCode
 *
 * Backed by the githubCollector library at src/lib/skills/githubCollector.ts.
 */ __turbopack_context__.s([
    "githubSkillTools",
    ()=>githubSkillTools
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$githubCollector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/skills/githubCollector.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$githubCollector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$githubCollector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
// ── Handlers ─────────────────────────────────────────────────────────────────
async function handleSearch(args) {
    const { repos, errors } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$githubCollector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["searchGitHubSkills"])({
        minStars: args.minStars,
        maxResults: args.maxResults
    });
    let filtered = repos;
    if (args.minScore > 0) filtered = filtered.filter((r)=>r.score >= args.minScore);
    if (args.query) {
        const q = args.query.toLowerCase();
        filtered = filtered.filter((r)=>r.fullName.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
    }
    return {
        skills: filtered.map((r)=>({
                fullName: r.fullName,
                stars: r.stars,
                score: r.score,
                description: r.description.slice(0, 200),
                topics: r.topics,
                htmlUrl: r.htmlUrl,
                hasSkillFile: r.hasSkillFile,
                license: r.license
            })),
        total: filtered.length,
        errors: errors.length > 0 ? errors : undefined
    };
}
async function handleScan(args) {
    const findings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$githubCollector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["scanText"])(args.content, args.repoName);
    return {
        repoName: args.repoName,
        clean: findings.length === 0,
        findings: findings.map((f)=>({
                pattern: f.pattern,
                context: f.context
            }))
    };
}
async function handleInstall(args) {
    const results = [];
    const skillName = args.repoName.split("/").pop() || args.repoName;
    for (const target of args.targets){
        try {
            const dest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$githubCollector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveInstallPath"])(target, skillName, args.description);
            // In a real implementation, this would clone the repo and copy files.
            // For now, we return the planned install path as a dry-run result — matches
            // the honest `action: "planned"` the REST route (/api/github-skills POST)
            // reports for the same operation.
            results.push({
                target,
                ok: true,
                action: "planned",
                destDir: dest
            });
        } catch (err) {
            results.push({
                target,
                ok: false,
                action: "error",
                error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err.message)
            });
        }
    }
    return {
        repoName: args.repoName,
        skillName,
        results,
        allOk: results.every((r)=>r.ok)
    };
}
const githubSkillTools = {
    omniroute_github_skills_search: {
        name: "omniroute_github_skills_search",
        description: "Search GitHub for agent skill repositories that contain SKILL.md, CLAUDE.md, .cursorrules, or similar agent configuration files. " + "Returns scored results sorted by relevance. Scores are 0.0–1.0 based on stars, name signals, description keywords, and topic tags. " + "Ideal for discovering community agent skills from GitHub.",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$githubCollector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GitHubSkillsSearchSchema"],
        scopes: [
            "read:skills"
        ],
        handler: handleSearch
    },
    omniroute_github_skills_scan: {
        name: "omniroute_github_skills_scan",
        description: "Scan SKILL.md or README content from a GitHub repo for blocked patterns including eval(base64), " + "hardcoded secrets (API keys, passwords, private keys), dangerous function calls (os.system, subprocess.Popen), " + "and other malware indicators. Returns findings with context or 'clean' status.",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$githubCollector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GitHubSkillsScanSchema"],
        scopes: [
            "read:skills"
        ],
        handler: handleScan
    },
    omniroute_github_skills_install: {
        name: "omniroute_github_skills_install",
        description: "Preview or plan the installation of a discovered GitHub skill into one or more agent directories " + "(Hermes: ~/AppData/Local/hermes/skills/, Claude: ~/.claude/skills/, Gemini: ~/.gemini/skills/, " + "OpenCode: ~/.opencode/skills/). Categorizes the skill based on its name and description. " + "Returns the target paths where the skill would be installed.",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$githubCollector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GitHubSkillsInstallSchema"],
        scopes: [
            "read:skills",
            "write:skills"
        ],
        handler: handleInstall
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/mcp-server/toolCardinality.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateManifestTokens",
    ()=>estimateManifestTokens,
    "readMcpToolProfileFromEnv",
    ()=>readMcpToolProfileFromEnv,
    "reduceToolManifest",
    ()=>reduceToolManifest
]);
/**
 * MCP Tool Cardinality Reduction — TV5 / F4.3
 *
 * Pure, stateless utility for reducing a tool manifest to the subset
 * permitted by a caller profile. Announcing fewer tools in the MCP
 * manifest saves tokens in the model's context window ("layer 5"
 * compression).
 *
 * ACTIVATION NOTE: The live MCP server registration loop in server.ts is
 * UNCHANGED by this file. This is a pure utility; wiring it into the server
 * startup path is a separate follow-up task. The default server behaviour
 * remains identical to before.
 *
 * Key rules for reduceToolManifest:
 *  1. A tool is kept if any of its scopes intersects `allowScopes` (when set).
 *  2. A tool listed in `allowTools` is always kept (regardless of scopes).
 *  3. A tool listed in `denyTools` is always removed (takes priority over
 *     both allowScopes and allowTools).
 *  4. When neither `allowScopes` nor `allowTools` is present the profile
 *     allows everything — the full manifest is returned unchanged.
 *  5. If `maxTools` is set the result is capped: allowTools-listed entries
 *     come first, then the remaining entries sorted by name. Deterministic.
 *  6. Input is never mutated.
 *  7. Return type mirrors the input type: array → array, object → object.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/stats.ts [app-route] (ecmascript)");
;
// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------
/**
 * Returns true when `grantedScope` covers `requiredScope`.
 * Mirrors the matching logic in scopeEnforcement.ts.
 */ function scopeMatches(grantedScope, requiredScope) {
    if (grantedScope === "*" || grantedScope === requiredScope) {
        return true;
    }
    if (grantedScope.endsWith("*")) {
        const prefix = grantedScope.slice(0, -1);
        return requiredScope.startsWith(prefix);
    }
    return false;
}
/**
 * Returns true if any scope in `toolScopes` is covered by any scope in
 * `allowScopes`.
 */ function scopeIntersects(toolScopes, allowScopes) {
    for (const ts of toolScopes){
        for (const as of allowScopes){
            if (scopeMatches(as, ts)) {
                return true;
            }
        }
    }
    return false;
}
/**
 * Applies profile filtering to a flat array of entries.
 * Returns a new array (does not mutate input).
 */ function filterEntries(entries, profile) {
    const allowScopes = profile.allowScopes ?? [];
    const allowTools = profile.allowTools ?? [];
    const denyTools = profile.denyTools ?? [];
    const denySet = new Set(denyTools);
    const allowToolSet = new Set(allowTools);
    // No filtering rules → return all entries unchanged.
    const hasFilter = allowScopes.length > 0 || allowTools.length > 0;
    // Step 1: filter by scope / explicit allow, then apply deny.
    const filtered = entries.filter((entry)=>{
        // Deny always wins.
        if (denySet.has(entry.name)) return false;
        // No filter → keep everything.
        if (!hasFilter) return true;
        // Explicit allow-list overrides scope checks.
        if (allowToolSet.has(entry.name)) return true;
        // Scope intersection.
        if (allowScopes.length > 0 && (entry.scopes?.length ?? 0) > 0) {
            return scopeIntersects(entry.scopes, allowScopes);
        }
        return false;
    });
    // Step 2: cap by maxTools. A negative max would silently drop tail entries via
    // slice(0, -n) — treat max < 0 as "no cap" (invalid-state guard).
    const max = profile.maxTools;
    if (max === undefined || max < 0 || filtered.length <= max) {
        return filtered;
    }
    // Priority ordering: allowTools-listed entries first (by name asc),
    // then the rest by name asc. Both groups are sorted for determinism.
    const prioritised = filtered.filter((e)=>allowToolSet.has(e.name)).sort((a, b)=>a.name.localeCompare(b.name));
    const rest = filtered.filter((e)=>!allowToolSet.has(e.name)).sort((a, b)=>a.name.localeCompare(b.name));
    return [
        ...prioritised,
        ...rest
    ].slice(0, max);
}
function reduceToolManifest(manifest, profile) {
    if (Array.isArray(manifest)) {
        return filterEntries(manifest, profile);
    }
    // Object/Record variant: convert → filter → convert back.
    const entries = Object.values(manifest);
    const filtered = filterEntries(entries, profile);
    return Object.fromEntries(filtered.map((e)=>[
            e.name,
            e
        ]));
}
function estimateManifestTokens(manifest) {
    const entries = Array.isArray(manifest) ? manifest : Object.values(manifest);
    if (entries.length === 0) return 0;
    return entries.reduce((sum, entry)=>{
        const nameTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateCompressionTokens"])(entry.name);
        const descTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateCompressionTokens"])(entry.description ?? "");
        return sum + nameTokens + descTokens;
    }, 0);
}
function readMcpToolProfileFromEnv(env) {
    const parse = (value)=>value ? value.split(",").map((s)=>s.trim()).filter(Boolean) : [];
    const denyTools = parse(env["MCP_TOOL_DENY"]);
    const allowTools = parse(env["MCP_TOOL_ALLOW"]);
    if (denyTools.length === 0 && allowTools.length === 0) return null;
    return {
        name: "env",
        ...denyTools.length > 0 ? {
            denyTools
        } : {},
        ...allowTools.length > 0 ? {
            allowTools
        } : {}
    };
}
}),
"[project]/open-sse/mcp-server/catalog.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getMcpModelsCatalog",
    ()=>getMcpModelsCatalog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/requestDefaults.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/noauth.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toString(value, fallback = "") {
    return typeof value === "string" ? value : fallback;
}
function toStringArray(value, fallback = []) {
    return Array.isArray(value) ? value.map((item)=>String(item)) : fallback;
}
function buildProviderAliasMap() {
    const aliasMap = {};
    for (const provider of Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["AI_PROVIDERS"])){
        if (!provider?.id) continue;
        aliasMap[provider.id] = provider.id;
        if (typeof provider.alias === "string" && provider.alias.length > 0) {
            aliasMap[provider.alias] = provider.id;
        }
    }
    for (const provider of Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NOAUTH_PROVIDERS"])){
        if (!provider?.id) continue;
        aliasMap[provider.id] = provider.id;
        if ("alias" in provider && typeof provider.alias === "string" && provider.alias.length > 0) {
            aliasMap[provider.alias] = provider.id;
        }
    }
    return aliasMap;
}
function normalizeCapability(value) {
    switch(value){
        case "embeddings":
            return "embedding";
        case "images":
            return "image";
        case "videos":
            return "video";
        case "moderations":
            return "moderation";
        case "chat-completions":
            return "chat";
        default:
            return value;
    }
}
function getCatalogModelCapabilities(model) {
    if (Array.isArray(model.capabilities) && model.capabilities.length > 0) {
        return toStringArray(model.capabilities, [
            "chat"
        ]).map(normalizeCapability);
    }
    if (Array.isArray(model.supportedEndpoints) && model.supportedEndpoints.length > 0) {
        return toStringArray(model.supportedEndpoints, [
            "chat"
        ]).map(normalizeCapability);
    }
    const type = toString(model.type);
    if (type) return [
        normalizeCapability(type)
    ];
    return [
        "chat"
    ];
}
function normalizeCatalogStatus(model, source, warning) {
    const explicitStatus = toString(model.status);
    if (explicitStatus === "available" || explicitStatus === "degraded" || explicitStatus === "unavailable") {
        return explicitStatus;
    }
    if (warning || source === "local_catalog") return "degraded";
    return "available";
}
function getConnectionThinkingEffort(connection) {
    const provider = typeof connection.provider === "string" ? connection.provider : null;
    const providerSpecificData = toRecord(connection.providerSpecificData);
    if (provider === "codex") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCodexRequestDefaults"])(providerSpecificData).reasoningEffort || "medium";
    }
    const rawThinkingEffort = toString(providerSpecificData.thinkingEffort);
    return rawThinkingEffort || undefined;
}
function normalizeProviderModelRecord(rawModel, fallbackProvider, source, warning, thinkingEffort) {
    const model = toRecord(rawModel);
    const id = toString(model.id, "");
    return {
        id,
        provider: toString(model.owned_by, toString(model.provider, fallbackProvider)),
        capabilities: getCatalogModelCapabilities(model),
        status: normalizeCatalogStatus(model, source, warning),
        ...thinkingEffort ? {
            thinkingEffort
        } : {},
        pricing: model.pricing
    };
}
function activeProviderConnections(connections, normalizeProviderId, requestedProvider) {
    return connections.filter((connection)=>{
        const provider = typeof connection?.provider === "string" ? normalizeProviderId(connection.provider) : null;
        return !!provider && !!connection?.id && connection.isActive !== false && (!requestedProvider || provider === requestedProvider);
    });
}
function providerModelRequestSpecs(connections, normalizeProviderId) {
    return connections.map((connection)=>({
            provider: normalizeProviderId(String(connection.provider)),
            path: `/api/providers/${encodeURIComponent(String(connection.id))}/models?excludeHidden=true`,
            thinkingEffort: getConnectionThinkingEffort(connection)
        }));
}
function noAuthProviderSpec(requestedProvider) {
    return {
        provider: requestedProvider,
        path: `/api/v1/providers/${encodeURIComponent(requestedProvider)}/models`,
        thinkingEffort: undefined
    };
}
function emptyCatalogForProvider(requestedProvider) {
    return {
        models: [],
        source: "provider_connections",
        warning: `No active connections found for provider '${requestedProvider}'.`
    };
}
function rawModelsFromCatalog(raw) {
    if (Array.isArray(raw.models)) return raw.models;
    if (Array.isArray(raw.data)) return raw.data;
    return [];
}
function maybeCatalogModel(rawModel, spec, source, warning, requestedCapability) {
    const normalized = normalizeProviderModelRecord(rawModel, spec.provider, source, warning);
    if (spec.thinkingEffort && !normalized.thinkingEffort) normalized.thinkingEffort = spec.thinkingEffort;
    if (!normalized.id) return null;
    if (requestedCapability && !normalized.capabilities.includes(requestedCapability)) return null;
    return normalized;
}
function addCatalogModels(raw, spec, source, warning, requestedCapability, collectedModels) {
    for (const rawModel of rawModelsFromCatalog(raw)){
        const normalized = maybeCatalogModel(rawModel, spec, source, warning, requestedCapability);
        if (normalized) collectedModels.set(`${normalized.provider}:${normalized.id}`, normalized);
    }
}
async function collectCatalogModels(requestSpecs, fetchJson, requestedCapability) {
    const collectedModels = new Map();
    const warnings = new Set();
    const sources = new Set();
    for (const spec of requestSpecs){
        const raw = toRecord(await fetchJson(spec.path));
        const source = toString(raw.source, spec.path.startsWith("/api/providers/") ? "api" : "v1_catalog");
        const warning = raw.warning ? String(raw.warning) : undefined;
        if (warning) warnings.add(warning);
        sources.add(source);
        addCatalogModels(raw, spec, source, warning, requestedCapability, collectedModels);
    }
    return {
        collectedModels,
        warnings,
        sources
    };
}
async function getMcpModelsCatalog(args, deps = {}) {
    const fetchJson = deps.fetchJson ?? ((path)=>__turbopack_context__.A("[project]/open-sse/mcp-server/server.ts [app-route] (ecmascript, async loader)").then((m)=>m.omniRouteFetch(path)));
    const listProviderConnections = deps.listProviderConnections ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderConnections"];
    const aliasMap = buildProviderAliasMap();
    const normalizeProviderId = (value)=>aliasMap[value] || value;
    const requestedProvider = args.provider ? normalizeProviderId(args.provider) : null;
    const requestedCapability = args.capability ? normalizeCapability(args.capability) : null;
    let connections = await listProviderConnections();
    connections = Array.isArray(connections) ? connections : [];
    const activeConnections = activeProviderConnections(connections, normalizeProviderId, requestedProvider);
    const requestSpecs = providerModelRequestSpecs(activeConnections, normalizeProviderId);
    if (requestedProvider && requestSpecs.length === 0) {
        const isNoAuthProvider = Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NOAUTH_PROVIDERS"]).some((provider)=>provider.id === requestedProvider);
        if (isNoAuthProvider) {
            requestSpecs.push(noAuthProviderSpec(requestedProvider));
        } else {
            return emptyCatalogForProvider(requestedProvider);
        }
    }
    const { collectedModels, warnings, sources } = await collectCatalogModels(requestSpecs, fetchJson, requestedCapability);
    return {
        models: [
            ...collectedModels.values()
        ],
        source: sources.size === 1 ? [
            ...sources
        ][0] : "aggregated_provider_models",
        ...warnings.size > 0 ? {
            warning: [
                ...warnings
            ].join(" | ")
        } : {}
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/mcp-server/server.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "createMcpServer",
    ()=>createMcpServer,
    "omniRouteFetch",
    ()=>omniRouteFetch,
    "startMcpStdio",
    ()=>startMcpStdio
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$mcp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@modelcontextprotocol/sdk/dist/esm/server/mcp.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$stdio$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@modelcontextprotocol/sdk/dist/esm/server/stdio.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/combos/steps.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$toolSearch$2f$register$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/toolSearch/register.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/schemas/tools.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$pickFastestModel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/schemas/pickFastestModel.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$runtimeHeartbeat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/runtimeHeartbeat.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$toolCount$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/toolCount.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/audit.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$scopeEnforcement$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/scopeEnforcement.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$httpAuthContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/httpAuthContext.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$internalServiceAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api/internalServiceAuth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$advancedTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/tools/advancedTools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$pickFastestModel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/tools/pickFastestModel.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$memoryTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/tools/memoryTools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$skillTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/tools/skillTools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$agentSkillTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/tools/agentSkillTools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$githubSkillTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/tools/githubSkillTools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/skills/registry.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$executor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/skills/executor.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$pluginTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/tools/pluginTools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$compressionTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/tools/compressionTools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$poolTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/tools/poolTools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$gamificationTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/tools/gamificationTools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$notionTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/tools/notionTools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$obsidianTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/tools/obsidianTools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$localCorpusTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/tools/localCorpusTools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$descriptionCompressor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/descriptionCompressor.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$toolCardinality$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/toolCardinality.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$mcpAccessibility$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/mcpAccessibility/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$mcpAccessibility$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/mcpAccessibility/constants.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$contracts$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/contracts/quota.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$resolveOmniRouteBaseUrl$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/resolveOmniRouteBaseUrl.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/catalog.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$mcp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$stdio$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$toolSearch$2f$register$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$pickFastestModel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$scopeEnforcement$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$httpAuthContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$advancedTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$pickFastestModel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$memoryTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$skillTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$agentSkillTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$githubSkillTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$executor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$pluginTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$compressionTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$poolTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$gamificationTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$notionTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$obsidianTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$localCorpusTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$mcp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$stdio$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$toolSearch$2f$register$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$pickFastestModel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$scopeEnforcement$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$httpAuthContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$advancedTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$pickFastestModel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$memoryTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$skillTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$agentSkillTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$githubSkillTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$executor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$pluginTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$compressionTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$poolTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$gamificationTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$notionTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$obsidianTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$localCorpusTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
const __TURBOPACK__import$2e$meta__ = {
    get url () {
        return `file://${__turbopack_context__.P("open-sse/mcp-server/server.ts")}`;
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
const OMNIROUTE_BASE_URL = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$resolveOmniRouteBaseUrl$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveOmniRouteBaseUrl"])();
const MCP_ENFORCE_SCOPES = process.env.OMNIROUTE_MCP_ENFORCE_SCOPES === "true";
const MCP_ALLOWED_SCOPES = new Set((process.env.OMNIROUTE_MCP_SCOPES || "").split(",").map((s)=>s.trim()).filter(Boolean));
const TOTAL_MCP_TOOL_COUNT = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$toolCount$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["countUniqueMcpTools"])({
    MCP_TOOLS: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["MCP_TOOLS"],
    memoryTools: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$memoryTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["memoryTools"],
    skillTools: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$skillTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["skillTools"],
    agentSkillTools: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$agentSkillTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["agentSkillTools"],
    githubSkillTools: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$githubSkillTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["githubSkillTools"],
    poolTools: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$poolTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["poolTools"],
    gamificationTools: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$gamificationTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["gamificationTools"],
    pluginTools: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$pluginTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pluginTools"],
    notionTools: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$notionTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notionTools"],
    obsidianTools: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$obsidianTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["obsidianTools"],
    localCorpusTools: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$localCorpusTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["localCorpusTools"],
    compressionTools: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$compressionTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["compressionTools"]
});
function readMcpDescriptionCompressionEnabled() {
    try {
        const row = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("SELECT value FROM key_value WHERE namespace = ? AND key = ?").get("compression", "mcpDescriptionCompressionEnabled");
        if (!row?.value) return true;
        return JSON.parse(row.value) !== false;
    } catch  {
        return true;
    }
}
function readMcpAccessibilityConfig() {
    try {
        const row = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("SELECT value FROM key_value WHERE namespace = ? AND key = ?").get("compression", "mcpAccessibility");
        if (!row?.value) return {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$mcpAccessibility$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_MCP_ACCESSIBILITY_CONFIG"]
        };
        // clampMcpAccessibilityConfig bounds every field (and folds in the non-object guard), so a
        // persisted out-of-range maxTextChars can't make smartFilterText truncate the whole text.
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$mcpAccessibility$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clampMcpAccessibilityConfig"])(JSON.parse(row.value));
    } catch  {
        return {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$mcpAccessibility$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_MCP_ACCESSIBILITY_CONFIG"]
        };
    }
}
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toArray(value) {
    return Array.isArray(value) ? value : [];
}
function toString(value, fallback = "") {
    return typeof value === "string" ? value : fallback;
}
function toNumber(value, fallback = 0) {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
function toStringArray(value, fallback = []) {
    const values = toArray(value).filter((entry)=>typeof entry === "string");
    return values.length > 0 ? values : fallback;
}
function normalizeComboModels(rawModels) {
    return toArray(rawModels).map((rawModel, index)=>{
        const modelRecord = toRecord(rawModel);
        const modelString = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getComboModelString"])(rawModel);
        const target = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getComboStepTarget"])(rawModel);
        const provider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getComboModelProvider"])(rawModel) || (modelString ? "unknown" : target ? "combo" : toString(modelRecord.provider, "unknown"));
        return {
            provider,
            model: modelString || target || toString(modelRecord.model, "unknown"),
            priority: toNumber(modelRecord.priority, index + 1)
        };
    });
}
function getOmniRouteApiKey() {
    return process.env.OMNIROUTE_API_KEY || "";
}
async function omniRouteFetch(path, options = {}) {
    const url = `${OMNIROUTE_BASE_URL}${path}`;
    const apiKey = getOmniRouteApiKey();
    const headers = {
        "Content-Type": "application/json",
        // Static env key is only a fallback; the per-caller MCP identity forwarded via
        // withMcpHttpAuthContext must win over it (#5819).
        ...apiKey ? {
            Authorization: `Bearer ${apiKey}`
        } : {},
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$httpAuthContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMcpHttpAuthHeadersForInternalFetch"])(),
        ...options.headers || {},
        // Authenticate only the server-to-server hop. This does not replace or
        // weaken the caller identity forwarded above.
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$internalServiceAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getInternalServiceAuthHeaders"])()
    };
    const signal = options.signal || AbortSignal.timeout(10000);
    const response = await fetch(url, {
        ...options,
        headers,
        signal
    });
    if (!response.ok) {
        const errorText = await response.text().catch(()=>"Unknown error");
        throw new Error(`OmniRoute API error [${response.status}]: ${errorText}`);
    }
    return response.json();
}
function withScopeEnforcement(toolName, handler, toolScopes) {
    return async (args, extra)=>{
        const scopeContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$scopeEnforcement$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveCallerScopeContext"])(extra, Array.from(MCP_ALLOWED_SCOPES));
        const scopeCheck = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$scopeEnforcement$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["evaluateToolScopes"])(toolName, scopeContext.scopes, MCP_ENFORCE_SCOPES, toolScopes);
        if (!scopeCheck.allowed) {
            const missingScopes = scopeCheck.missing.length > 0 ? scopeCheck.missing.join(", ") : "unavailable";
            const reason = scopeCheck.reason || "scope_check_failed";
            const msg = `Insufficient MCP scopes for ${toolName}. ` + `Missing: ${missingScopes}. ` + `Caller=${scopeContext.callerId}, source=${scopeContext.source}.`;
            const safeArgs = args && typeof args === "object" ? toRecord(args) : {
                rawArgs: args
            };
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])(toolName, {
                ...safeArgs,
                _scopeCheck: {
                    callerId: scopeContext.callerId,
                    source: scopeContext.source,
                    required: scopeCheck.required,
                    provided: scopeCheck.provided,
                    missing: scopeCheck.missing
                }
            }, null, 0, false, `scope_denied:${reason}`);
            return {
                content: [
                    {
                        type: "text",
                        text: `Error: ${msg}`
                    }
                ],
                isError: true
            };
        }
        return handler(args, extra);
    };
}
async function handleGetHealth() {
    const start = Date.now();
    try {
        const [healthRaw, resilienceRaw, rateLimitsRaw] = await Promise.allSettled([
            omniRouteFetch("/api/monitoring/health"),
            omniRouteFetch("/api/resilience"),
            omniRouteFetch("/api/rate-limits")
        ]);
        const health = healthRaw.status === "fulfilled" ? toRecord(healthRaw.value) : {};
        const resilience = resilienceRaw.status === "fulfilled" ? toRecord(resilienceRaw.value) : {};
        const rateLimits = rateLimitsRaw.status === "fulfilled" ? toRecord(rateLimitsRaw.value) : {};
        const memoryUsageRaw = toRecord(health.memoryUsage);
        const cacheStatsRaw = toRecord(health.cacheStats);
        const resilienceCircuitBreakers = toArray(resilience.circuitBreakers);
        const rateLimitEntries = toArray(rateLimits.limits);
        const result = {
            uptime: toString(health.uptime, "unknown"),
            version: toString(health.version, "unknown"),
            memoryUsage: {
                heapUsed: toNumber(memoryUsageRaw.heapUsed, 0),
                heapTotal: toNumber(memoryUsageRaw.heapTotal, 0)
            },
            circuitBreakers: resilienceCircuitBreakers,
            rateLimits: rateLimitEntries,
            cacheStats: Object.keys(cacheStatsRaw).length > 0 ? {
                hits: toNumber(cacheStatsRaw.hits, 0),
                misses: toNumber(cacheStatsRaw.misses, 0),
                hitRate: toNumber(cacheStatsRaw.hitRate, 0)
            } : undefined,
            cryptography: health.cryptography ? {
                status: toString(toRecord(health.cryptography).status, "missing_or_invalid"),
                provider: toString(toRecord(health.cryptography).provider, "unknown")
            } : undefined
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_get_health", {}, result, Date.now() - start, true);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_get_health", {}, null, Date.now() - start, false, msg);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${msg}`
                }
            ],
            isError: true
        };
    }
}
async function handleListCombos(args) {
    const start = Date.now();
    try {
        const combosRaw = await omniRouteFetch("/api/combos");
        const combosRecord = toRecord(combosRaw);
        const combos = Array.isArray(combosRecord.combos) ? combosRecord.combos : Array.isArray(combosRaw) ? combosRaw : [];
        let metrics = {};
        if (args.includeMetrics) {
            metrics = toRecord(await omniRouteFetch("/api/combos/metrics").catch(()=>({})));
        }
        const result = {
            combos: toArray(combos).map((rawCombo)=>{
                const combo = toRecord(rawCombo);
                const comboData = toRecord(combo.data);
                const comboId = toString(combo.id, "");
                const modelsSource = Array.isArray(combo.models) && combo.models.length > 0 ? combo.models : comboData.models;
                return {
                    id: comboId,
                    name: toString(combo.name, comboId || "unnamed"),
                    models: normalizeComboModels(modelsSource),
                    strategy: toString(combo.strategy, toString(comboData.strategy, "priority")),
                    enabled: combo.enabled !== false,
                    ...args.includeMetrics ? {
                        metrics: metrics[comboId] ?? null
                    } : {}
                };
            })
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_list_combos", args, result, Date.now() - start, true);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_list_combos", args, null, Date.now() - start, false, msg);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${msg}`
                }
            ],
            isError: true
        };
    }
}
async function handleGetComboMetrics(args) {
    const start = Date.now();
    try {
        const result = await omniRouteFetch(`/api/combos/metrics?comboId=${encodeURIComponent(args.comboId)}`);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_get_combo_metrics", args, result, Date.now() - start, true);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_get_combo_metrics", args, null, Date.now() - start, false, msg);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${msg}`
                }
            ],
            isError: true
        };
    }
}
async function handleSwitchCombo(args) {
    const start = Date.now();
    try {
        const result = await omniRouteFetch(`/api/combos/${encodeURIComponent(args.comboId)}`, {
            method: "PUT",
            body: JSON.stringify({
                isActive: args.active
            })
        });
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_switch_combo", args, result, Date.now() - start, true);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_switch_combo", args, null, Date.now() - start, false, msg);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${msg}`
                }
            ],
            isError: true
        };
    }
}
async function handleCreateCombo(args) {
    const start = Date.now();
    try {
        const result = await omniRouteFetch("/api/combos", {
            method: "POST",
            body: JSON.stringify(args)
        });
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_create_combo", args, result, Date.now() - start, true);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_create_combo", args, null, Date.now() - start, false, msg);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${msg}`
                }
            ],
            isError: true
        };
    }
}
async function handleCheckQuota(args) {
    const start = Date.now();
    try {
        let path = "/api/usage/quota";
        if (args.connectionId) path += `?connectionId=${encodeURIComponent(args.connectionId)}`;
        else if (args.provider) path += `?provider=${encodeURIComponent(args.provider)}`;
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$contracts$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeQuotaResponse"])(await omniRouteFetch(path), {
            provider: args.provider || null,
            connectionId: args.connectionId || null
        });
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_check_quota", args, result, Date.now() - start, true);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_check_quota", args, null, Date.now() - start, false, msg);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${msg}`
                }
            ],
            isError: true
        };
    }
}
async function handleRouteRequest(args) {
    const start = Date.now();
    try {
        const body = {
            model: args.model,
            messages: args.messages,
            stream: false
        };
        if (args.combo) {
            body["x-combo"] = args.combo;
        }
        const raw = await omniRouteFetch("/v1/chat/completions", {
            method: "POST",
            body: JSON.stringify(body)
        });
        const choices = toArray(raw.choices);
        const firstChoice = toRecord(choices[0]);
        const firstMessage = toRecord(firstChoice.message);
        const usage = toRecord(raw.usage);
        const result = {
            response: {
                content: toString(firstMessage.content, ""),
                model: toString(raw.model, args.model),
                tokens: {
                    prompt: toNumber(usage.prompt_tokens, 0),
                    completion: toNumber(usage.completion_tokens, 0)
                }
            },
            routing: {
                provider: toString(raw.provider, "unknown"),
                combo: raw.combo ?? null,
                fallbacksTriggered: toNumber(raw.fallbacksTriggered, 0),
                cost: toNumber(raw.cost, 0),
                latencyMs: Date.now() - start,
                routingExplanation: toString(raw.routingExplanation, "Request routed through primary provider")
            }
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_route_request", {
            model: args.model,
            messageCount: args.messages.length
        }, result.routing, Date.now() - start, true);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_route_request", {
            model: args.model
        }, null, Date.now() - start, false, msg);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${msg}`
                }
            ],
            isError: true
        };
    }
}
async function handleCostReport(args) {
    const start = Date.now();
    try {
        const period = args.period || "session";
        const rangeMap = {
            session: "1d",
            day: "1d",
            week: "7d",
            month: "30d"
        };
        const range = rangeMap[period] || "30d";
        const raw = toRecord(await omniRouteFetch(`/api/usage/analytics?range=${encodeURIComponent(range)}`));
        const tokenCount = toRecord(raw.tokenCount);
        const budget = toRecord(raw.budget);
        const result = {
            period,
            totalCost: toNumber(raw.totalCost, 0),
            requestCount: toNumber(raw.requestCount, 0),
            tokenCount: {
                prompt: toNumber(tokenCount.prompt, 0),
                completion: toNumber(tokenCount.completion, 0)
            },
            byProvider: toArray(raw.byProvider),
            byModel: toArray(raw.byModel),
            budget: {
                limit: budget.limit ?? null,
                remaining: budget.remaining ?? null
            }
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_cost_report", args, result, Date.now() - start, true);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_cost_report", args, null, Date.now() - start, false, msg);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${msg}`
                }
            ],
            isError: true
        };
    }
}
async function handleListModelsCatalog(args) {
    const start = Date.now();
    try {
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMcpModelsCatalog"])(args);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_list_models_catalog", args, {
            modelCount: result.models.length
        }, Date.now() - start, true);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_list_models_catalog", args, null, Date.now() - start, false, msg);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${msg}`
                }
            ],
            isError: true
        };
    }
}
async function handleWebSearch(args) {
    const start = Date.now();
    try {
        const body = {
            query: args.query,
            max_results: args.max_results ?? 5,
            search_type: args.search_type ?? "web"
        };
        if (args.provider) body.provider = args.provider;
        const result = await omniRouteFetch("/v1/search", {
            method: "POST",
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(60000)
        });
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_web_search", args, result, Date.now() - start, true);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_web_search", args, null, Date.now() - start, false, msg);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${msg}`
                }
            ],
            isError: true
        };
    }
}
async function handleWebFetch(args) {
    const start = Date.now();
    try {
        const body = {
            url: args.url,
            format: args.format ?? "markdown",
            include_metadata: args.include_metadata ?? false
        };
        if (args.provider) body.provider = args.provider;
        if (args.depth !== undefined) body.depth = args.depth;
        if (args.wait_for_selector) body.wait_for_selector = args.wait_for_selector;
        const result = await omniRouteFetch("/v1/web/fetch", {
            method: "POST",
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(60000)
        });
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_web_fetch", args, result, Date.now() - start, true);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logToolCall"])("omniroute_web_fetch", args, null, Date.now() - start, false, msg);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${msg}`
                }
            ],
            isError: true
        };
    }
}
function createMcpServer() {
    const server = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$mcp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["McpServer"]({
        name: "omniroute",
        version: process.env.npm_package_version || "1.8.1"
    });
    const mcpDescriptionCompressionEnabled = readMcpDescriptionCompressionEnabled();
    const mcpAccessibilityConfig = readMcpAccessibilityConfig();
    // F4.3 tool-cardinality: opt-in tool profile (MCP_TOOL_DENY / MCP_TOOL_ALLOW). null = no filter.
    const toolProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$toolCardinality$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readMcpToolProfileFromEnv"])(process.env);
    const registerTool = server.registerTool.bind(server);
    server.registerTool = (name, config, handler)=>{
        const metadata = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$descriptionCompressor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["compressMcpRegistryMetadata"])(config, {
            enabled: mcpDescriptionCompressionEnabled
        });
        const filteredHandler = mcpAccessibilityConfig.enabled ? async (args, extra)=>{
            const result = await handler(args, extra);
            if (Array.isArray(result?.content)) {
                for (const block of result.content){
                    if (block && block.type === "text" && typeof block.text === "string") {
                        block.text = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$mcpAccessibility$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["smartFilterText"])(block.text, mcpAccessibilityConfig);
                    }
                }
            }
            return result;
        } : handler;
        const registered = registerTool(name, metadata, filteredHandler);
        if (toolProfile && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$toolCardinality$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["reduceToolManifest"])([
            {
                name,
                scopes: []
            }
        ], toolProfile).length === 0) {
            // Denied by the cardinality profile: keep the registration valid but disable it so the tool
            // is not announced in tools/list (token savings). The default profile never reaches here.
            const disablable = registered;
            if (typeof disablable?.disable === "function") disablable.disable();
        }
        return registered;
    };
    const registerPrompt = server.registerPrompt.bind(server);
    server.registerPrompt = (name, config, handler)=>{
        const metadata = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$descriptionCompressor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["compressMcpRegistryMetadata"])(config, {
            enabled: mcpDescriptionCompressionEnabled
        });
        return registerPrompt(name, metadata, handler);
    };
    const registerResource = server.registerResource.bind(server);
    server.registerResource = (name, uriOrTemplate, config, readCallback)=>{
        const metadata = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$descriptionCompressor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["compressMcpRegistryMetadata"])(config, {
            enabled: mcpDescriptionCompressionEnabled
        });
        return registerResource(name, uriOrTemplate, metadata, readCallback);
    };
    const RESERVED_MCP_NAMES = new Set([
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["MCP_TOOLS"].map((t)=>t.name),
        ...Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$memoryTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["memoryTools"]),
        ...Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$skillTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["skillTools"]),
        ...Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$compressionTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["compressionTools"]),
        ...Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$poolTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["poolTools"]),
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$pluginTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pluginTools"].map((t)=>t.name),
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$gamificationTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["gamificationTools"].map((t)=>t.name),
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$obsidianTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["obsidianTools"].map((t)=>t.name),
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$notionTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notionTools"].map((t)=>t.name),
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$localCorpusTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["localCorpusTools"].map((t)=>t.name)
    ]);
    server.registerTool("omniroute_get_health", {
        description: "Returns OmniRoute health status including uptime, memory, circuit breakers, rate limits, and cache stats",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getHealthInput"]
    }, withScopeEnforcement("omniroute_get_health", async (args)=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getHealthInput"].parse(args ?? {});
        return handleGetHealth();
    }));
    server.registerTool("omniroute_list_combos", {
        description: "Lists all configured combos (model chains) with strategies and optional metrics",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["listCombosInput"]
    }, withScopeEnforcement("omniroute_list_combos", (args)=>handleListCombos(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["listCombosInput"].parse(args))));
    server.registerTool("omniroute_get_combo_metrics", {
        description: "Returns detailed performance metrics for a specific combo",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getComboMetricsInput"]
    }, withScopeEnforcement("omniroute_get_combo_metrics", (args)=>handleGetComboMetrics(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getComboMetricsInput"].parse(args))));
    server.registerTool("omniroute_switch_combo", {
        description: "Activates or deactivates a combo for routing",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["switchComboInput"]
    }, withScopeEnforcement("omniroute_switch_combo", (args)=>handleSwitchCombo(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["switchComboInput"].parse(args))));
    server.registerTool("omniroute_create_combo", {
        description: "Registers a new combo (model chain) with name, models, and strategy",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createComboInput"]
    }, withScopeEnforcement("omniroute_create_combo", (args)=>handleCreateCombo(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createComboInput"].parse(args))));
    server.registerTool("omniroute_check_quota", {
        description: "Checks remaining API quota for one or all providers",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["checkQuotaInput"]
    }, withScopeEnforcement("omniroute_check_quota", (args)=>handleCheckQuota(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["checkQuotaInput"].parse(args))));
    server.registerTool("omniroute_route_request", {
        description: "Sends a chat completion request through OmniRoute intelligent routing",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["routeRequestInput"]
    }, withScopeEnforcement("omniroute_route_request", (args)=>handleRouteRequest(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["routeRequestInput"].parse(args))));
    server.registerTool("omniroute_cost_report", {
        description: "Generates a cost report for the specified period",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["costReportInput"]
    }, withScopeEnforcement("omniroute_cost_report", (args)=>handleCostReport(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["costReportInput"].parse(args))));
    server.registerTool("omniroute_list_models_catalog", {
        description: "Lists all available AI models across providers with capabilities and pricing",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["listModelsCatalogInput"]
    }, withScopeEnforcement("omniroute_list_models_catalog", (args)=>handleListModelsCatalog(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["listModelsCatalogInput"].parse(args))));
    server.registerTool("omniroute_simulate_route", {
        description: "Simulates the routing path a request would take without executing it (dry-run)",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["simulateRouteInput"]
    }, withScopeEnforcement("omniroute_simulate_route", (args)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$advancedTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleSimulateRoute"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["simulateRouteInput"].parse(args))));
    server.registerTool("omniroute_set_budget_guard", {
        description: "Sets a session budget limit with configurable action when exceeded (degrade/block/alert)",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["setBudgetGuardInput"]
    }, withScopeEnforcement("omniroute_set_budget_guard", (args)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$advancedTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleSetBudgetGuard"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["setBudgetGuardInput"].parse(args))));
    server.registerTool("omniroute_set_routing_strategy", {
        description: "Updates combo routing strategy at runtime (priority/weighted/round-robin/auto/etc.)",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["setRoutingStrategyInput"]
    }, withScopeEnforcement("omniroute_set_routing_strategy", (args)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$advancedTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleSetRoutingStrategy"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["setRoutingStrategyInput"].parse(args))));
    server.registerTool("omniroute_set_resilience_profile", {
        description: "Applies a resilience profile controlling circuit breakers, retries, timeouts, and fallback depth",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["setResilienceProfileInput"]
    }, withScopeEnforcement("omniroute_set_resilience_profile", (args)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$advancedTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleSetResilienceProfile"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["setResilienceProfileInput"].parse(args))));
    server.registerTool("omniroute_test_combo", {
        description: "Tests each provider in a combo with a real prompt, reporting latency, cost, and success per provider",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["testComboInput"]
    }, withScopeEnforcement("omniroute_test_combo", (args)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$advancedTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleTestCombo"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["testComboInput"].parse(args))));
    server.registerTool("omniroute_get_provider_metrics", {
        description: "Returns detailed metrics for a specific provider including latency percentiles and circuit breaker state",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderMetricsInput"]
    }, withScopeEnforcement("omniroute_get_provider_metrics", (args)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$advancedTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleGetProviderMetrics"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderMetricsInput"].parse(args))));
    server.registerTool("omniroute_best_combo_for_task", {
        description: "Recommends the best combo for a task type based on provider fitness and constraints",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bestComboForTaskInput"]
    }, withScopeEnforcement("omniroute_best_combo_for_task", (args)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$advancedTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleBestComboForTask"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bestComboForTaskInput"].parse(args))));
    server.registerTool("omniroute_explain_route", {
        description: "Explains why a request was routed to a specific provider, showing scoring factors and fallbacks",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["explainRouteInput"]
    }, withScopeEnforcement("omniroute_explain_route", (args)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$advancedTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleExplainRoute"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["explainRouteInput"].parse(args))));
    server.registerTool("omniroute_pick_fastest_model", {
        description: "Picks the fastest reliable provider-model pair from live telemetry.",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$pickFastestModel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pickFastestModelInput"]
    }, withScopeEnforcement("omniroute_pick_fastest_model", (args)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$pickFastestModel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handlePickFastestModel"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$pickFastestModel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pickFastestModelInput"].parse(args))));
    server.registerTool("omniroute_get_session_snapshot", {
        description: "Returns a full snapshot of the current working session: cost, tokens, top models, errors, budget status",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSessionSnapshotInput"]
    }, withScopeEnforcement("omniroute_get_session_snapshot", async (args)=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSessionSnapshotInput"].parse(args ?? {});
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$advancedTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleGetSessionSnapshot"])();
    }));
    server.registerTool("omniroute_db_health_check", {
        description: "Diagnoses or repairs OmniRoute database drift, including broken combo references and orphan quota/domain rows",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["dbHealthCheckInput"]
    }, withScopeEnforcement("omniroute_db_health_check", (args)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$advancedTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleDbHealthCheck"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["dbHealthCheckInput"].parse(args ?? {}))));
    server.registerTool("omniroute_sync_pricing", {
        description: "Syncs pricing data from external sources (LiteLLM) into OmniRoute without overwriting user-set prices",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["syncPricingInput"]
    }, withScopeEnforcement("omniroute_sync_pricing", (args)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$advancedTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleSyncPricing"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["syncPricingInput"].parse(args))));
    server.registerTool("omniroute_web_search", {
        description: "Performs a web search using OmniRoute's search gateway. Supports multiple providers (Serper, Brave, Perplexity, Exa, Tavily) with automatic failover. Returns search results with titles, URLs, snippets, and position data.",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["webSearchInput"]
    }, withScopeEnforcement("omniroute_web_search", (args)=>handleWebSearch(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["webSearchInput"].parse(args))));
    server.registerTool("omniroute_web_fetch", {
        description: "Fetches and extracts content from a URL using OmniRoute's web fetch gateway. Supports multiple providers (Firecrawl, Jina Reader, Tavily) with automatic failover. Returns the page content as markdown, HTML, links, or screenshot, along with metadata.",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["webFetchInput"]
    }, withScopeEnforcement("omniroute_web_fetch", (args)=>handleWebFetch(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["webFetchInput"].parse(args))));
    server.registerTool("omniroute_cache_stats", {
        description: "Returns cache statistics including semantic cache hit rate, prompt cache metrics by provider, and idempotency layer stats.",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["cacheStatsInput"]
    }, withScopeEnforcement("omniroute_cache_stats", ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$advancedTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleCacheStats"])()));
    server.registerTool("omniroute_cache_flush", {
        description: "Flush cache entries. Provide signature to invalidate a single entry, model to invalidate all entries for a model, or omit both to clear all.",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["cacheFlushInput"]
    }, withScopeEnforcement("omniroute_cache_flush", (args)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$advancedTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleCacheFlush"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["cacheFlushInput"].parse(args))));
    server.registerTool("omniroute_oneproxy_fetch", {
        description: "Fetch free proxies from the 1proxy marketplace with optional filters for protocol, country, and quality. Returns validated proxies with quality scores.",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["oneproxyFetchInput"]
    }, withScopeEnforcement("omniroute_oneproxy_fetch", (args)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$advancedTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleOneproxyFetch"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["oneproxyFetchInput"].parse(args))));
    server.registerTool("omniroute_oneproxy_rotate", {
        description: "Get the next available free proxy from the 1proxy pool using the specified rotation strategy.",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["oneproxyRotateInput"]
    }, withScopeEnforcement("omniroute_oneproxy_rotate", (args)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$advancedTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleOneproxyRotate"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["oneproxyRotateInput"].parse(args))));
    server.registerTool("omniroute_oneproxy_stats", {
        description: "Returns 1proxy sync status and statistics: total proxies, average quality, sync history, and distribution by protocol and country.",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["oneproxyStatsInput"]
    }, withScopeEnforcement("omniroute_oneproxy_stats", (args)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$advancedTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleOneproxyStats"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$schemas$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["oneproxyStatsInput"].parse(args))));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$toolSearch$2f$register$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerToolSearchTool"])(server, withScopeEnforcement);
    // ── Memory Tools ──────────────────────────────
    Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$memoryTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["memoryTools"]).forEach((toolDef)=>{
        server.registerTool(toolDef.name, {
            description: toolDef.description,
            // @ts-ignore: dynamic zod access
            inputSchema: toolDef.inputSchema
        }, withScopeEnforcement(toolDef.name, async (args, extra)=>{
            try {
                const parsedArgs = toolDef.inputSchema.parse(args ?? {});
                // @ts-ignore - handler type lost through dynamic Object.values() access
                const result = await toolDef.handler(parsedArgs, extra);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: ${msg}`
                        }
                    ],
                    isError: true
                };
            }
        }, toolDef.scopes));
    });
    // ── Skill Tools ──────────────────────────────
    Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$skillTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["skillTools"]).forEach((toolDef)=>{
        server.registerTool(toolDef.name, {
            description: toolDef.description,
            // @ts-ignore: dynamic zod access
            inputSchema: toolDef.inputSchema
        }, withScopeEnforcement(toolDef.name, async (args, extra)=>{
            try {
                const parsedArgs = toolDef.inputSchema.parse(args ?? {});
                // @ts-ignore - handler type lost through dynamic Object.values() access
                const result = await toolDef.handler(parsedArgs, extra);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: ${msg}`
                        }
                    ],
                    isError: true
                };
            }
        }, toolDef.scopes));
    });
    // ── Agent Skill Tools ─────────────────────────
    Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$agentSkillTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["agentSkillTools"]).forEach((toolDef)=>{
        server.registerTool(toolDef.name, {
            description: toolDef.description,
            // @ts-ignore: dynamic zod access
            inputSchema: toolDef.inputSchema
        }, withScopeEnforcement(toolDef.name, async (args, extra)=>{
            try {
                const parsedArgs = toolDef.inputSchema.parse(args ?? {});
                // @ts-expect-error - handler type lost through dynamic Object.values() access
                const result = await toolDef.handler(parsedArgs, extra);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: ${msg}`
                        }
                    ],
                    isError: true
                };
            }
        }));
    });
    // ── GitHub Skill Tools ──────────────────────────
    Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$githubSkillTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["githubSkillTools"]).forEach((toolDef)=>{
        server.registerTool(toolDef.name, {
            description: toolDef.description,
            // @ts-ignore: dynamic zod access
            inputSchema: toolDef.inputSchema
        }, withScopeEnforcement(toolDef.name, async (args)=>{
            try {
                const parsedArgs = toolDef.inputSchema.parse(args ?? {});
                // @ts-expect-error - handler type lost through dynamic Object.values() access
                const result = await toolDef.handler(parsedArgs);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: ${msg}`
                        }
                    ],
                    isError: true
                };
            }
        }, toolDef.scopes));
    });
    // ── Plugin Tools ──────────────────────────────
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$pluginTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pluginTools"].forEach((toolDef)=>{
        server.registerTool(toolDef.name, {
            description: toolDef.description,
            // @ts-ignore: dynamic zod access
            inputSchema: toolDef.inputSchema
        }, withScopeEnforcement(toolDef.name, async (args, extra)=>{
            try {
                const parsedArgs = toolDef.inputSchema.parse(args ?? {});
                // @ts-ignore: handler expected specific object
                const result = await toolDef.handler(parsedArgs, extra);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: ${msg}`
                        }
                    ],
                    isError: true
                };
            }
        }, toolDef.scopes));
    });
    // ── Compression Tools ─────────────────────────
    Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$compressionTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["compressionTools"]).forEach((toolDef)=>{
        server.registerTool(toolDef.name, {
            description: toolDef.description,
            // @ts-ignore: dynamic zod access
            inputSchema: toolDef.inputSchema
        }, withScopeEnforcement(toolDef.name, async (args, extra)=>{
            try {
                const parsedArgs = toolDef.inputSchema.parse(args ?? {});
                // @ts-ignore - handler type lost through dynamic Object.values() access
                const result = await toolDef.handler(parsedArgs, extra);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: ${msg}`
                        }
                    ],
                    isError: true
                };
            }
        }, toolDef.scopes));
    });
    // ── Web-Session Pool Tools (#3368 observability) ─
    // Typed structurally (not `any`) — the shape is pinned by
    // tests/unit/mcp-tool-collections-shape.test.ts, so the loop can stay strict.
    Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$poolTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["poolTools"]).forEach((toolDef)=>{
        server.registerTool(toolDef.name, {
            description: toolDef.description,
            // @ts-ignore: dynamic zod access
            inputSchema: toolDef.inputSchema
        }, withScopeEnforcement(toolDef.name, async (args, extra)=>{
            try {
                const parsedArgs = toolDef.inputSchema.parse(args ?? {});
                const result = await toolDef.handler(parsedArgs, extra);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: ${msg}`
                        }
                    ],
                    isError: true
                };
            }
        }, toolDef.scopes));
    });
    // ── Gamification Tools ────────────────────────
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$gamificationTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["gamificationTools"].forEach((toolDef)=>{
        server.registerTool(toolDef.name, {
            description: toolDef.description,
            // @ts-ignore: dynamic zod access
            inputSchema: toolDef.inputSchema
        }, withScopeEnforcement(toolDef.name, async (args, extra)=>{
            try {
                const parsedArgs = toolDef.inputSchema.parse(args ?? {});
                // @ts-ignore: handler expected specific object
                const result = await toolDef.handler(parsedArgs, extra);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: ${msg}`
                        }
                    ],
                    isError: true
                };
            }
        }, toolDef.scopes));
    });
    // ── Notion Context Source Tools ───────────────
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$notionTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notionTools"].forEach((toolDef)=>{
        server.registerTool(toolDef.name, {
            description: toolDef.description,
            // @ts-ignore: dynamic zod access
            inputSchema: toolDef.inputSchema
        }, withScopeEnforcement(toolDef.name, async (args, extra)=>{
            try {
                const parsedArgs = toolDef.inputSchema.parse(args ?? {});
                // @ts-ignore: handler expected specific object
                const result = await toolDef.handler(parsedArgs, extra);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: ${msg}`
                        }
                    ],
                    isError: true
                };
            }
        }, toolDef.scopes));
    });
    // ── Local Corpus Context Source Tools ─────────
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$localCorpusTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["localCorpusTools"].forEach((toolDef)=>{
        server.registerTool(toolDef.name, {
            description: toolDef.description,
            // @ts-ignore: dynamic zod access
            inputSchema: toolDef.inputSchema
        }, withScopeEnforcement(toolDef.name, async (args, extra)=>{
            try {
                const parsedArgs = toolDef.inputSchema.parse(args ?? {});
                // @ts-ignore: handler expected specific object
                const result = await toolDef.handler(parsedArgs, extra);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(error)}`
                        }
                    ],
                    isError: true
                };
            }
        }, toolDef.scopes));
    });
    // ── Obsidian Context Source Tools ─────────────
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$tools$2f$obsidianTools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["obsidianTools"].forEach((toolDef)=>{
        server.registerTool(toolDef.name, {
            description: toolDef.description,
            // @ts-ignore: dynamic zod access
            inputSchema: toolDef.inputSchema
        }, withScopeEnforcement(toolDef.name, async (args, extra)=>{
            try {
                const parsedArgs = toolDef.inputSchema.parse(args ?? {});
                // @ts-ignore: handler expected specific object
                const result = await toolDef.handler(parsedArgs, extra);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: ${msg}`
                        }
                    ],
                    isError: true
                };
            }
        }, toolDef.scopes));
    });
    // ── Dynamic Skill Tools (from skills table) ──
    const skillToMcpToolName = (skill)=>`skill_${skill.name.replace(/[^a-z0-9_-]/gi, "_")}`;
    try {
        const enabledSkills = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["skillRegistry"].list().filter((s)=>s.enabled);
        for (const skill of enabledSkills){
            const toolName = skillToMcpToolName(skill);
            if (RESERVED_MCP_NAMES.has(toolName)) continue;
            server.registerTool(toolName, {
                description: skill.description,
                inputSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({}).passthrough()
            }, withScopeEnforcement(toolName, async (args, extra)=>{
                const scopeContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$scopeEnforcement$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveCallerScopeContext"])(extra, Array.from(MCP_ALLOWED_SCOPES));
                const apiKeyId = scopeContext.callerId || "mcp";
                try {
                    const execution = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$executor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["skillExecutor"].execute(skill.name, args ?? {}, {
                        apiKeyId
                    });
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(execution.output, null, 2)
                            }
                        ]
                    };
                } catch (err) {
                    const msg = err instanceof Error ? err.message : String(err);
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Error: ${msg}`
                            }
                        ],
                        isError: true
                    };
                }
            }, [
                "execute:skills"
            ]));
        }
    } catch  {
    // Skills not loaded yet — skip dynamic registration until next reconnect
    }
    return server;
}
async function startMcpStdio() {
    const server = createMcpServer();
    const transport = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$stdio$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["StdioServerTransport"]();
    const version = process.env.npm_package_version || "1.8.1";
    const stopHeartbeat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$runtimeHeartbeat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["startMcpHeartbeat"])({
        version,
        scopesEnforced: MCP_ENFORCE_SCOPES,
        allowedScopes: Array.from(MCP_ALLOWED_SCOPES),
        toolCount: TOTAL_MCP_TOOL_COUNT
    });
    const stopHeartbeatOnce = ()=>{
        stopHeartbeat();
    };
    process.once("exit", stopHeartbeatOnce);
    process.once("SIGINT", stopHeartbeatOnce);
    process.once("SIGTERM", stopHeartbeatOnce);
    console.error("[MCP] OmniRoute MCP Server starting (stdio transport)...");
    try {
        await server.connect(transport);
        console.error("[MCP] OmniRoute MCP Server connected and ready.");
    } finally{
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["closeAuditDb"])()) {
            console.error("[MCP] Audit database checkpointed and closed.");
        }
        stopHeartbeatOnce();
        process.off("exit", stopHeartbeatOnce);
        process.off("SIGINT", stopHeartbeatOnce);
        process.off("SIGTERM", stopHeartbeatOnce);
    }
}
// If this file is run directly, start stdio server
if (process.argv[1] && __TURBOPACK__import$2e$meta__.url.endsWith(process.argv[1].replace(/\\/g, "/"))) {
    startMcpStdio().catch((err)=>{
        console.error("[MCP] Fatal error:", err);
        process.exit(1);
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/mcp-server/httpTransport.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getMcpHttpStatus",
    ()=>getMcpHttpStatus,
    "handleMcpSSE",
    ()=>handleMcpSSE,
    "handleMcpStreamableHTTP",
    ()=>handleMcpStreamableHTTP,
    "isMcpHttpActive",
    ()=>isMcpHttpActive,
    "isMcpHttpTransportReady",
    ()=>isMcpHttpTransportReady,
    "protectMcpSseResponse",
    ()=>protectMcpSseResponse,
    "shutdownMcpHttp",
    ()=>shutdownMcpHttp
]);
/**
 * MCP HTTP Transport Layer — session-aware handlers for SSE and Streamable HTTP.
 *
 * Runs the MCP server **inside** the Next.js process so it can be toggled
 * from the dashboard without requiring `omniroute --mcp`.
 *
 * Transport modes:
 *   - SSE:             GET /api/mcp/sse (event stream)  +  POST /api/mcp/sse (messages)
 *   - Streamable HTTP: POST /api/mcp/stream (messages)  +  GET /api/mcp/stream (SSE stream)  +  DELETE /api/mcp/stream (session end)
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/server.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$httpAuthContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/mcp-server/httpAuthContext.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$webStandardStreamableHttp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@modelcontextprotocol/sdk/dist/esm/server/webStandardStreamableHttp.js [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$httpAuthContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$webStandardStreamableHttp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$httpAuthContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$webStandardStreamableHttp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
let _sseServer = null;
let _sseTransport = null;
let _sseStartedAt = null;
const _streamableSessions = new Map();
const MCP_SESSION_IDLE_MS = 5 * 60 * 1000;
const _mcpSessionSweep = setInterval(()=>{
    const now = Date.now();
    for (const [sessionId, session] of _streamableSessions){
        if (now - session.lastActivityAt > MCP_SESSION_IDLE_MS) {
            try {
                closeStreamableSession(sessionId);
            } catch  {}
        }
    }
}, 60_000);
if (typeof _mcpSessionSweep === "object" && "unref" in _mcpSessionSweep) {
    _mcpSessionSweep.unref?.();
}
function closeSseTransport() {
    if (_sseTransport) {
        try {
            _sseTransport.close();
        } catch  {
        // ignore shutdown errors
        }
    }
    _sseServer = null;
    _sseTransport = null;
    _sseStartedAt = null;
}
function closeStreamableSession(sessionId) {
    const session = _streamableSessions.get(sessionId);
    if (!session) {
        return;
    }
    try {
        session.transport.close();
    } catch  {
    // ignore shutdown errors
    }
    _streamableSessions.delete(sessionId);
}
function closeAllStreamableSessions() {
    for (const sessionId of _streamableSessions.keys()){
        closeStreamableSession(sessionId);
    }
}
function ensureSseServer() {
    if (_sseServer && _sseTransport) {
        return {
            server: _sseServer,
            transport: _sseTransport
        };
    }
    closeAllStreamableSessions();
    _sseServer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createMcpServer"])();
    _sseTransport = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$webStandardStreamableHttp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WebStandardStreamableHTTPServerTransport"]({
        sessionIdGenerator: ()=>(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])()
    });
    _sseStartedAt = Date.now();
    void _sseServer.connect(_sseTransport);
    console.log("[MCP] HTTP transport started (sse)");
    return {
        server: _sseServer,
        transport: _sseTransport
    };
}
function createStreamableSession() {
    closeSseTransport();
    const sessionId = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
    const server = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createMcpServer"])();
    const transport = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$server$2f$webStandardStreamableHttp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WebStandardStreamableHTTPServerTransport"]({
        sessionIdGenerator: ()=>sessionId
    });
    const session = {
        sessionId,
        server,
        transport,
        startedAt: Date.now(),
        lastActivityAt: Date.now()
    };
    void server.connect(transport);
    _streamableSessions.set(sessionId, session);
    console.log(`[MCP] HTTP transport started (streamable-http:${sessionId})`);
    return session;
}
async function isInitializeRequest(request) {
    if (request.method !== "POST") {
        return false;
    }
    try {
        const body = await request.clone().json();
        return body?.method === "initialize";
    } catch  {
        return false;
    }
}
/**
 * Resolve the caller's per-key scopes (#7895) and hand the request to the
 * transport with `authInfo` populated, so `extra.authInfo.scopes` reaching
 * tool handlers reflects the real `api_keys.scopes` row instead of the
 * `OMNIROUTE_MCP_SCOPES` env fallback. When no per-key auth can be resolved
 * (no key, invalid key, stdio has no `Request` at all), `authInfo` stays
 * `undefined` and `scopeEnforcement.ts` falls through to its existing
 * meta/env chain unchanged.
 */ async function handleRequestWithAuthInfo(transport, request) {
    const authInfo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$httpAuthContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveMcpCallerAuthInfo"])(request);
    return transport.handleRequest(request, {
        authInfo
    });
}
function errorResponse(message, code, status = 400) {
    return new Response(JSON.stringify({
        jsonrpc: "2.0",
        error: {
            code,
            message
        },
        id: null
    }), {
        status,
        headers: {
            "Content-Type": "application/json"
        }
    });
}
function protectMcpSseResponse(request, response) {
    if (request.method !== "POST" || !response.headers.get("content-type")?.toLowerCase().includes("text/event-stream")) {
        return response;
    }
    const headers = new Headers(response.headers);
    const cacheControl = headers.get("cache-control");
    if (!/(?:^|,)\s*no-transform(?:\s*(?:,|$))/i.test(cacheControl ?? "")) {
        headers.set("cache-control", [
            cacheControl,
            "no-transform"
        ].filter(Boolean).join(", "));
    }
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}
function withSessionHeader(response, sessionId) {
    if (response.headers.get("mcp-session-id")) {
        return response;
    }
    const headers = new Headers(response.headers);
    headers.set("mcp-session-id", sessionId);
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}
async function handleStreamableRequest(request) {
    const sessionId = request.headers.get("mcp-session-id");
    if (sessionId) {
        const session = _streamableSessions.get(sessionId);
        if (!session) {
            // MCP spec (2025-03-26 / 2025-11-25, Session Management): once a session is
            // terminated/unknown, the server MUST respond with HTTP 404 Not Found so the
            // client re-initializes. A 400 here is non-recoverable for spec-compliant
            // clients (they only re-init on 404). See issue #5169.
            //
            // Auto-recovery: if the client sends an initialize request with a stale session
            // id (e.g. after a server restart or idle eviction), treat it as a fresh
            // initialization rather than hard-failing with 404. This avoids requiring users
            // to manually restart their MCP client after every server restart.
            if (await isInitializeRequest(request)) {
                const newSession = createStreamableSession();
                try {
                    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$httpAuthContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withMcpHttpAuthContext"])(request, ()=>handleRequestWithAuthInfo(newSession.transport, request));
                    return withSessionHeader(response, newSession.sessionId);
                } catch (err) {
                    closeStreamableSession(newSession.sessionId);
                    console.error("[MCP] Streamable HTTP error during stale-session recovery:", err);
                    return new Response(JSON.stringify({
                        error: "MCP transport error"
                    }), {
                        status: 500,
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });
                }
            }
            return errorResponse("Not Found: Unknown Mcp-Session-Id header", -32000, 404);
        }
        try {
            session.lastActivityAt = Date.now();
            const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$httpAuthContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withMcpHttpAuthContext"])(request, ()=>handleRequestWithAuthInfo(session.transport, request));
            if (request.method === "DELETE") {
                closeStreamableSession(sessionId);
            }
            return withSessionHeader(response, sessionId);
        } catch (err) {
            console.error("[MCP] Streamable HTTP error:", err);
            if (request.method === "DELETE") {
                closeStreamableSession(sessionId);
            }
            return new Response(JSON.stringify({
                error: "MCP transport error"
            }), {
                status: 500,
                headers: {
                    "Content-Type": "application/json"
                }
            });
        }
    }
    if (!await isInitializeRequest(request)) {
        return errorResponse("Bad Request: Mcp-Session-Id header is required", -32000);
    }
    const session = createStreamableSession();
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$httpAuthContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withMcpHttpAuthContext"])(request, ()=>handleRequestWithAuthInfo(session.transport, request));
        return withSessionHeader(response, session.sessionId);
    } catch (err) {
        closeStreamableSession(session.sessionId);
        console.error("[MCP] Streamable HTTP error:", err);
        return new Response(JSON.stringify({
            error: "MCP transport error"
        }), {
            status: 500,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
}
async function handleMcpStreamableHTTP(request) {
    return protectMcpSseResponse(request, await handleStreamableRequest(request));
}
async function handleMcpSSE(request) {
    const { transport } = ensureSseServer();
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$mcp$2d$server$2f$httpAuthContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withMcpHttpAuthContext"])(request, ()=>handleRequestWithAuthInfo(transport, request));
        return protectMcpSseResponse(request, response);
    } catch (err) {
        console.error("[MCP] SSE error:", err);
        return new Response(JSON.stringify({
            error: "MCP SSE transport error"
        }), {
            status: 500,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
}
function getMcpHttpStatus() {
    const streamableStartedAt = _streamableSessions.size > 0 ? Math.min(...Array.from(_streamableSessions.values(), (session)=>session.startedAt)) : null;
    const startedAt = streamableStartedAt ?? _sseStartedAt;
    const transport = _streamableSessions.size > 0 ? "streamable-http" : _sseTransport ? "sse" : null;
    const online = transport !== null;
    return {
        online,
        transport,
        startedAt,
        uptime: startedAt ? `${Math.floor((Date.now() - startedAt) / 1000)}s` : null
    };
}
function isMcpHttpTransportReady(enabled, transport) {
    return enabled && (transport === "sse" || transport === "streamable-http");
}
function shutdownMcpHttp() {
    closeSseTransport();
    closeAllStreamableSessions();
    console.log("[MCP] HTTP transport shutdown");
}
function isMcpHttpActive() {
    return _sseTransport !== null || _streamableSessions.size > 0;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=open-sse_mcp-server_0b_74zb._.js.map