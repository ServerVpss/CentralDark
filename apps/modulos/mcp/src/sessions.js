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
    const now = Date.now();
    const access = {
        token: "at_" + crypto.randomBytes(32).toString("hex"),
        ...input,
        createdAt: now,
        expiresAt: now + ACCESS_TOKEN_TTL_MS,
    };
    const refresh = {
        token: "rt_" + crypto.randomBytes(32).toString("hex"),
        ...input,
        createdAt: now,
        expiresAt: now + REFRESH_TOKEN_TTL_MS,
    };
    accessTokens.set(access.token, access);
    refreshTokens.set(refresh.token, refresh);
    cleanup();
    scheduleSave();
    return { access, refresh };
}
export function getAccessToken(token) {
    const t = accessTokens.get(token);
    if (!t)
        return undefined;
    if (Date.now() > t.expiresAt) {
        accessTokens.delete(token);
        scheduleSave();
        return undefined;
    }
    return t;
}
export function consumeRefreshToken(token) {
    const t = refreshTokens.get(token);
    if (!t)
        return undefined;
    refreshTokens.delete(token);
    scheduleSave();
    if (Date.now() > t.expiresAt)
        return undefined;
    return t;
}
const sessions = new Map();
const pendingStates = new Map();
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;
const STATE_TTL_MS = 1000 * 60 * 10;
export function createPendingState() {
    const state = crypto.randomBytes(24).toString("hex");
    pendingStates.set(state, { state, createdAt: Date.now() });
    cleanup();
    return state;
}
export function consumePendingState(state) {
    const p = pendingStates.get(state);
    if (!p)
        return false;
    pendingStates.delete(state);
    if (Date.now() - p.createdAt > STATE_TTL_MS)
        return false;
    return true;
}
export function createSession(token, scope) {
    const id = crypto.randomBytes(32).toString("hex");
    const now = Date.now();
    const session = {
        id,
        githubAccessToken: token,
        githubScope: scope,
        createdAt: now,
        expiresAt: now + SESSION_TTL_MS,
    };
    sessions.set(id, session);
    cleanup();
    scheduleSave();
    return session;
}
export function getSession(id) {
    const s = sessions.get(id);
    if (!s)
        return undefined;
    if (Date.now() > s.expiresAt) {
        sessions.delete(id);
        scheduleSave();
        return undefined;
    }
    return s;
}
// ─────────────────────────────── Stats ───────────────────────────────────
export function getStateStats() {
    const now = Date.now();
    const activeAccess = Array.from(accessTokens.values()).filter((t) => t.expiresAt > now);
    const activeRefresh = Array.from(refreshTokens.values()).filter((t) => t.expiresAt > now);
    const activeSessions = Array.from(sessions.values()).filter((s) => s.expiresAt > now);
    const logins = new Set();
    activeAccess.forEach((t) => logins.add(t.gh_login));
    activeRefresh.forEach((t) => logins.add(t.gh_login));
    return {
        stateFile: STATE_FILE,
        lastSaveAt,
        clients: clients.size,
        authCodes: authCodes.size,
        accessTokens: activeAccess.length,
        refreshTokens: activeRefresh.length,
        sessions: activeSessions.length,
        authReqs: authReqs.size,
        uniqueGhLogins: Array.from(logins),
    };
}
// ─────────────────────────────── Limpeza ─────────────────────────────────
function cleanup() {
    const now = Date.now();
    let changed = false;
    for (const [k, v] of sessions)
        if (now > v.expiresAt) {
            sessions.delete(k);
            changed = true;
        }
    for (const [k, v] of pendingStates)
        if (now - v.createdAt > STATE_TTL_MS)
            pendingStates.delete(k);
    for (const [k, v] of authReqs)
        if (now - v.createdAt > AUTH_REQ_TTL_MS)
            authReqs.delete(k);
    for (const [k, v] of authCodes)
        if (now - v.createdAt > AUTH_CODE_TTL_MS) {
            authCodes.delete(k);
            changed = true;
        }
    for (const [k, v] of accessTokens)
        if (now > v.expiresAt) {
            accessTokens.delete(k);
            changed = true;
        }
    for (const [k, v] of refreshTokens)
        if (now > v.expiresAt) {
            refreshTokens.delete(k);
            changed = true;
        }
    if (changed)
        scheduleSave();
}
// Carrega estado na inicialização
loadState();
// Flush no shutdown
function flushOnExit() {
    try {
        if (saveTimer)
            clearTimeout(saveTimer);
        saveNow();
    }
    catch {
        /* ignore */
    }
}
process.on("SIGTERM", flushOnExit);
process.on("SIGINT", flushOnExit);
process.on("beforeExit", flushOnExit);
//# sourceMappingURL=sessions.js.map