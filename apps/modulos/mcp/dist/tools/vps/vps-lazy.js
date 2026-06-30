import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { config } from "../../config.js";
import { sanitize } from "./vps.js";
import { log } from "../../log.js";
const DEFAULT_MAX_BYTES = 80_000;
const DEFAULT_MAX_LINES = 500;
const MAX_READ_BYTES = 500_000;
const MAX_SEARCH_FILES = 2_000;
const MAX_SEARCH_MATCHES = 200;
const DEFAULT_TIMEOUT_MS = 60_000;
const MAX_COMMAND_OUTPUT_BYTES = 160_000;
const DENY_PATH = /(^|\/)(\.env|secrets?|credenciais|tokens?|sessions?|sessao|sessão|cofre|\.ssh)(\/|$)|\.(pem|key|p12|pfx|sqlite|sqlite3|db|dump|bak|backup)$/i;
const SKIP_DIRS = new Set([
    ".git",
    "node_modules",
    ".next",
    "dist",
    "build",
    "coverage",
    ".cache",
    "secrets",
    "cofre",
    "sessions",
    "session",
    "auth_info_baileys",
    "wwebjs_auth",
    "wwebjs_cache",
]);
const DENY_COMMAND_PATTERNS = [
    /\brm\s+-rf\s+\/(\s|$)/i,
    /\brm\s+-rf\s+\*/i,
    /\bmkfs\b/i,
    /\bdd\s+if=/i,
    /\bshutdown\b/i,
    /\breboot\b/i,
    /\bpoweroff\b/i,
    /\bpasswd\b/i,
    /\buserdel\b/i,
    /\bchmod\s+-R\s+777\s+\//i,
    /\bchown\s+-R\s+[^ ]+\s+\//i,
    /\bdocker\s+(restart|rm|rmi|compose\s+down|stop|kill)\b/i,
    /\bcaddy\s+(reload|stop|start|restart|fmt|adapt)\b/i,
    /\bpm2\s+(delete|kill|flush|stop\s+all|restart\s+all)\b/i,
    /(^|\/)(\.env|secrets?|credenciais|tokens?|sessions?|sessao|sessão|cofre)(\/|$)/i,
];
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function roots() {
    return {
        project: path.resolve(config.vps.repoPath),
        mcp: path.resolve(config.vps.repoPath, "apps/mcp"),
        tmp: "/tmp",
    };
}
function inside(parent, child) {
    const rel = path.relative(parent, child);
    return rel === "" || (!!rel && !rel.startsWith("..") && !path.isAbsolute(rel));
}
function assertPathAllowed(abs) {
    const normalized = abs.replace(/\\/g, "/");
    if (DENY_PATH.test(normalized)) {
        throw new Error("Path bloqueado por seguranca.");
    }
}
function resolvePath(inputPath, rootKey = "project") {
    const all = roots();
    const root = all[rootKey];
    if (!root)
        throw new Error("Root invalido.");
    const raw = inputPath.replace(/\\/g, "/");
    if (!raw.trim())
        throw new Error("Path obrigatorio.");
    if (raw.includes(".."))
        throw new Error("Path invalido.");
    const candidates = Object.entries(all);
    let abs;
    let resolvedRootName = rootKey;
    let resolvedRoot = root;
    if (path.isAbsolute(raw)) {
        abs = path.resolve(raw);
        const match = candidates.find(([, candidateRoot]) => inside(candidateRoot, abs));
        if (!match)
            throw new Error("Path absoluto fora das raizes permitidas.");
        resolvedRootName = match[0];
        resolvedRoot = match[1];
    }
    else {
        abs = path.resolve(root, raw.replace(/^\/+/, ""));
    }
    if (!inside(resolvedRoot, abs))
        throw new Error("Path fora da raiz permitida.");
    assertPathAllowed(abs);
    return {
        root: resolvedRootName,
        rootPath: resolvedRoot,
        abs,
        rel: path.relative(resolvedRoot, abs).replace(/\\/g, "/") || ".",
    };
}
async function statOrNull(abs) {
    try {
        return await fs.stat(abs);
    }
    catch {
        return null;
    }
}
async function readTail(abs, bytes) {
    const st = await fs.stat(abs);
    const readBytes = Math.min(bytes, st.size);
    const handle = await fs.open(abs, "r");
    try {
        const buffer = Buffer.alloc(readBytes);
        await handle.read(buffer, 0, readBytes, Math.max(0, st.size - readBytes));
        return buffer.toString("utf8");
    }
    finally {
        await handle.close();
    }
}
async function readHead(abs, bytes) {
    const handle = await fs.open(abs, "r");
    try {
        const buffer = Buffer.alloc(bytes);
        const { bytesRead } = await handle.read(buffer, 0, bytes, 0);
        return buffer.subarray(0, bytesRead).toString("utf8");
    }
    finally {
        await handle.close();
    }
}
function linePage(text, startLine, maxLines) {
    const lines = text.split(/\r?\n/);
    const start = Math.max(0, startLine - 1);
    return {
        totalLinesInWindow: lines.length,
        returnedStartLine: start + 1,
        returnedEndLine: Math.min(lines.length, start + maxLines),
        text: lines.slice(start, start + maxLines).join("\n"),
        lineTruncated: lines.length > start + maxLines,
    };
}
function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function isBinary(buf) {
    return buf.subarray(0, Math.min(buf.length, 4096)).includes(0);
}
function blockedCommand(command) {
    return DENY_COMMAND_PATTERNS
        .filter((pattern) => pattern.test(command))
        .map((pattern) => String(pattern));
}
function appendLimited(chunks, chunk, maxBytes) {
    chunks.push(chunk);
    let total = chunks.reduce((sum, item) => sum + item.length, 0);
    while (total > maxBytes && chunks.length > 1) {
        const removed = chunks.shift();
        total -= removed?.length ?? 0;
    }
    if (total > maxBytes && chunks.length === 1) {
        chunks[0] = chunks[0].subarray(chunks[0].length - maxBytes);
    }
}
async function runCommand(input) {
    if (process.env.MCP_ALLOW_VPS_COMMANDS !== "true") {
        const motivo = "MCP_ALLOW_VPS_COMMANDS precisa ser true para executar comandos.";
        const __bloqEvt = { timestamp: new Date().toISOString(), level: "warn", service: "CentralDark-MCP", event: "mcp_command_bloqueado_config", status: "BLOQUEADO_CONFIG", tool: "execute_command", flag: "MCP_ALLOW_VPS_COMMANDS", motivo, currentValue: process.env.MCP_ALLOW_VPS_COMMANDS || "(undefined)" };
        log.warn("mcp_command_bloqueado_config", __bloqEvt);
        try {
            const __fs = require("fs");
            const __path = require("path");
            const __dir = __path.join(process.cwd(), "logs");
            __fs.mkdirSync(__dir, { recursive: true });
            const __dia = __bloqEvt.timestamp.slice(0, 10);
            __fs.appendFileSync(__path.join(__dir, `mcp-blocked-${__dia}.jsonl`), JSON.stringify(__bloqEvt) + "\n", { mode: 0o600 });
        } catch (__e) { /* nao quebra o fluxo */ }
        return {
            status: "BLOQUEADO_CONFIG",
            reason: motivo,
        };
    }
    const blocked = blockedCommand(input.command);
    if (blocked.length > 0) {
        return {
            status: "BLOQUEADO",
            reason: "Comando contem padrao perigoso ou caminho sensivel.",
            blockedPatterns: blocked,
        };
    }
    const cwdTarget = resolvePath(input.cwd ?? ".", input.root ?? "project");
    const st = await statOrNull(cwdTarget.abs);
    if (!st?.isDirectory())
        throw new Error("cwd nao e diretorio.");
    const timeoutMs = Math.min(input.timeoutMs ?? DEFAULT_TIMEOUT_MS, DEFAULT_TIMEOUT_MS);
    const maxOutputBytes = Math.min(input.maxOutputBytes ?? MAX_COMMAND_OUTPUT_BYTES, MAX_COMMAND_OUTPUT_BYTES);
    return await new Promise((resolve) => {
        const stdoutChunks = [];
        const stderrChunks = [];
        let timedOut = false;
        let killed = false;
        const child = spawn(input.command, {
            cwd: cwdTarget.abs,
            shell: "/bin/bash",
            env: process.env,
            stdio: ["ignore", "pipe", "pipe"],
        });
        const timer = setTimeout(() => {
            timedOut = true;
            killed = child.kill("SIGTERM");
            setTimeout(() => {
                if (!child.killed)
                    child.kill("SIGKILL");
            }, 1_000).unref();
        }, timeoutMs);
        child.stdout.on("data", (chunk) => appendLimited(stdoutChunks, chunk, maxOutputBytes));
        child.stderr.on("data", (chunk) => appendLimited(stderrChunks, chunk, maxOutputBytes));
        child.on("error", (err) => {
            clearTimeout(timer);
            resolve({
                status: "ERRO_SPAWN",
                cwd: cwdTarget.rel,
                error: String(err),
            });
        });
        child.on("close", (code, signal) => {
            clearTimeout(timer);
            const stdout = sanitize(Buffer.concat(stdoutChunks).toString("utf8"));
            const stderr = sanitize(Buffer.concat(stderrChunks).toString("utf8"));
            resolve({
                status: timedOut ? "TIMEOUT" : code === 0 ? "OK" : "FALHOU",
                cwd: cwdTarget.abs,
                command: input.command,
                exitCode: code,
                signal,
                timedOut,
                killed,
                timeoutMs,
                stdoutTruncatedToTailBytes: maxOutputBytes,
                stdout,
                stderr,
            });
        });
    });
}
export const vpsLazyTools = [
    {
        name: "read_file",
        description: "Le arquivo local com lazy loading, paginacao por linhas, tail seguro e limite de bytes. Arquivos grandes retornam as ultimas linhas e avisam truncamento.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Read file lazy" },
        inputSchema: z.object({
            path: z.string().min(1),
            root: z.enum(["project", "mcp", "tmp"]).optional(),
            startLine: z.number().int().min(1).optional(),
            maxLines: z.number().int().min(1).max(2_000).optional(),
            tailLines: z.number().int().min(1).max(2_000).optional(),
            maxBytes: z.number().int().min(1).max(MAX_READ_BYTES).optional(),
        }),
        handler: async (input) => {
            const target = resolvePath(input.path, input.root ?? "project");
            const st = await statOrNull(target.abs);
            if (!st)
                return ok({ status: "NAO_ENCONTRADO", ...target });
            if (!st.isFile())
                return ok({ status: "NAO_E_ARQUIVO", ...target, type: st.isDirectory() ? "dir" : "outro" });
            const maxBytes = input.maxBytes ?? DEFAULT_MAX_BYTES;
            const maxLines = input.tailLines ?? input.maxLines ?? DEFAULT_MAX_LINES;
            const shouldTail = !!input.tailLines || st.size > maxBytes;
            const raw = shouldTail ? await readTail(target.abs, maxBytes) : await readHead(target.abs, Math.min(st.size, maxBytes));
            const page = shouldTail
                ? {
                    totalLinesInWindow: raw.split(/\r?\n/).length,
                    returnedStartLine: null,
                    returnedEndLine: null,
                    text: raw.split(/\r?\n/).slice(-maxLines).join("\n"),
                    lineTruncated: true,
                }
                : linePage(raw, input.startLine ?? 1, maxLines);
            const truncated = st.size > maxBytes || page.lineTruncated;
            return ok({
                status: "OK",
                root: target.root,
                path: target.rel,
                abs: target.abs,
                sizeBytes: st.size,
                mode: shouldTail ? "tail" : "page",
                truncated,
                warning: truncated ? "Arquivo truncado por seguranca." : null,
                maxBytes,
                maxLines,
                returnedStartLine: page.returnedStartLine,
                returnedEndLine: page.returnedEndLine,
                content: sanitize(page.text),
            });
        },
    },
    {
        name: "search_files",
        description: "Busca termos dentro da VPS sem abrir arquivos inteiros. Pula secrets, node_modules, .git, sessoes e arquivos grandes demais.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Search files" },
        inputSchema: z.object({
            query: z.string().min(1),
            path: z.string().optional(),
            root: z.enum(["project", "mcp", "tmp"]).optional(),
            regex: z.boolean().optional(),
            caseSensitive: z.boolean().optional(),
            maxFiles: z.number().int().min(1).max(MAX_SEARCH_FILES).optional(),
            maxMatches: z.number().int().min(1).max(MAX_SEARCH_MATCHES).optional(),
            maxBytesPerFile: z.number().int().min(1).max(MAX_READ_BYTES).optional(),
        }),
        handler: async (input) => {
            const target = resolvePath(input.path ?? ".", input.root ?? "project");
            const maxFiles = input.maxFiles ?? 500;
            const maxMatches = input.maxMatches ?? 100;
            const maxBytesPerFile = input.maxBytesPerFile ?? 120_000;
            const flags = input.caseSensitive ? "g" : "gi";
            const pattern = new RegExp(input.regex ? input.query : escapeRegex(input.query), flags);
            const matches = [];
            const skipped = [];
            let scannedFiles = 0;
            let truncated = false;
            async function walk(abs) {
                if (scannedFiles >= maxFiles || matches.length >= maxMatches) {
                    truncated = true;
                    return;
                }
                const entries = await fs.readdir(abs, { withFileTypes: true });
                for (const entry of entries) {
                    if (scannedFiles >= maxFiles || matches.length >= maxMatches) {
                        truncated = true;
                        return;
                    }
                    if (SKIP_DIRS.has(entry.name))
                        continue;
                    const child = path.join(abs, entry.name);
                    const rel = path.relative(target.rootPath, child).replace(/\\/g, "/");
                    if (DENY_PATH.test(rel)) {
                        skipped.push({ path: rel, reason: "path_sensivel" });
                        continue;
                    }
                    if (entry.isDirectory()) {
                        await walk(child);
                        continue;
                    }
                    if (!entry.isFile())
                        continue;
                    scannedFiles += 1;
                    const st = await fs.stat(child);
                    if (st.size > maxBytesPerFile) {
                        skipped.push({ path: rel, reason: "arquivo_grande" });
                        continue;
                    }
                    const buf = await fs.readFile(child);
                    if (isBinary(buf)) {
                        skipped.push({ path: rel, reason: "binario" });
                        continue;
                    }
                    const lines = buf.toString("utf8").split(/\r?\n/);
                    for (let i = 0; i < lines.length; i += 1) {
                        pattern.lastIndex = 0;
                        if (pattern.test(lines[i])) {
                            matches.push({ path: rel, line: i + 1, text: sanitize(lines[i].slice(0, 500)) });
                            if (matches.length >= maxMatches) {
                                truncated = true;
                                return;
                            }
                        }
                    }
                }
            }
            await walk(target.abs);
            return ok({
                status: "OK",
                root: target.root,
                path: target.rel,
                query: input.query,
                scannedFiles,
                returned: matches.length,
                truncated,
                matches,
                skipped: skipped.slice(0, 100),
            });
        },
    },
    {
        name: "execute_command",
        description: "Executa comando bash na VPS com stdout/stderr separados, timeout maximo de 60s, truncamento de output e respeito a MCP_ALLOW_VPS_COMMANDS=true.",
        annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false, title: "Execute command" },
        inputSchema: z.object({
            command: z.string().min(1).max(8_000),
            cwd: z.string().optional(),
            root: z.enum(["project", "mcp", "tmp"]).optional(),
            timeoutMs: z.number().int().min(1_000).max(DEFAULT_TIMEOUT_MS).optional(),
            maxOutputBytes: z.number().int().min(1_000).max(MAX_COMMAND_OUTPUT_BYTES).optional(),
        }),
        handler: async (input) => ok(await runCommand(input)),
    },
];
//# sourceMappingURL=vps-lazy.js.map