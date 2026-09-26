# COMANDO - vps.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\src\tools\vps.ts
**SHA:** 0eded72de436d6d7
**Timestamp:** 2026-08-26T19:32:45.493035
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dryRun: z.boolean().optional().describe("Padrão true. Use false somente com confirmação explícita."),
- const dryRun = input.dryRun ?? true;
- "Nada foi apagado. Para limpeza real, chame de novo com dryRun=false e confirmação explícita do usuário.",
- dryRun: z.boolean().optional(),
- note: "Nada foi executado. Envie dryRun=false e confirmacao literal para executar.",

### Padroes
- pattern: z.string().min(1).describe("Texto ou regex pra buscar no log (case-insensitive)"),
- handler: async (input: { service: string; pattern: string; lines?: number }) => {
- return text(`exit=${res.exitCode}\npattern=${input.pattern}\n--- matches ---\n${res.stdout}\n--- stderr ---\n${res.stderr}`);
- branch: z.string().optional().describe("Branch específica (padrão: main)"),

### Ouro Bruto (primeiros 5000 chars)
```
// Tools MCP de operação na VPS.
// Read-only marcadas como readOnlyHint=true.
// Restart/limpeza real são destrutivos.

import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { config } from "../config.js";
import { allowedServices, canRestart, runShell, sanitize } from "../vps.js";

function text(s: string) {
  return { content: [{ type: "text" as const, text: s }] };
}

function ok(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

const READ_ANNOT = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

const WRITE_ANNOT = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: false,
};

const DESTRUCTIVE_ANNOT = {
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: false,
  openWorldHint: false,
};

// Lista branca de comandos "diagnóstico" que não precisam ser PM2/git.
const SAFE_COMMANDS = new Set([
  "pm2 ls",
  "pm2 status",
  "df -h",
  "free -h",
  "uptime",
  "uname -a",
  "node --version",
  "npm --version",
]);

const RUN_COMMAND_CONFIRM_PHRASE = "CONFIRMO EXECUTAR COMANDO";

const RUN_COMMAND_DENY_PATTERNS: RegExp[] = [
  /\brm\s+-rf\s+(\/|\*|~|\.{1,2})(\s|$)/i,
  /\bmkfs(\.| )/i,
  /\bdd\s+if=/i,
  /\b(shutdown|reboot|poweroff|halt)\b/i,
  /\b(passwd|userdel|groupdel)\b/i,
  /\bchmod\s+-R\s+777\s+\//i,
  /\bchown\s+-R\s+\S+\s+\//i,
  /\bdocker\s+(restart|stop|kill|rm|rmi|system\s+prune)\b/i,
  /\bdocker\s+compose\s+(down|restart|rm|kill)\b/i,
  /\bcaddy\s+(reload|restart|stop|start|fmt|adapt)\b/i,
  /\bpm2\s+(delete|kill|flush)\b/i,
  /\bpm2\s+(restart|stop)\s+(all|\*)\b/i,
  /(^|\/)\.env(\.|$|\/)/i,
  /(^|\/)(secrets?|tokens?|sessions?|credenciais?|credentials?|private)(\/|$)/i,
  /(^|\/)\.ssh(\/|$)/i,
  /\.(pem|key|p12|pfx)(\s|$)/i,
];

type RunCommandRoot = "project" | "mcp" | "mcpRepo";

function commandRoot(root: RunCommandRoot = "project") {
  if (root === "mcp") return process.cwd();
  if (root === "mcpRepo") return path.resolve(process.cwd(), "../../..");
  return repoRoot();
}

function blockedCommandPatterns(command: string) {
  return RUN_COMMAND_DENY_PATTERNS.filter((pattern) => pattern.test(command)).map(
    (pattern) => pattern.source,
  );
}

const CLEANABLE_DIR_NAMES = new Set([
  ".cache",
  ".turbo",
  ".vite",
  ".next-cache",
  ".tmp",
  "cache",
  "coverage",
  "tmp",
  "temp",
  "worktrees",
]);

const CLEANUP_CONFIRM_PHRASE = "CONFIRMO LIMPAR";

const CLEANUP_DENY_PATHS = [
  /\/apps\/crm(\/|$)/i,
  /\/credenciais(\/|$)/i,
  /\/secrets?(\/|$)/i,
  /\/sessions?(\/|$)/i,
  /\/sess(?:ao|ão|oes|ões)(\/|$)/i,
  /\/tokens?(\/|$)/i,
];

function normalizeFsPath(p: string): string {
  return path.resolve(p).replace(/\\/g, "/");
}

function repoRoot(): string {
  return normalizeFsPath(config.vps.repoPath);
}

function isInside(parent: string, child: string): boolean {
  const rel = path.relative(parent, child);
  return rel === "" || (!!rel && !rel.startsWith("..") && !path.isAbsolute(rel));
}

function hasDeniedPath(abs: string): boolean {
  const normalized = normalizeFsPath(abs);
  return CLEANUP_DENY_PATHS.some((pattern) => pattern.test(normalized));
}

function cleanupKind(dirName: string): string {
  if (dirName === "worktrees") return "worktrees temporários de agente externo";
  if (["tmp", "temp", ".tmp"].includes(dirName)) return "temporário";
  if ([".cache", "cache", ".turbo", ".vite", ".next-cache"].includes(dirName)) return "cache";
  if (dirName === "coverage") return "relatório temporário de teste";
  return "pasta temporária";
}

async function pathIsDirectory(abs: string): Promise<boolean> {
  try {
    const st = await fs.stat(abs);
    return st.isDirectory();
  } catch {
    return false;
  }
}

async function dirSizeHuman(abs: string): Promise<string> {
  const res = await runShell(`du -sh -- ${JSON.stringify(abs)} 2>/dev/null | awk '{print $1}'`, {
    cwd: repoRoot(),
    timeoutMs: 20_000,
  });
  if (res.exitCode !== 0) return "?";
  return res.stdout.trim().split(/\s+/)[0] || "?";
}

async function collectCleanableDirs(maxDepth: number): Promise<
  Array<{
    path: string;
    name: string;
    size: string;
    kind: string;
    cleanupAllowed: boolean;
  }>
> {
  const root = repoRoot();
  const found: string[] = [];

  async function walk(current: string, depthLeft: number): Promise<void> {
    if (depthLeft < 0 || found.length >= 100) return;
    if (!isInside(root, current) || hasDeniedPath(current)) return;

    let entries: import("node:fs").Dirent[];
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const abs = normalizeFsPath(path.join(current, entry.name));
      if (hasDeniedPath(abs)) continue;

      if (CLEANABLE_DIR_NAMES.has(entry.name)) {
        found.push(abs);
        continue;

```

---

# COMANDO - vps.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\CentralDark\apps\mcp\src\tools\vps.ts
**SHA:** 230949ef2e4fef04
**Timestamp:** 2026-08-26T19:34:24.522331
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dryRun: z.boolean().optional().describe("Padrão true. Use false somente com confirmação explícita."),
- const dryRun = input.dryRun ?? true;
- "Nada foi apagado. Para limpeza real, chame de novo com dryRun=false e confirmação explícita do usuário.",

### Padroes
- pattern: z.string().min(1).describe("Texto ou regex pra buscar no log (case-insensitive)"),
- handler: async (input: { service: string; pattern: string; lines?: number }) => {
- return text(`exit=${res.exitCode}\npattern=${input.pattern}\n--- matches ---\n${res.stdout}\n--- stderr ---\n${res.stderr}`);
- branch: z.string().optional().describe("Branch específica (padrão: main)"),

### Ouro Bruto (primeiros 5000 chars)
```
// Tools MCP de operação na VPS.
// Read-only marcadas como readOnlyHint=true.
// Restart/limpeza real são destrutivos.

import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { config } from "../config.js";
import { allowedServices, canRestart, runShell, sanitize } from "../vps.js";

function text(s: string) {
  return { content: [{ type: "text" as const, text: s }] };
}

function ok(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

const READ_ANNOT = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

const WRITE_ANNOT = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: false,
};

const DESTRUCTIVE_ANNOT = {
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: false,
  openWorldHint: false,
};

// Lista branca de comandos "diagnóstico" que não precisam ser PM2/git.
const SAFE_COMMANDS = new Set([
  "pm2 ls",
  "pm2 status",
  "df -h",
  "free -h",
  "uptime",
  "uname -a",
  "node --version",
  "npm --version",
]);

const CLEANABLE_DIR_NAMES = new Set([
  ".cache",
  ".turbo",
  ".vite",
  ".next-cache",
  ".tmp",
  "cache",
  "coverage",
  "tmp",
  "temp",
  "worktrees",
]);

const CLEANUP_CONFIRM_PHRASE = "CONFIRMO LIMPAR";

const CLEANUP_DENY_PATHS = [
  /\/apps\/crm(\/|$)/i,
  /\/credenciais(\/|$)/i,
  /\/secrets?(\/|$)/i,
  /\/sessions?(\/|$)/i,
  /\/sess(?:ao|ão|oes|ões)(\/|$)/i,
  /\/tokens?(\/|$)/i,
];

function normalizeFsPath(p: string): string {
  return path.resolve(p).replace(/\\/g, "/");
}

function repoRoot(): string {
  return normalizeFsPath(config.vps.repoPath);
}

function isInside(parent: string, child: string): boolean {
  const rel = path.relative(parent, child);
  return rel === "" || (!!rel && !rel.startsWith("..") && !path.isAbsolute(rel));
}

function hasDeniedPath(abs: string): boolean {
  const normalized = normalizeFsPath(abs);
  return CLEANUP_DENY_PATHS.some((pattern) => pattern.test(normalized));
}

function cleanupKind(dirName: string): string {
  if (dirName === "worktrees") return "worktrees temporários de agente externo";
  if (["tmp", "temp", ".tmp"].includes(dirName)) return "temporário";
  if ([".cache", "cache", ".turbo", ".vite", ".next-cache"].includes(dirName)) return "cache";
  if (dirName === "coverage") return "relatório temporário de teste";
  return "pasta temporária";
}

async function pathIsDirectory(abs: string): Promise<boolean> {
  try {
    const st = await fs.stat(abs);
    return st.isDirectory();
  } catch {
    return false;
  }
}

async function dirSizeHuman(abs: string): Promise<string> {
  const res = await runShell(`du -sh -- ${JSON.stringify(abs)} 2>/dev/null | awk '{print $1}'`, {
    cwd: repoRoot(),
    timeoutMs: 20_000,
  });
  if (res.exitCode !== 0) return "?";
  return res.stdout.trim().split(/\s+/)[0] || "?";
}

async function collectCleanableDirs(maxDepth: number): Promise<
  Array<{
    path: string;
    name: string;
    size: string;
    kind: string;
    cleanupAllowed: boolean;
  }>
> {
  const root = repoRoot();
  const found: string[] = [];

  async function walk(current: string, depthLeft: number): Promise<void> {
    if (depthLeft < 0 || found.length >= 100) return;
    if (!isInside(root, current) || hasDeniedPath(current)) return;

    let entries: import("node:fs").Dirent[];
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const abs = normalizeFsPath(path.join(current, entry.name));
      if (hasDeniedPath(abs)) continue;

      if (CLEANABLE_DIR_NAMES.has(entry.name)) {
        found.push(abs);
        continue;
      }

      if (entry.name === "node_modules" || entry.name === ".git") continue;
      await walk(abs, depthLeft - 1);
    }
  }

  await walk(root, maxDepth);

  const unique = [...new Set(found)].sort();
  const candidates = [];
  for (const abs of unique) {
    const name = path.basename(abs);
    candidates.push({
      path: abs,
      name,
      size: await dirSizeHuman(abs),
      kind: cleanupKind(name),
      cleanupAllowed: CLEANABLE_DIR_NAMES.has(name) && !hasDeniedPath(abs) && isInside(root, abs),
    });
  }
  return candidates;
}

function validateCleanTarget(rawTarget: string): { ok: true; target: string } | { ok: false; reason: string } {
  const root = repoRoot();
  const target = normalizeFsPath(rawTarget);
  const name = path.basename(target);

  if (target === root) {
    return { ok: false, reason: "Bloqueado: alvo é a raiz do projeto." };
  }

  if (!isInside(root, target)) {
    return { ok: false, reason: "Bloqueado: alvo fora da raiz do projeto configurada no MCP." };
  }

  if (hasDeniedPath(target)) {
    return { ok: false, reason: "Bloqueado: caminho protegido por regra de segurança." };
  }

  if (!CLEANABLE_DIR_NAMES.
```