# MISSAO - sessions.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\src\sessions.ts
**SHA:** 355e9cd1d4c99975
**Timestamp:** 2026-08-26T19:32:45.240673
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- // (padrão: /root/CentralDark/secrets/mcp-state.json). Grava com permissão

### Ouro Bruto (primeiros 5000 chars)
```
// Stores do MCP CentralDark — agora com persistência em arquivo JSON.
//
// Sobrevive a restart do PM2. Caminho do arquivo vem de MCP_STATE_FILE
// (padrão: /root/CentralDark/secrets/mcp-state.json). Grava com permissão
// 0600 e debounce de 500ms pra não bater no disco a cada operação.
//
// Estruturas persistidas:
//  - clients   → Dynamic Client Registration do ChatGPT
//  - authCodes → códigos de autorização emitidos (curta duração)
//  - accessTokens / refreshTokens → tokens opacos emitidos
//  - sessions  → sessões legadas (header x-mcp-session)
//
// NÃO persistimos: authReqs (vivem só durante o redirect) e pendingStates.

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { log } from "./log.js";

// ─────────────────────────────── Persistência ────────────────────────────

const STATE_FILE =
  (process.env.MCP_STATE_FILE && process.env.MCP_STATE_FILE.trim()) ||
  "/root/CentralDark/secrets/mcp-state.json";

let saveTimer: NodeJS.Timeout | null = null;
let lastSaveAt = 0;

function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      saveNow();
    } catch (err) {
      log.error("state_save_failed", { error: String(err) });
    }
  }, 500);
}

function saveNow() {
  const payload = {
    version: 1,
    savedAt: Date.now(),
    clients: Array.from(clients.values()),
    authCodes: Array.from(authCodes.values()),
    accessTokens: Array.from(accessTokens.values()),
    refreshTokens: Array.from(refreshTokens.values()),
    sessions: Array.from(sessions.values()),
  };
  const dir = path.dirname(STATE_FILE);
  fs.mkdirSync(dir, { recursive: true });
  const tmp = STATE_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(payload), { mode: 0o600 });
  fs.renameSync(tmp, STATE_FILE);
  try {
    fs.chmodSync(STATE_FILE, 0o600);
  } catch {
    /* ignore */
  }
  lastSaveAt = Date.now();
}

function loadState() {
  try {
    if (!fs.existsSync(STATE_FILE)) {
      log.info("state_file_absent", { path: STATE_FILE });
      return;
    }
    const raw = fs.readFileSync(STATE_FILE, "utf-8");
    const data = JSON.parse(raw) as {
      clients?: RegisteredClient[];
      authCodes?: AuthCode[];
      accessTokens?: AccessToken[];
      refreshTokens?: RefreshToken[];
      sessions?: Session[];
    };
    (data.clients ?? []).forEach((c) => clients.set(c.client_id, c));
    (data.authCodes ?? []).forEach((c) => authCodes.set(c.code, c));
    (data.accessTokens ?? []).forEach((t) => accessTokens.set(t.token, t));
    (data.refreshTokens ?? []).forEach((t) => refreshTokens.set(t.token, t));
    (data.sessions ?? []).forEach((s) => sessions.set(s.id, s));
    log.info("state_loaded", {
      path: STATE_FILE,
      clients: clients.size,
      accessTokens: accessTokens.size,
      refreshTokens: refreshTokens.size,
      sessions: sessions.size,
    });
  } catch (err) {
    log.error("state_load_failed", { error: String(err), path: STATE_FILE });
  }
}

// ───────────────────────────── Clients (DCR) ─────────────────────────────

export interface RegisteredClient {
  client_id: string;
  client_name?: string;
  redirect_uris: string[];
  token_endpoint_auth_method: string;
  grant_types: string[];
  response_types: string[];
  createdAt: number;
}

const clients = new Map<string, RegisteredClient>();

export function registerClient(input: {
  client_name?: string;
  redirect_uris: string[];
  token_endpoint_auth_method?: string;
  grant_types?: string[];
  response_types?: string[];
}): RegisteredClient {
  const client_id = "mcp_" + crypto.randomBytes(16).toString("hex");
  const client: RegisteredClient = {
    client_id,
    client_name: input.client_name,
    redirect_uris: input.redirect_uris,
    token_endpoint_auth_method: input.token_endpoint_auth_method ?? "none",
    grant_types: input.grant_types ?? ["authorization_code", "refresh_token"],
    response_types: input.response_types ?? ["code"],
    createdAt: Date.now(),
  };
  clients.set(client_id, client);
  scheduleSave();
  return client;
}

export function getClient(client_id: string): RegisteredClient | undefined {
  return clients.get(client_id);
}

// ──────────────────────── Pedidos /authorize pendentes ───────────────────

export interface AuthRequest {
  state: string;
  client_id: string;
  redirect_uri: string;
  client_state?: string;
  code_challenge: string;
  code_challenge_method: string;
  scope?: string;
  createdAt: number;
}

const authReqs = new Map<string, AuthRequest>();
const AUTH_REQ_TTL_MS = 1000 * 60 * 10;

export function createAuthRequest(r: Omit<AuthRequest, "state" | "createdAt">): AuthRequest {
  const state = crypto.randomBytes(24).toString("hex");
  const req: AuthRequest = { ...r, state, createdAt: Date.now() };
  authReqs.set(state, req);
  cleanup();
  return req;
}

export function consumeAuthRequest(state: string): AuthRequest | undefined {
  const r = authReqs.get(state);
  if (!r) return undefined;
 
```

---

# MISSAO - sessions.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\dist\sessions.js
**SHA:** c0e5ac989dc896ee
**Timestamp:** 2026-08-28T02:54:45.459965
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- // (padrão: /root/CentralDark/secrets/mcp-state.json). Grava com permissão

### Ouro Bruto (primeiros 5000 chars)
```
// Stores do MCP CentralDark — agora com persistência em arquivo JSON.
//
// Sobrevive a restart do PM2. Caminho do arquivo vem de MCP_STATE_FILE
// (padrão: /root/CentralDark/secrets/mcp-state.json). Grava com permissão
// 0600 e debounce de 500ms pra não bater no disco a cada operação.
//
// Estruturas persistidas:
//  - clients   → Dynamic Client Registration do ChatGPT
//  - authCodes → códigos de autorização emitidos (curta duração)
//  - accessTokens / refreshTokens → tokens opacos emitidos
//  - sessions  → sessões legadas (header x-mcp-session)
//
// NÃO persistimos: authReqs (vivem só durante o redirect) e pendingStates.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { log } from "./log.js";
// ─────────────────────────────── Persistência ────────────────────────────
const STATE_FILE = (process.env.MCP_STATE_FILE && process.env.MCP_STATE_FILE.trim()) ||
    "/root/CentralDark/secrets/mcp-state.json";
let saveTimer = null;
let lastSaveAt = 0;
function scheduleSave() {
    if (saveTimer)
        return;
    saveTimer = setTimeout(() => {
        saveTimer = null;
        try {
            saveNow();
        }
        catch (err) {
            log.error("state_save_failed", { error: String(err) });
        }
    }, 500);
}
function saveNow() {
    const payload = {
        version: 1,
        savedAt: Date.now(),
        clients: Array.from(clients.values()),
        authCodes: Array.from(authCodes.values()),
        accessTokens: Array.from(accessTokens.values()),
        refreshTokens: Array.from(refreshTokens.values()),
        sessions: Array.from(sessions.values()),
    };
    const dir = path.dirname(STATE_FILE);
    fs.mkdirSync(dir, { recursive: true });
    const tmp = STATE_FILE + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(payload), { mode: 0o600 });
    fs.renameSync(tmp, STATE_FILE);
    try {
        fs.chmodSync(STATE_FILE, 0o600);
    }
    catch {
        /* ignore */
    }
    lastSaveAt = Date.now();
}
function loadState() {
    try {
        if (!fs.existsSync(STATE_FILE)) {
            log.info("state_file_absent", { path: STATE_FILE });
            return;
        }
        const raw = fs.readFileSync(STATE_FILE, "utf-8");
        const data = JSON.parse(raw);
        (data.clients ?? []).forEach((c) => clients.set(c.client_id, c));
        (data.authCodes ?? []).forEach((c) => authCodes.set(c.code, c));
        (data.accessTokens ?? []).forEach((t) => accessTokens.set(t.token, t));
        (data.refreshTokens ?? []).forEach((t) => refreshTokens.set(t.token, t));
        (data.sessions ?? []).forEach((s) => sessions.set(s.id, s));
        log.info("state_loaded", {
            path: STATE_FILE,
            clients: clients.size,
            accessTokens: accessTokens.size,
            refreshTokens: refreshTokens.size,
            sessions: sessions.size,
        });
    }
    catch (err) {
        log.error("state_load_failed", { error: String(err), path: STATE_FILE });
    }
}
const clients = new Map();
export function registerClient(input) {
    const client_id = "mcp_" + crypto.randomBytes(16).toString("hex");
    const client = {
        client_id,
        client_name: input.client_name,
        redirect_uris: input.redirect_uris,
        token_endpoint_auth_method: input.token_endpoint_auth_method ?? "none",
        grant_types: input.grant_types ?? ["authorization_code", "refresh_token"],
        response_types: input.response_types ?? ["code"],
        createdAt: Date.now(),
    };
    clients.set(client_id, client);
    scheduleSave();
    return client;
}
export function getClient(client_id) {
    return clients.get(client_id);
}
const authReqs = new Map();
const AUTH_REQ_TTL_MS = 1000 * 60 * 10;
export function createAuthRequest(r) {
    const state = crypto.randomBytes(24).toString("hex");
    const req = { ...r, state, createdAt: Date.now() };
    authReqs.set(state, req);
    cleanup();
    return req;
}
export function consumeAuthRequest(state) {
    const r = authReqs.get(state);
    if (!r)
        return undefined;
    authReqs.delete(state);
    if (Date.now() - r.createdAt > AUTH_REQ_TTL_MS)
        return undefined;
    return r;
}
const authCodes = new Map();
const AUTH_CODE_TTL_MS = 1000 * 60 * 5;
export function issueAuthCode(input) {
    const code = crypto.randomBytes(24).toString("hex");
    const ac = { ...input, code, createdAt: Date.now() };
    authCodes.set(code, ac);
    cleanup();
    scheduleSave();
    return ac;
}
export function consumeAuthCode(code) {
    const ac = authCodes.get(code);
    if (!ac)
        return undefined;
    authCodes.delete(code);
    scheduleSave();
    if (Date.now() - ac.createdAt > AUTH_CODE_TTL_MS)
        return undefined;
    return ac;
}
const accessTokens = new Map();
const refreshTokens = new Map();
const ACCESS_TOKEN_TTL_MS = 1000 * 60 * 60; // 1h
const REFRESH_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30d
export function issueTokenPair(input) {
    con
```

---

# MISSAO - sessions.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\mcp\src\sessions.js
**SHA:** 1ba0188fb5ebf4b4
**Timestamp:** 2026-08-28T02:56:34.037348
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- // (padrão: /root/CentralDark/secrets/mcp-state.json). Grava com permissão

### Ouro Bruto (primeiros 5000 chars)
```
// Stores do MCP CentralDark — agora com persistência em arquivo JSON.
//
// Sobrevive a restart do PM2. Caminho do arquivo vem de MCP_STATE_FILE
// (padrão: /root/CentralDark/secrets/mcp-state.json). Grava com permissão
// 0600 e debounce de 500ms pra não bater no disco a cada operação.
//
// Estruturas persistidas:
//  - clients   → Dynamic Client Registration do ChatGPT
//  - authCodes → códigos de autorização emitidos (curta duração)
//  - accessTokens / refreshTokens → tokens opacos emitidos
//  - sessions  → sessões legadas (header x-mcp-session)
//
// NÃO persistimos: authReqs (vivem só durante o redirect) e pendingStates.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { log } from "./log.js";
// ─────────────────────────────── Persistência ────────────────────────────
const STATE_FILE = (process.env.MCP_STATE_FILE && process.env.MCP_STATE_FILE.trim()) ||
    "/root/CentralDark/secrets/mcp-state.json";
let saveTimer = null;
let lastSaveAt = 0;
function scheduleSave() {
    if (saveTimer)
        return;
    saveTimer = setTimeout(() => {
        saveTimer = null;
        try {
            saveNow();
        }
        catch (err) {
            log.error("state_save_failed", { error: String(err) });
        }
    }, 500);
}
function saveNow() {
    const payload = {
        version: 1,
        savedAt: Date.now(),
        clients: Array.from(clients.values()),
        authCodes: Array.from(authCodes.values()),
        accessTokens: Array.from(accessTokens.values()),
        refreshTokens: Array.from(refreshTokens.values()),
        sessions: Array.from(sessions.values()),
    };
    const dir = path.dirname(STATE_FILE);
    fs.mkdirSync(dir, { recursive: true });
    const tmp = STATE_FILE + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(payload), { mode: 0o600 });
    fs.renameSync(tmp, STATE_FILE);
    try {
        fs.chmodSync(STATE_FILE, 0o600);
    }
    catch {
        /* ignore */
    }
    lastSaveAt = Date.now();
}
function loadState() {
    try {
        if (!fs.existsSync(STATE_FILE)) {
            log.info("state_file_absent", { path: STATE_FILE });
            return;
        }
        const raw = fs.readFileSync(STATE_FILE, "utf-8");
        const data = JSON.parse(raw);
        (data.clients ?? []).forEach((c) => clients.set(c.client_id, c));
        (data.authCodes ?? []).forEach((c) => authCodes.set(c.code, c));
        (data.accessTokens ?? []).forEach((t) => accessTokens.set(t.token, t));
        (data.refreshTokens ?? []).forEach((t) => refreshTokens.set(t.token, t));
        (data.sessions ?? []).forEach((s) => sessions.set(s.id, s));
        log.info("state_loaded", {
            path: STATE_FILE,
            clients: clients.size,
            accessTokens: accessTokens.size,
            refreshTokens: refreshTokens.size,
            sessions: sessions.size,
        });
    }
    catch (err) {
        log.error("state_load_failed", { error: String(err), path: STATE_FILE });
    }
}
const clients = new Map();
export function registerClient(input) {
    const client_id = "mcp_" + crypto.randomBytes(16).toString("hex");
    const client = {
        client_id,
        client_name: input.client_name,
        redirect_uris: input.redirect_uris,
        token_endpoint_auth_method: input.token_endpoint_auth_method ?? "none",
        grant_types: input.grant_types ?? ["authorization_code", "refresh_token"],
        response_types: input.response_types ?? ["code"],
        createdAt: Date.now(),
    };
    clients.set(client_id, client);
    scheduleSave();
    return client;
}
export function getClient(client_id) {
    return clients.get(client_id);
}
const authReqs = new Map();
const AUTH_REQ_TTL_MS = 1000 * 60 * 10;
export function createAuthRequest(r) {
    const state = crypto.randomBytes(24).toString("hex");
    const req = { ...r, state, createdAt: Date.now() };
    authReqs.set(state, req);
    cleanup();
    return req;
}
export function consumeAuthRequest(state) {
    const r = authReqs.get(state);
    if (!r)
        return undefined;
    authReqs.delete(state);
    if (Date.now() - r.createdAt > AUTH_REQ_TTL_MS)
        return undefined;
    return r;
}
const authCodes = new Map();
const AUTH_CODE_TTL_MS = 1000 * 60 * 5;
export function issueAuthCode(input) {
    const code = crypto.randomBytes(24).toString("hex");
    const ac = { ...input, code, createdAt: Date.now() };
    authCodes.set(code, ac);
    cleanup();
    scheduleSave();
    return ac;
}
export function consumeAuthCode(code) {
    const ac = authCodes.get(code);
    if (!ac)
        return undefined;
    authCodes.delete(code);
    scheduleSave();
    if (Date.now() - ac.createdAt > AUTH_CODE_TTL_MS)
        return undefined;
    return ac;
}
const accessTokens = new Map();
const refreshTokens = new Map();
const ACCESS_TOKEN_TTL_MS = 1000 * 60 * 60; // 1h
const REFRESH_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30d
export function issueTokenPair(input) {
    con
```