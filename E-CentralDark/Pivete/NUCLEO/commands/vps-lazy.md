# COMANDO - vps-lazy.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\dist\tools\vps\vps-lazy.js
**SHA:** f594f653b58d1a6e
**Timestamp:** 2026-08-28T02:54:42.361471
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Math.max(0, startLine - 1);

### Padroes
- const pattern = new RegExp(input.regex ? input.query : escapeRegex(input.query), flags);

### Ouro Bruto (primeiros 5000 chars)
```
import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { config } from "../../config.js";
import { sanitize } from "./vps.js";
import { log } from "../../log.js";
import { auditLog } from "../../lib/audit.js";
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
    // 🔓 Liberado 04/07/2026 (ordem do Pivete): docker/caddy/pm2 restart livres pra acelerar deploy.
    // Nenhum usuário externo no sistema — risco controlado.
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
    let tot
```

---

# COMANDO - vps-lazy.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\src\tools\vps\vps-lazy.js
**SHA:** 7e065daf0a9dba60
**Timestamp:** 2026-08-28T02:54:51.226232
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Math.max(0, startLine - 1);

### Padroes
- const pattern = new RegExp(input.regex ? input.query : escapeRegex(input.query), flags);

### Ouro Bruto (primeiros 5000 chars)
```
import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { config } from "../../config.js";
import { sanitize } from "./vps.js";
import { log } from "../../log.js";
import { auditLog } from "../../lib/audit.js";
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
    // 🔓 Liberado 04/07/2026 (ordem do Pivete): docker/caddy/pm2 restart livres pra acelerar deploy.
    // Nenhum usuário externo no sistema — risco controlado.
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
    let tot
```