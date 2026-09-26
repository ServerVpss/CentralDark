# COMANDO - vps-run-once.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\src\tools\vps-run-once.ts
**SHA:** 15894fdbf77fb3b6
**Timestamp:** 2026-08-26T19:32:45.483353
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const CONFIRM_SCRIPT_EXECUTE = "CONFIRMO EXECUTAR SCRIPT";
- dryRun: z.boolean().optional().describe("Padrão true"),
- const dryRun = input.dryRun ?? true;
- observacao: "Nada foi executado. Revise o script salvo e chame novamente com dryRun=false + confirmação literal.",
- dryRun: z.boolean().optional().describe("Padrao true"),
- const dryRun = input.dryRun ?? true;

### Ouro Bruto (primeiros 5000 chars)
```
import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { config } from "../config.js";
import { runShell, sanitize } from "../vps.js";

const CONFIRM_RUN_ONCE = "CONFIRMO RUN ONCE";
const CONFIRM_SCRIPT_EXECUTE = "CONFIRMO EXECUTAR SCRIPT";
const LOG_BASE = "/root/Multizap/revisoes";
const SCRIPT_ALLOWED_PREFIXES = ["scripts/allowed/", "CentralDark/scripts/allowed/"];
const SCRIPT_ALLOWED_EXTENSIONS = new Set([".sh", ".js", ".mjs", ".cjs"]);

const DENY_SCRIPT_PATTERNS: RegExp[] = [
  /\brm\s+-rf\s+\/(\s|$)/i,
  /\brm\s+-rf\s+\*/i,
  /\bmkfs\b/i,
  /\bdd\s+if=/i,
  /\bshutdown\b/i,
  /\breboot\b/i,
  /\bpoweroff\b/i,
  /\bdo-release-upgrade\b/i,
  /\bpasswd\b/i,
  /\buserdel\b/i,
  /\bchmod\s+-R\s+777\s+\//i,
  /\bchown\s+-R\s+[^ ]+\s+\//i,
  /\bdocker\s+(restart|rm|rmi|compose\s+down|stop|kill)\b/i,
  /\bcaddy\s+(reload|stop|start|restart|fmt|adapt)\b/i,
  /\bpm2\s+(delete|kill|flush|stop\s+all|restart\s+all)\b/i,
  /(^|\/)(\.env|secrets?|credenciais|tokens?|sessions?|sessao|sessão)(\/|$)/i,
];

function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function repoRoot() {
  return path.resolve(config.vps.repoPath);
}

type ScriptRoot = "project" | "mcpRepo" | "mcp";

function roots(): Record<ScriptRoot, string> {
  const mcp = path.resolve(process.cwd());
  return {
    project: repoRoot(),
    mcp,
    mcpRepo: path.resolve(mcp, "../../.."),
  };
}

function inside(parent: string, child: string) {
  const rel = path.relative(parent, child);
  return rel === "" || (!!rel && !rel.startsWith("..") && !path.isAbsolute(rel));
}

function safeName(name: string) {
  const clean = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  if (!clean) throw new Error("Nome inválido.");
  return clean;
}

function findBlocked(script: string) {
  return DENY_SCRIPT_PATTERNS
    .filter((pattern) => pattern.test(script))
    .map((pattern) => String(pattern));
}

function normalizeRelScript(script: string) {
  const rel = script.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!rel || rel.includes("..") || path.isAbsolute(rel)) throw new Error("Script invalido.");
  if (!SCRIPT_ALLOWED_PREFIXES.some((prefix) => rel.startsWith(prefix))) {
    throw new Error("Script fora das pastas permitidas: scripts/allowed/ ou CentralDark/scripts/allowed/.");
  }

  const ext = path.extname(rel).toLowerCase();
  if (!SCRIPT_ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error("Extensao de script nao permitida.");
  }
  return rel;
}

function resolveAllowedScript(rootKey: ScriptRoot | undefined, script: string) {
  const all = roots();
  const rootName = rootKey ?? "project";
  const root = all[rootName];
  if (!root) throw new Error("Root invalido.");

  const rel = normalizeRelScript(script);
  const abs = path.resolve(root, rel);
  if (!inside(root, abs)) throw new Error("Script fora da raiz permitida.");

  return { rootName, root, rel, abs, ext: path.extname(rel).toLowerCase() };
}

async function tailFile(file: string, max = 6000) {
  try {
    const text = await fs.readFile(file, "utf8");
    return sanitize(text.slice(-max));
  } catch {
    return "";
  }
}

export const vpsRunOnceTools = [
  {
    name: "vps_git_status",
    description: "Mostra git status curto, branch e último commit do repo da VPS. Apenas leitura.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Git status VPS" },
    inputSchema: z.object({}),
    handler: async () => {
      const res = await runShell("git status --short && echo '--- branch ---' && git branch --show-current && echo '--- last commit ---' && git log -1 --oneline", {
        cwd: repoRoot(),
        timeoutMs: 20_000,
      });

      return ok({
        cwd: repoRoot(),
        exitCode: res.exitCode,
        stdout: res.stdout,
        stderr: res.stderr,
      });
    },
  },
  {
    name: "vps_git_diff_safe",
    description: "Mostra git diff sanitizado de arquivos do repo. Apenas leitura. Limita tamanho da saída.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Git diff seguro" },
    inputSchema: z.object({
      path: z.string().optional().describe("Arquivo/pasta opcional dentro do repo"),
      staged: z.boolean().optional().describe("Se true, mostra diff staged"),
    }),
    handler: async (input: { path?: string; staged?: boolean }) => {
      const target = input.path ? input.path.replace(/\\/g, "/") : "";
      if (target.includes("..") || target.startsWith("/") || /(^|\/)(\.env|secrets?|tokens?|sessions?|credenciais)(\/|$)/i.test(target)) {
        return ok({ status: "BLOQUEADO", reason: "Path inseguro.", path: input.path });
      }

      const staged = input.staged ? "--cached " : "";
      const cmd = target
        ? `git diff ${staged}-- ${JSON.stringify(target)}
```

---

# COMANDO - vps-run-once.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\CentralDark\apps\mcp\src\tools\vps-run-once.ts
**SHA:** 32b469a4f6dfcc0d
**Timestamp:** 2026-08-26T19:34:24.527800
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dryRun: z.boolean().optional().describe("Padrão true"),
- const dryRun = input.dryRun ?? true;
- observacao: "Nada foi executado. Revise o script salvo e chame novamente com dryRun=false + confirmação literal.",

### Ouro Bruto (primeiros 5000 chars)
```
import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { config } from "../config.js";
import { runShell, sanitize } from "../vps.js";

const CONFIRM_RUN_ONCE = "CONFIRMO RUN ONCE";
const LOG_BASE = "/root/Multizap/revisoes";

const DENY_SCRIPT_PATTERNS: RegExp[] = [
  /\brm\s+-rf\s+\/(\s|$)/i,
  /\brm\s+-rf\s+\*/i,
  /\bmkfs\b/i,
  /\bdd\s+if=/i,
  /\bshutdown\b/i,
  /\breboot\b/i,
  /\bpoweroff\b/i,
  /\bdo-release-upgrade\b/i,
  /\bpasswd\b/i,
  /\buserdel\b/i,
  /\bchmod\s+-R\s+777\s+\//i,
  /\bchown\s+-R\s+[^ ]+\s+\//i,
  /\bdocker\s+(restart|rm|rmi|compose\s+down|stop|kill)\b/i,
  /\bcaddy\s+(reload|stop|start|restart|fmt|adapt)\b/i,
  /\bpm2\s+(delete|kill|flush|stop\s+all|restart\s+all)\b/i,
  /(^|\/)(\.env|secrets?|credenciais|tokens?|sessions?|sessao|sessão)(\/|$)/i,
];

function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function repoRoot() {
  return path.resolve(config.vps.repoPath);
}

function safeName(name: string) {
  const clean = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  if (!clean) throw new Error("Nome inválido.");
  return clean;
}

function findBlocked(script: string) {
  return DENY_SCRIPT_PATTERNS
    .filter((pattern) => pattern.test(script))
    .map((pattern) => String(pattern));
}

async function tailFile(file: string, max = 6000) {
  try {
    const text = await fs.readFile(file, "utf8");
    return sanitize(text.slice(-max));
  } catch {
    return "";
  }
}

export const vpsRunOnceTools = [
  {
    name: "vps_git_status",
    description: "Mostra git status curto, branch e último commit do repo da VPS. Apenas leitura.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Git status VPS" },
    inputSchema: z.object({}),
    handler: async () => {
      const res = await runShell("git status --short && echo '--- branch ---' && git branch --show-current && echo '--- last commit ---' && git log -1 --oneline", {
        cwd: repoRoot(),
        timeoutMs: 20_000,
      });

      return ok({
        cwd: repoRoot(),
        exitCode: res.exitCode,
        stdout: res.stdout,
        stderr: res.stderr,
      });
    },
  },
  {
    name: "vps_git_diff_safe",
    description: "Mostra git diff sanitizado de arquivos do repo. Apenas leitura. Limita tamanho da saída.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Git diff seguro" },
    inputSchema: z.object({
      path: z.string().optional().describe("Arquivo/pasta opcional dentro do repo"),
      staged: z.boolean().optional().describe("Se true, mostra diff staged"),
    }),
    handler: async (input: { path?: string; staged?: boolean }) => {
      const target = input.path ? input.path.replace(/\\/g, "/") : "";
      if (target.includes("..") || target.startsWith("/") || /(^|\/)(\.env|secrets?|tokens?|sessions?|credenciais)(\/|$)/i.test(target)) {
        return ok({ status: "BLOQUEADO", reason: "Path inseguro.", path: input.path });
      }

      const staged = input.staged ? "--cached " : "";
      const cmd = target
        ? `git diff ${staged}-- ${JSON.stringify(target)} | head -c 50000`
        : `git diff ${staged}| head -c 50000`;

      const res = await runShell(cmd, { cwd: repoRoot(), timeoutMs: 20_000 });
      return ok({ cwd: repoRoot(), exitCode: res.exitCode, diff: res.stdout, stderr: res.stderr });
    },
  },
  {
    name: "vps_run_once_script",
    description:
      "Cria e executa um script run-once controlado na VPS, com logs em /root/Multizap/revisoes. Por padrão é dry-run. Execução real exige CONFIRMO RUN ONCE. Bloqueia comandos e paths perigosos.",
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false, title: "Run-once seguro" },
    inputSchema: z.object({
      name: z.string().min(1).describe("Nome curto da tarefa"),
      script: z.string().min(1).max(20000).describe("Conteúdo bash do run-once"),
      dryRun: z.boolean().optional().describe("Padrão true"),
      confirm: z.string().optional().describe("Para executar: CONFIRMO RUN ONCE"),
      timeoutMs: z.number().int().min(1000).max(300000).optional(),
    }),
    handler: async (input: { name: string; script: string; dryRun?: boolean; confirm?: string; timeoutMs?: number }) => {
      const name = safeName(input.name);
      const blocked = findBlocked(input.script);
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      const dir = path.join(LOG_BASE, `${stamp}-${name}`);
      const scriptPath = path.join(dir, "run.sh");
      const stdoutPath = path.join(dir, "stdout.log");
      const stderrPath = path.join(dir, "stderr.log");

      await fs.mkdir(dir, { recursive: true });

      const scriptBody = `#!/usr/bin/env bash
set -euo pipefail

# Gerad
```

---

# COMANDO - vps-run-once.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\dist\tools\vps\vps-run-once.js
**SHA:** 20d33fd084e4b18e
**Timestamp:** 2026-08-28T02:54:42.326307
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dryRun: z.boolean().optional().describe("Padrão true"),
- const dryRun = input.dryRun ?? true;
- observacao: "Nada foi executado. Revise o script salvo e chame novamente com dryRun=false + confirmação literal.",

### Ouro Bruto (primeiros 5000 chars)
```
import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { config } from "../../config.js";
import { runShell, sanitize } from "./vps.js";
import { auditLog } from "../../lib/audit.js";
const CONFIRM_RUN_ONCE = "CONFIRMO RUN ONCE";
const LOG_BASE = "/root/CentralDark/revisoes";
const DENY_SCRIPT_PATTERNS = [
    /\brm\s+-rf\s+\/(\s|$)/i,
    /\brm\s+-rf\s+\*/i,
    /\bmkfs\b/i,
    /\bdd\s+if=/i,
    /\bshutdown\b/i,
    /\breboot\b/i,
    /\bpoweroff\b/i,
    /\bdo-release-upgrade\b/i,
    /\bpasswd\b/i,
    /\buserdel\b/i,
    /\bchmod\s+-R\s+777\s+\//i,
    /\bchown\s+-R\s+[^ ]+\s+\//i,
    // 🔓 Liberado 04/07/2026 (ordem do Pivete): docker/caddy/pm2 restart livres pra acelerar deploy.
    // Nenhum usuário externo no sistema — risco controlado.
    /(^|\/)(\.env|secrets?|credenciais|tokens?|sessions?|sessao|sessão)(\/|$)/i,
];
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function repoRoot() {
    return path.resolve(config.vps.repoPath);
}
function safeName(name) {
    const clean = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_.-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
    if (!clean)
        throw new Error("Nome inválido.");
    return clean;
}
function findBlocked(script) {
    return DENY_SCRIPT_PATTERNS
        .filter((pattern) => pattern.test(script))
        .map((pattern) => String(pattern));
}
async function tailFile(file, max = 6000) {
    try {
        const text = await fs.readFile(file, "utf8");
        return sanitize(text.slice(-max));
    }
    catch {
        return "";
    }
}
export const vpsRunOnceTools = [
    {
        name: "vps_git_status",
        description: "Mostra git status curto, branch e último commit do repo da VPS. Apenas leitura.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Git status VPS" },
        inputSchema: z.object({}),
        handler: async () => {
            const res = await runShell("git status --short && echo '--- branch ---' && git branch --show-current && echo '--- last commit ---' && git log -1 --oneline", {
                cwd: repoRoot(),
                timeoutMs: 20_000,
            });
            return ok({
                cwd: repoRoot(),
                exitCode: res.exitCode,
                stdout: res.stdout,
                stderr: res.stderr,
            });
        },
    },
    {
        name: "vps_git_diff_safe",
        description: "Mostra git diff sanitizado de arquivos do repo. Apenas leitura. Limita tamanho da saída.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Git diff seguro" },
        inputSchema: z.object({
            path: z.string().optional().describe("Arquivo/pasta opcional dentro do repo"),
            staged: z.boolean().optional().describe("Se true, mostra diff staged"),
        }),
        handler: async (input) => {
            const target = input.path ? input.path.replace(/\\/g, "/") : "";
            if (target.includes("..") || target.startsWith("/") || /(^|\/)(\.env|secrets?|tokens?|sessions?|credenciais)(\/|$)/i.test(target)) {
                return ok({ status: "BLOQUEADO", reason: "Path inseguro.", path: input.path });
            }
            const staged = input.staged ? "--cached " : "";
            const cmd = target
                ? `git diff ${staged}-- ${JSON.stringify(target)} | head -c 50000`
                : `git diff ${staged}| head -c 50000`;
            const res = await runShell(cmd, { cwd: repoRoot(), timeoutMs: 20_000 });
            return ok({ cwd: repoRoot(), exitCode: res.exitCode, diff: res.stdout, stderr: res.stderr });
        },
    },
    {
        name: "vps_run_once_script",
        description: "Cria e executa um script run-once controlado na VPS, com logs em /root/CentralDark/revisoes. Por padrão é dry-run. Execução real exige CONFIRMO RUN ONCE. Bloqueia comandos e paths perigosos.",
        annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false, title: "Run-once seguro" },
        inputSchema: z.object({
            name: z.string().min(1).describe("Nome curto da tarefa"),
            script: z.string().min(1).max(20000).describe("Conteúdo bash do run-once"),
            dryRun: z.boolean().optional().describe("Padrão true"),
            confirm: z.string().optional().describe("Para executar: CONFIRMO RUN ONCE"),
            timeoutMs: z.number().int().min(1000).max(300000).optional(),
        }),
        handler: async (input) => {
            const _t0 = Date.now();
            const _auditBase = { tool: "vps_run_once_script", command: `[run-once:${input.name}]`, root: "project", cwd: repoRoot() };
            const name = safeName(input.name);
            const blocked = findBlocked(input.script);
            const stamp
```

---

# COMANDO - vps-run-once.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\src\tools\vps\vps-run-once.js
**SHA:** a988d411b4c2934d
**Timestamp:** 2026-08-28T02:54:51.505351
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dryRun: z.boolean().optional().describe("Padrão true"),
- const dryRun = input.dryRun ?? true;
- observacao: "Nada foi executado. Revise o script salvo e chame novamente com dryRun=false + confirmação literal.",

### Ouro Bruto (primeiros 5000 chars)
```
import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { config } from "../../config.js";
import { runShell, sanitize } from "./vps.js";
import { auditLog } from "../../lib/audit.js";
const CONFIRM_RUN_ONCE = "CONFIRMO RUN ONCE";
const LOG_BASE = "/root/CentralDark/revisoes";
const DENY_SCRIPT_PATTERNS = [
    /\brm\s+-rf\s+\/(\s|$)/i,
    /\brm\s+-rf\s+\*/i,
    /\bmkfs\b/i,
    /\bdd\s+if=/i,
    /\bshutdown\b/i,
    /\breboot\b/i,
    /\bpoweroff\b/i,
    /\bdo-release-upgrade\b/i,
    /\bpasswd\b/i,
    /\buserdel\b/i,
    /\bchmod\s+-R\s+777\s+\//i,
    /\bchown\s+-R\s+[^ ]+\s+\//i,
    // 🔓 Liberado 04/07/2026 (ordem do Pivete): docker/caddy/pm2 restart livres pra acelerar deploy.
    // Nenhum usuário externo no sistema — risco controlado.
    /(^|\/)(\.env|secrets?|credenciais|tokens?|sessions?|sessao|sessão)(\/|$)/i,
];
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function repoRoot() {
    return path.resolve(config.vps.repoPath);
}
function safeName(name) {
    const clean = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_.-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
    if (!clean)
        throw new Error("Nome inválido.");
    return clean;
}
function findBlocked(script) {
    return DENY_SCRIPT_PATTERNS
        .filter((pattern) => pattern.test(script))
        .map((pattern) => String(pattern));
}
async function tailFile(file, max = 6000) {
    try {
        const text = await fs.readFile(file, "utf8");
        return sanitize(text.slice(-max));
    }
    catch {
        return "";
    }
}
export const vpsRunOnceTools = [
    {
        name: "vps_git_status",
        description: "Mostra git status curto, branch e último commit do repo da VPS. Apenas leitura.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Git status VPS" },
        inputSchema: z.object({}),
        handler: async () => {
            const res = await runShell("git status --short && echo '--- branch ---' && git branch --show-current && echo '--- last commit ---' && git log -1 --oneline", {
                cwd: repoRoot(),
                timeoutMs: 20_000,
            });
            return ok({
                cwd: repoRoot(),
                exitCode: res.exitCode,
                stdout: res.stdout,
                stderr: res.stderr,
            });
        },
    },
    {
        name: "vps_git_diff_safe",
        description: "Mostra git diff sanitizado de arquivos do repo. Apenas leitura. Limita tamanho da saída.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Git diff seguro" },
        inputSchema: z.object({
            path: z.string().optional().describe("Arquivo/pasta opcional dentro do repo"),
            staged: z.boolean().optional().describe("Se true, mostra diff staged"),
        }),
        handler: async (input) => {
            const target = input.path ? input.path.replace(/\\/g, "/") : "";
            if (target.includes("..") || target.startsWith("/") || /(^|\/)(\.env|secrets?|tokens?|sessions?|credenciais)(\/|$)/i.test(target)) {
                return ok({ status: "BLOQUEADO", reason: "Path inseguro.", path: input.path });
            }
            const staged = input.staged ? "--cached " : "";
            const cmd = target
                ? `git diff ${staged}-- ${JSON.stringify(target)} | head -c 50000`
                : `git diff ${staged}| head -c 50000`;
            const res = await runShell(cmd, { cwd: repoRoot(), timeoutMs: 20_000 });
            return ok({ cwd: repoRoot(), exitCode: res.exitCode, diff: res.stdout, stderr: res.stderr });
        },
    },
    {
        name: "vps_run_once_script",
        description: "Cria e executa um script run-once controlado na VPS, com logs em /root/CentralDark/revisoes. Por padrão é dry-run. Execução real exige CONFIRMO RUN ONCE. Bloqueia comandos e paths perigosos.",
        annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false, title: "Run-once seguro" },
        inputSchema: z.object({
            name: z.string().min(1).describe("Nome curto da tarefa"),
            script: z.string().min(1).max(20000).describe("Conteúdo bash do run-once"),
            dryRun: z.boolean().optional().describe("Padrão true"),
            confirm: z.string().optional().describe("Para executar: CONFIRMO RUN ONCE"),
            timeoutMs: z.number().int().min(1000).max(300000).optional(),
        }),
        handler: async (input) => {
            const _t0 = Date.now();
            const _auditBase = { tool: "vps_run_once_script", command: `[run-once:${input.name}]`, root: "project", cwd: repoRoot() };
            const name = safeName(input.name);
            const blocked = findBlocked(input.script);
            const stamp
```