module.exports = [
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

//# sourceMappingURL=%5Broot-of-the-server%5D__0i65vwm._.js.map