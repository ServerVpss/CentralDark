module.exports = [
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
"[project]/src/lib/compliance/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cleanupExpiredLogs",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["cleanupExpiredLogs"],
    "countAuditLog",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["countAuditLog"],
    "getAuditLog",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAuditLog"],
    "getAuditRequestContext",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAuditRequestContext"],
    "getRetentionDays",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRetentionDays"],
    "initAuditLog",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["initAuditLog"],
    "isNoLog",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$noLog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isNoLog"],
    "logAuditEvent",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["logAuditEvent"],
    "setNoLog",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$noLog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setNoLog"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/compliance/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$noLog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/compliance/noLog.ts [app-route] (ecmascript)");
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__02anygk._.js.map