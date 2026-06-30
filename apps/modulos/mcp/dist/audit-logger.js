import fs from "node:fs";
import path from "node:path";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
const LOG_DIR = process.env.MCP_LOG_DIR || "/root/CentralDark/apps/mcp/logs";
const MAX_STRING_LENGTH = 8_000;
const MAX_ARRAY_ITEMS = 100;
const MAX_OBJECT_KEYS = 120;
const MAX_DEPTH = 8;
const SENSITIVE_KEY_RE = /(authorization|cookie|set-cookie|password|passwd|senha|secret|token|api[_-]?key|private[_-]?key|client[_-]?secret|refresh[_-]?token|access[_-]?token|gh[_-]?token|session|credential|credencial)/i;
const PRIVATE_KEY_RE = /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g;
const BEARER_RE = /\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/gi;
const GITHUB_TOKEN_RE = /\b(?:gh[pousr]_[A-Za-z0-9_]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/g;
const JWT_RE = /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g;
const OPENAI_KEY_RE = /\bsk-[A-Za-z0-9_-]{20,}\b/g;
const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
function ensureLogDir() {
    fs.mkdirSync(LOG_DIR, { recursive: true, mode: 0o700 });
    try {
        fs.chmodSync(LOG_DIR, 0o700);
    }
    catch {
        /* best effort */
    }
}
function secureFile(file) {
    try {
        if (fs.existsSync(file))
            fs.chmodSync(file, 0o600);
    }
    catch {
        /* best effort */
    }
}
function secureExistingLogs() {
    try {
        for (const name of fs.readdirSync(LOG_DIR)) {
            if (/^mcp-(audit|app)-/.test(name) || /^\.mcp-(audit|app)-rotation\.json$/.test(name)) {
                secureFile(path.join(LOG_DIR, name));
            }
        }
    }
    catch {
        /* best effort */
    }
}
function redactString(value) {
    const redacted = value
        .replace(PRIVATE_KEY_RE, "[REDACTED_PRIVATE_KEY]")
        .replace(BEARER_RE, "Bearer [REDACTED]")
        .replace(GITHUB_TOKEN_RE, "[REDACTED_GITHUB_TOKEN]")
        .replace(JWT_RE, "[REDACTED_JWT]")
        .replace(OPENAI_KEY_RE, "[REDACTED_API_KEY]")
        .replace(EMAIL_RE, "[REDACTED_EMAIL]");
    if (redacted.length <= MAX_STRING_LENGTH)
        return redacted;
    return `${redacted.slice(0, MAX_STRING_LENGTH)}...[TRUNCATED:${redacted.length}]`;
}
function sanitizeValue(value, depth = 0, seen = new WeakSet()) {
    if (value === null || value === undefined)
        return null;
    if (typeof value === "string")
        return redactString(value);
    if (typeof value === "number" || typeof value === "boolean")
        return value;
    if (typeof value === "bigint")
        return value.toString();
    if (typeof value === "function" || typeof value === "symbol")
        return `[${typeof value}]`;
    if (value instanceof Error) {
        return {
            name: redactString(value.name),
            message: redactString(value.message),
            stack: value.stack ? redactString(value.stack) : null,
        };
    }
    if (depth >= MAX_DEPTH)
        return "[MAX_DEPTH]";
    if (typeof value === "object") {
        if (seen.has(value))
            return "[CIRCULAR]";
        seen.add(value);
        if (Array.isArray(value)) {
            const items = value.slice(0, MAX_ARRAY_ITEMS).map((item) => sanitizeValue(item, depth + 1, seen));
            if (value.length > MAX_ARRAY_ITEMS)
                items.push(`[TRUNCATED:${value.length - MAX_ARRAY_ITEMS}]`);
            return items;
        }
        const out = {};
        const entries = Object.entries(value).slice(0, MAX_OBJECT_KEYS);
        for (const [key, item] of entries) {
            out[key] = SENSITIVE_KEY_RE.test(key) ? "[REDACTED]" : sanitizeValue(item, depth + 1, seen);
        }
        const totalKeys = Object.keys(value).length;
        if (totalKeys > MAX_OBJECT_KEYS)
            out.__truncatedKeys = totalKeys - MAX_OBJECT_KEYS;
        return out;
    }
    return String(value);
}
function toJsonLine(info) {
    const { level, message, ...meta } = info;
    const event = typeof message === "string" ? message : "mcp_log";
    const safeMeta = sanitizeValue(meta);
    const metaObject = safeMeta && typeof safeMeta === "object" && !Array.isArray(safeMeta)
        ? safeMeta
        : {};
    return JSON.stringify({
        timestamp: new Date().toISOString(),
        level: typeof level === "string" ? level : "info",
        service: "CentralDark-MCP",
        event,
        ...metaObject,
    });
}
function makeTransport(prefix) {
    const auditFile = path.join(LOG_DIR, `.mcp-${prefix}-rotation.json`);
    const transport = new DailyRotateFile({
        filename: path.join(LOG_DIR, `mcp-${prefix}-%DATE%.jsonl`),
        datePattern: "YYYY-MM-DD",
        maxSize: "20m",
        maxFiles: "30d",
        auditFile,
        zippedArchive: false,
        options: { flags: "a", mode: 0o600 },
    });
    transport.on("new", secureFile);
    transport.on("rotate", (_oldFile, newFile) => {
        secureFile(newFile);
        secureFile(auditFile);
    });
    transport.on("error", () => {
        /* fail closed: never throw into MCP request flow */
    });
    secureFile(auditFile);
    return transport;
}
ensureLogDir();
secureExistingLogs();
const jsonlFormat = winston.format.printf(toJsonLine);
const appLogger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: jsonlFormat,
    transports: [makeTransport("app")],
    exitOnError: false,
});
const auditLogger = winston.createLogger({
    level: "info",
    format: jsonlFormat,
    transports: [makeTransport("audit")],
    exitOnError: false,
});
appLogger.on("error", () => { });
auditLogger.on("error", () => { });
export function logApp(level, event, meta) {
    try {
        appLogger.log({ level, message: event, ...(meta ?? {}) });
        secureExistingLogs();
    }
    catch {
        /* logging must never break MCP protocol */
    }
}
export function auditToolExecution(entry) {
    try {
        auditLogger.info("mcp_tool_execution", entry);
        secureExistingLogs();
    }
    catch {
        /* logging must never break MCP protocol */
    }
}
export function sanitizeForLog(value) {
    return sanitizeValue(value);
}
//# sourceMappingURL=audit-logger.js.map