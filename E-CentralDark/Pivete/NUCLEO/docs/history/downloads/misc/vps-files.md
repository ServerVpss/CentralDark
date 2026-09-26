# OUTRO - vps-files.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\src\tools\vps-files.ts
**SHA:** 5eaf33049618f7af
**Timestamp:** 2026-08-26T19:32:45.527772
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dryRun: z.boolean().optional(),
- const dryRun = input.dryRun ?? true;

### Ouro Bruto (primeiros 5000 chars)
```
import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { config } from "../config.js";
import { sanitize } from "../vps.js";

const CONFIRM_WRITE = "CONFIRMO ESCREVER";
const REPORT_BASE = "/root/Multizap/revisoes";

const DENY_PATH = /(^|\/)(\.env|secrets?|credenciais|tokens?|sessions?|sessao|sessão|\.ssh)(\/|$)|\.(pem|key|p12|pfx|sqlite|db)$/i;
const SKIP_DIRS = new Set([".git", "node_modules", ".next", "dist", "build"]);

type RootKey = "project" | "mcpRepo" | "mcp";

function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function roots(): Record<RootKey, string> {
  const mcp = path.resolve(process.cwd());
  return {
    project: path.resolve(config.vps.repoPath),
    mcp,
    mcpRepo: path.resolve(mcp, "../../.."),
  };
}

function inside(parent: string, child: string) {
  const rel = path.relative(parent, child);
  return rel === "" || (!!rel && !rel.startsWith("..") && !path.isAbsolute(rel));
}

function safeRel(p: string) {
  const clean = p.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!clean || clean.includes("..") || clean.startsWith("/")) throw new Error("Path inválido.");
  if (DENY_PATH.test(clean)) throw new Error("Path bloqueado por segurança.");
  return clean;
}

function resolveSafe(rootKey: RootKey | undefined, relPath: string) {
  const all = roots();
  const rootName = rootKey ?? "project";
  const root = all[rootName];
  if (!root) throw new Error("Root inválido.");

  const rel = safeRel(relPath);
  const abs = path.resolve(root, rel);

  if (!inside(root, abs)) throw new Error("Path fora da raiz permitida.");
  if (DENY_PATH.test(abs.replace(/\\/g, "/"))) throw new Error("Path bloqueado por segurança.");

  return { rootName, root, rel, abs };
}

async function statSafe(abs: string) {
  try {
    return await fs.stat(abs);
  } catch {
    return null;
  }
}

async function mkdirpForFile(abs: string) {
  await fs.mkdir(path.dirname(abs), { recursive: true });
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function safeBackupName(rel: string) {
  return rel.replace(/[^a-zA-Z0-9_.-]+/g, "__").slice(0, 160);
}

export const vpsFileTools = [
  {
    name: "vps_read_file_safe",
    description:
      "Lê arquivo de texto com limite de bytes e sanitização. Bloqueia .env, secrets, tokens, sessões, WhatsApp/WuzAPI, backups e bancos locais.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Ler arquivo seguro" },
    inputSchema: z.object({
      path: z.string().min(1),
      root: z.enum(["project", "mcpRepo", "mcp"]).optional(),
      maxBytes: z.number().int().min(1).max(100000).optional(),
    }),
    handler: async (input: { path: string; root?: RootKey; maxBytes?: number }) => {
      const target = resolveSafe(input.root, input.path);
      const st = await statSafe(target.abs);

      if (!st) return ok({ status: "NAO_ENCONTRADO", ...target });
      if (!st.isFile()) return ok({ status: "NAO_E_ARQUIVO", ...target, type: st.isDirectory() ? "dir" : "outro" });

      const max = input.maxBytes ?? 20000;
      const buf = await fs.readFile(target.abs);
      const truncated = buf.length > max;
      const text = buf.subarray(0, max).toString("utf8");

      return ok({
        status: "OK",
        root: target.rootName,
        path: target.rel,
        sizeBytes: st.size,
        truncated,
        maxBytes: max,
        content: sanitize(text),
      });
    },
  },
  {
    name: "vps_read_file",
    description:
      "Alias seguro de vps_read_file_safe. Le arquivo de texto com limite de bytes e sanitizacao; bloqueia .env, secrets, tokens, sessoes, WhatsApp/WuzAPI, backups e bancos locais.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Ler arquivo VPS" },
    inputSchema: z.object({
      path: z.string().min(1),
      root: z.enum(["project", "mcpRepo", "mcp"]).optional(),
      maxBytes: z.number().int().min(1).max(100000).optional(),
    }),
    handler: async (input: { path: string; root?: RootKey; maxBytes?: number }) => {
      const target = resolveSafe(input.root, input.path);
      const st = await statSafe(target.abs);

      if (!st) return ok({ status: "NAO_ENCONTRADO", ...target });
      if (!st.isFile()) return ok({ status: "NAO_E_ARQUIVO", ...target, type: st.isDirectory() ? "dir" : "outro" });

      const max = input.maxBytes ?? 20000;
      const buf = await fs.readFile(target.abs);
      const truncated = buf.length > max;
      const text = buf.subarray(0, max).toString("utf8");

      return ok({
        status: "OK",
        root: target.rootName,
        path: target.rel,
        sizeBytes: st.size,
        truncated,
        maxBytes: max,
        content: sanitize(text),
      });
    },
  },
  {
    name: "vps_write_file_safe",
    description:
      "Cria ou atualiza arquiv
```

---

# OUTRO - vps-files.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\CentralDark\apps\mcp\src\tools\vps-files.ts
**SHA:** d463eec90a10293c
**Timestamp:** 2026-08-26T19:34:24.987544
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dryRun: z.boolean().optional(),
- const dryRun = input.dryRun ?? true;

### Ouro Bruto (primeiros 5000 chars)
```
import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { config } from "../config.js";
import { sanitize } from "../vps.js";

const CONFIRM_WRITE = "CONFIRMO ESCREVER";
const REPORT_BASE = "/root/Multizap/revisoes";

const DENY_PATH = /(^|\/)(\.env|secrets?|credenciais|tokens?|sessions?|sessao|sessão|\.ssh)(\/|$)|\.(pem|key|p12|pfx|sqlite|db)$/i;
const SKIP_DIRS = new Set([".git", "node_modules", ".next", "dist", "build"]);

type RootKey = "project" | "mcpRepo" | "mcp";

function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function roots(): Record<RootKey, string> {
  const mcp = path.resolve(process.cwd());
  return {
    project: path.resolve(config.vps.repoPath),
    mcp,
    mcpRepo: path.resolve(mcp, "../../.."),
  };
}

function inside(parent: string, child: string) {
  const rel = path.relative(parent, child);
  return rel === "" || (!!rel && !rel.startsWith("..") && !path.isAbsolute(rel));
}

function safeRel(p: string) {
  const clean = p.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!clean || clean.includes("..") || clean.startsWith("/")) throw new Error("Path inválido.");
  if (DENY_PATH.test(clean)) throw new Error("Path bloqueado por segurança.");
  return clean;
}

function resolveSafe(rootKey: RootKey | undefined, relPath: string) {
  const all = roots();
  const rootName = rootKey ?? "project";
  const root = all[rootName];
  if (!root) throw new Error("Root inválido.");

  const rel = safeRel(relPath);
  const abs = path.resolve(root, rel);

  if (!inside(root, abs)) throw new Error("Path fora da raiz permitida.");
  if (DENY_PATH.test(abs.replace(/\\/g, "/"))) throw new Error("Path bloqueado por segurança.");

  return { rootName, root, rel, abs };
}

async function statSafe(abs: string) {
  try {
    return await fs.stat(abs);
  } catch {
    return null;
  }
}

async function mkdirpForFile(abs: string) {
  await fs.mkdir(path.dirname(abs), { recursive: true });
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function safeBackupName(rel: string) {
  return rel.replace(/[^a-zA-Z0-9_.-]+/g, "__").slice(0, 160);
}

export const vpsFileTools = [
  {
    name: "vps_read_file_safe",
    description:
      "Lê arquivo de texto com limite de bytes e sanitização. Bloqueia .env, secrets, tokens, sessões, WhatsApp/WuzAPI, backups e bancos locais.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Ler arquivo seguro" },
    inputSchema: z.object({
      path: z.string().min(1),
      root: z.enum(["project", "mcpRepo", "mcp"]).optional(),
      maxBytes: z.number().int().min(1).max(100000).optional(),
    }),
    handler: async (input: { path: string; root?: RootKey; maxBytes?: number }) => {
      const target = resolveSafe(input.root, input.path);
      const st = await statSafe(target.abs);

      if (!st) return ok({ status: "NAO_ENCONTRADO", ...target });
      if (!st.isFile()) return ok({ status: "NAO_E_ARQUIVO", ...target, type: st.isDirectory() ? "dir" : "outro" });

      const max = input.maxBytes ?? 20000;
      const buf = await fs.readFile(target.abs);
      const truncated = buf.length > max;
      const text = buf.subarray(0, max).toString("utf8");

      return ok({
        status: "OK",
        root: target.rootName,
        path: target.rel,
        sizeBytes: st.size,
        truncated,
        maxBytes: max,
        content: sanitize(text),
      });
    },
  },
  {
    name: "vps_write_file_safe",
    description:
      "Cria ou atualiza arquivo de texto com backup e dry-run por padrão. Escrita real exige CONFIRMO ESCREVER. Bloqueia paths sensíveis.",
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false, title: "Escrever arquivo seguro" },
    inputSchema: z.object({
      path: z.string().min(1),
      content: z.string().max(200000),
      root: z.enum(["project", "mcpRepo", "mcp"]).optional(),
      createDirs: z.boolean().optional(),
      dryRun: z.boolean().optional(),
      confirm: z.string().optional(),
    }),
    handler: async (input: { path: string; content: string; root?: RootKey; createDirs?: boolean; dryRun?: boolean; confirm?: string }) => {
      const target = resolveSafe(input.root, input.path);
      const dryRun = input.dryRun ?? true;
      const before = await statSafe(target.abs);

      if (before && !before.isFile()) return ok({ status: "BLOQUEADO", reason: "Destino existe e não é arquivo.", ...target });

      const wouldCreate = !before;
      const wouldUpdate = !!before;

      if (dryRun || input.confirm !== CONFIRM_WRITE) {
        return ok({
          status: "DRY_RUN",
          root: target.rootName,
          path: target.rel,
          exists: !!before,
          wouldCreate,
          wouldUpdate,
          bytes: Buffer.byteLength(input.content, "utf8"),
          require
```

---

# OUTRO - vps-files.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\dist\tools\vps\vps-files.js
**SHA:** 4a3ea840685c0e5f
**Timestamp:** 2026-08-28T02:54:57.006225
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dryRun: z.boolean().optional(),
- const dryRun = input.dryRun ?? true;

### Ouro Bruto (primeiros 5000 chars)
```
import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { config } from "../../config.js";
import { sanitize } from "./vps.js";
const CONFIRM_WRITE = "CONFIRMO ESCREVER";
const REPORT_BASE = path.join(config.vps.repoPath, "revisoes");
const DENY_PATH = /(^|\/)(\.env|secrets?|credenciais|tokens?|sessions?|sessao|sessão|\.ssh)(\/|$)|\.(pem|key|p12|pfx|sqlite|db)$/i;
const SKIP_DIRS = new Set([".git", "node_modules", ".next", "dist", "build"]);
const VAULT_ADMIN_HINT = "Path bloqueado por segurança no writer comum. Exceção admin liberada: para escrever em /root/CentralDark/secrets/, use mcp_admin_call com tool='admin_vault_write', confirmAdmin='CONFIRMO ADMIN' e input={ name:'arquivo.ext', content:'conteudo', overwrite:true }. Não use vps_write_file_safe para secrets.";
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function roots() {
    const mcp = path.resolve(process.cwd());
    return {
        project: path.resolve(config.vps.repoPath),
        mcp,
        mcpRepo: path.resolve(config.vps.repoPath),
    };
}
function inside(parent, child) {
    const rel = path.relative(parent, child);
    return rel === "" || (!!rel && !rel.startsWith("..") && !path.isAbsolute(rel));
}
function safeRel(p) {
    const clean = p.replace(/\\/g, "/").replace(/^\/+/, "");
    if (!clean || clean.includes("..") || clean.startsWith("/"))
        throw new Error("Path inválido.");
    if (DENY_PATH.test(clean))
        throw new Error(VAULT_ADMIN_HINT);
    return clean;
}
function resolveSafe(rootKey, relPath) {
    const all = roots();
    const rootName = rootKey ?? "project";
    const root = all[rootName];
    if (!root)
        throw new Error("Root inválido.");
    const rel = safeRel(relPath);
    const abs = path.resolve(root, rel);
    if (!inside(root, abs))
        throw new Error("Path fora da raiz permitida.");
    if (DENY_PATH.test(abs.replace(/\\/g, "/")))
        throw new Error(VAULT_ADMIN_HINT);
    return { rootName, root, rel, abs };
}
async function statSafe(abs) {
    try {
        return await fs.stat(abs);
    }
    catch {
        return null;
    }
}
async function mkdirpForFile(abs) {
    await fs.mkdir(path.dirname(abs), { recursive: true });
}
function stamp() {
    return new Date().toISOString().replace(/[:.]/g, "-");
}
function safeBackupName(rel) {
    return rel.replace(/[^a-zA-Z0-9_.-]+/g, "__").slice(0, 160);
}
export const vpsFileTools = [
    {
        name: "vps_read_file_safe",
        description: "Lê arquivo de texto com limite de bytes e sanitização. Bloqueia .env, secrets, tokens, sessões, WhatsApp/WuzAPI, backups e bancos locais.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Ler arquivo seguro" },
        inputSchema: z.object({
            path: z.string().min(1),
            root: z.enum(["project", "mcpRepo", "mcp"]).optional(),
            maxBytes: z.number().int().min(1).max(100000).optional(),
        }),
        handler: async (input) => {
            const target = resolveSafe(input.root, input.path);
            const st = await statSafe(target.abs);
            if (!st)
                return ok({ status: "NAO_ENCONTRADO", ...target });
            if (!st.isFile())
                return ok({ status: "NAO_E_ARQUIVO", ...target, type: st.isDirectory() ? "dir" : "outro" });
            const max = input.maxBytes ?? 20000;
            const buf = await fs.readFile(target.abs);
            const truncated = buf.length > max;
            const text = buf.subarray(0, max).toString("utf8");
            return ok({
                status: "OK",
                root: target.rootName,
                path: target.rel,
                sizeBytes: st.size,
                truncated,
                maxBytes: max,
                content: sanitize(text),
            });
        },
    },
    {
        name: "vps_write_file_safe",
        description: "Cria ou atualiza arquivo comum com backup e dry-run. NÃO use para /root/CentralDark/secrets/. Para secrets existe exceção admin explícita: chame mcp_admin_call com tool='admin_vault_write', confirmAdmin='CONFIRMO ADMIN' e input={name, content, overwrite:true}.",
        annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false, title: "Escrever arquivo seguro" },
        inputSchema: z.object({
            path: z.string().min(1),
            content: z.string().max(200000),
            root: z.enum(["project", "mcpRepo", "mcp"]).optional(),
            createDirs: z.boolean().optional(),
            dryRun: z.boolean().optional(),
            confirm: z.string().optional(),
        }),
        handler: async (input) => {
            const target = resolveSafe(input.root, input.path);
            const dryRun = input.dryRun ?? true;
            const before = await statSafe(target.abs);
            if (before && !be
```

---

# OUTRO - vps-files.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\src\tools\vps\vps-files.js
**SHA:** 87e1b60180cb8832
**Timestamp:** 2026-08-28T02:55:08.086647
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dryRun: z.boolean().optional(),
- const dryRun = input.dryRun ?? true;

### Ouro Bruto (primeiros 5000 chars)
```
import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { config } from "../../config.js";
import { sanitize } from "./vps.js";
const CONFIRM_WRITE = "CONFIRMO ESCREVER";
const REPORT_BASE = path.join(config.vps.repoPath, "revisoes");
const DENY_PATH = /(^|\/)(\.env|secrets?|credenciais|tokens?|sessions?|sessao|sessão|\.ssh)(\/|$)|\.(pem|key|p12|pfx|sqlite|db)$/i;
const SKIP_DIRS = new Set([".git", "node_modules", ".next", "dist", "build"]);
const VAULT_ADMIN_HINT = "Path bloqueado por segurança no writer comum. Exceção admin liberada: para escrever em /root/CentralDark/secrets/, use mcp_admin_call com tool='admin_vault_write', confirmAdmin='CONFIRMO ADMIN' e input={ name:'arquivo.ext', content:'conteudo', overwrite:true }. Não use vps_write_file_safe para secrets.";
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function roots() {
    const mcp = path.resolve(process.cwd());
    return {
        project: path.resolve(config.vps.repoPath),
        mcp,
        mcpRepo: path.resolve(config.vps.repoPath),
    };
}
function inside(parent, child) {
    const rel = path.relative(parent, child);
    return rel === "" || (!!rel && !rel.startsWith("..") && !path.isAbsolute(rel));
}
function safeRel(p) {
    const clean = p.replace(/\\/g, "/").replace(/^\/+/, "");
    if (!clean || clean.includes("..") || clean.startsWith("/"))
        throw new Error("Path inválido.");
    if (DENY_PATH.test(clean))
        throw new Error(VAULT_ADMIN_HINT);
    return clean;
}
function resolveSafe(rootKey, relPath) {
    const all = roots();
    const rootName = rootKey ?? "project";
    const root = all[rootName];
    if (!root)
        throw new Error("Root inválido.");
    const rel = safeRel(relPath);
    const abs = path.resolve(root, rel);
    if (!inside(root, abs))
        throw new Error("Path fora da raiz permitida.");
    if (DENY_PATH.test(abs.replace(/\\/g, "/")))
        throw new Error(VAULT_ADMIN_HINT);
    return { rootName, root, rel, abs };
}
async function statSafe(abs) {
    try {
        return await fs.stat(abs);
    }
    catch {
        return null;
    }
}
async function mkdirpForFile(abs) {
    await fs.mkdir(path.dirname(abs), { recursive: true });
}
function stamp() {
    return new Date().toISOString().replace(/[:.]/g, "-");
}
function safeBackupName(rel) {
    return rel.replace(/[^a-zA-Z0-9_.-]+/g, "__").slice(0, 160);
}
export const vpsFileTools = [
    {
        name: "vps_read_file_safe",
        description: "Lê arquivo de texto com limite de bytes e sanitização. Bloqueia .env, secrets, tokens, sessões, WhatsApp/WuzAPI, backups e bancos locais.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Ler arquivo seguro" },
        inputSchema: z.object({
            path: z.string().min(1),
            root: z.enum(["project", "mcpRepo", "mcp"]).optional(),
            maxBytes: z.number().int().min(1).max(100000).optional(),
        }),
        handler: async (input) => {
            const target = resolveSafe(input.root, input.path);
            const st = await statSafe(target.abs);
            if (!st)
                return ok({ status: "NAO_ENCONTRADO", ...target });
            if (!st.isFile())
                return ok({ status: "NAO_E_ARQUIVO", ...target, type: st.isDirectory() ? "dir" : "outro" });
            const max = input.maxBytes ?? 20000;
            const buf = await fs.readFile(target.abs);
            const truncated = buf.length > max;
            const text = buf.subarray(0, max).toString("utf8");
            return ok({
                status: "OK",
                root: target.rootName,
                path: target.rel,
                sizeBytes: st.size,
                truncated,
                maxBytes: max,
                content: sanitize(text),
            });
        },
    },
    {
        name: "vps_write_file_safe",
        description: "Cria ou atualiza arquivo comum com backup e dry-run. NÃO use para /root/CentralDark/secrets/. Para secrets existe exceção admin explícita: chame mcp_admin_call com tool='admin_vault_write', confirmAdmin='CONFIRMO ADMIN' e input={name, content, overwrite:true}.",
        annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false, title: "Escrever arquivo seguro" },
        inputSchema: z.object({
            path: z.string().min(1),
            content: z.string().max(200000),
            root: z.enum(["project", "mcpRepo", "mcp"]).optional(),
            createDirs: z.boolean().optional(),
            dryRun: z.boolean().optional(),
            confirm: z.string().optional(),
        }),
        handler: async (input) => {
            const target = resolveSafe(input.root, input.path);
            const dryRun = input.dryRun ?? true;
            const before = await statSafe(target.abs);
            if (before && !be
```