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
// Account grants use the existing persistent store, but never persist upstream
// credentials or MCP account tokens in cleartext. No second session store.
const secret = String(process.env.MCP_SESSION_SECRET || "").trim();
const accountStateKey = secret.length >= 32
    ? crypto.createHash("sha256").update("centraldark-mcp-account-state-v1\0").update(secret).digest()
    : null;
const accountAad = Buffer.from("centraldark-mcp-account-state-v1");
function sealAccountGrants() {
    if (!accountStateKey) return undefined;
    const now = Date.now();
    const valid = v => v.gh_scope === "centraldark-account" && v.expiresAt > now;
    const entries = { access: Array.from(accessTokens.values()).filter(valid),
        refresh: Array.from(refreshTokens.values()).filter(valid) };
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", accountStateKey, iv);
    cipher.setAAD(accountAad);
    const ciphertext = Buffer.concat([cipher.update(JSON.stringify(entries), "utf8"), cipher.final()]);
    return { version: 1, iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64"),
        ciphertext: ciphertext.toString("base64") };
}
function restoreAccountGrants(envelope) {
    if (!envelope || !accountStateKey) return;
    try {
        if (envelope.version !== 1) throw new Error("ACCOUNT_STATE_VERSION");
        const decipher = crypto.createDecipheriv("aes-256-gcm", accountStateKey, Buffer.from(envelope.iv,"base64"));
        decipher.setAAD(accountAad);
        decipher.setAuthTag(Buffer.from(envelope.tag,"base64"));
        const decoded = JSON.parse(Buffer.concat([decipher.update(Buffer.from(envelope.ciphertext,"base64")),decipher.final()]).toString("utf8"));
        const now = Date.now();
        for (const [items,store,prefix] of [[decoded.access,accessTokens,"at_"],[decoded.refresh,refreshTokens,"rt_"]]) {
            if (!Array.isArray(items)) throw new Error("ACCOUNT_STATE_FORMAT");
            for (const grant of items) {
                if (grant?.gh_scope === "centraldark-account" && typeof grant.token === "string" &&
                    grant.token.startsWith(prefix) && typeof grant.account_grant_id === "string" &&
                    Number.isFinite(grant.expiresAt) && grant.expiresAt > now) store.set(grant.token,grant);
            }
        }
    } catch {
        // Fail closed on a changed key, malformed or tampered state. Do not log it.
        for (const store of [accessTokens,refreshTokens])
            for (const [key,grant] of store) if (grant.gh_scope === "centraldark-account") store.delete(key);
        log.error("account_state_restore_failed");
    }
}
export function accountPersistenceReady() { return accountStateKey !== null; }
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
        authCodes: Array.from(authCodes.values()).filter(v => v.gh_scope !== "centraldark-account"),
        accessTokens: Array.from(accessTokens.values()).filter(v => v.gh_scope !== "centraldark-account"),
        refreshTokens: Array.from(refreshTokens.values()).filter(v => v.gh_scope !== "centraldark-account"),
        accountGrants: sealAccountGrants(),
        sessions: Array.from(sessions.values()),
        eventSubscriptions: Array.from(eventSubscriptions.values()),
        eventDeliveries: Array.from(eventDeliveries.values()),
    };
    const dir = path.dirname(STATE_FILE);
    fs.mkdirSync(dir, { recursive: true });
    const tmp = STATE_FILE + "." + crypto.randomBytes(8).toString("hex") + ".tmp";
    try {
        const fd = fs.openSync(tmp, "wx", 0o600);
        try {
            fs.writeFileSync(fd, JSON.stringify(payload));
            fs.fsyncSync(fd);
        } finally { fs.closeSync(fd); }
        fs.renameSync(tmp, STATE_FILE);
        if (process.platform !== "win32") {
            const directoryFd = fs.openSync(dir,"r");
            try { fs.fsyncSync(directoryFd); } finally { fs.closeSync(directoryFd); }
        }
    } finally {
        try { fs.unlinkSync(tmp); } catch (err) { if (err.code !== "ENOENT") throw err; }
    }
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
        (data.authCodes ?? []).filter(v => v.gh_scope !== "centraldark-account").forEach((c) => authCodes.set(c.code, c));
        (data.accessTokens ?? []).filter(v => v.gh_scope !== "centraldark-account").forEach((t) => accessTokens.set(t.token, t));
        (data.refreshTokens ?? []).filter(v => v.gh_scope !== "centraldark-account").forEach((t) => refreshTokens.set(t.token, t));
        restoreAccountGrants(data.accountGrants);
        (data.sessions ?? []).forEach((s) => sessions.set(s.id, s));
        (data.eventSubscriptions ?? []).forEach((s) => eventSubscriptions.set(s.id, s));
        (data.eventDeliveries ?? []).forEach((d) => eventDeliveries.set(d.event_id, d));
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
    const account = input.gh_scope === "centraldark-account";
    if (account) {
        input = { ...input, account_grant_id: input.account_grant_id || crypto.randomUUID() };
        if (input.account_authority === "session-v1" && !accountPersistenceReady())
            throw new Error("ACCOUNT_PERSISTENCE_NOT_CONFIGURED");
    }
    const limit = input.account_authority === "session-v1" ? input.account_grant_expires_at : input.account_expires_at;
    const access = {
        token: "at_" + crypto.randomBytes(32).toString("hex"),
        ...input,
        createdAt: now,
        expiresAt: input.gh_scope === "centraldark-account" ? Math.min(now + ACCESS_TOKEN_TTL_MS, limit) : now + ACCESS_TOKEN_TTL_MS,
    };
    const refresh = {
        token: "rt_" + crypto.randomBytes(32).toString("hex"),
        ...input,
        createdAt: now,
        expiresAt: input.gh_scope === "centraldark-account" ? Math.min(now + REFRESH_TOKEN_TTL_MS, limit) : now + REFRESH_TOKEN_TTL_MS,
    };
    accessTokens.set(access.token, access);
    refreshTokens.set(refresh.token, refresh);
    cleanup();
    if (account && accountStateKey) {
        // Persist before acknowledging tokens to the client.
        try { saveNow(); }
        catch (err) { accessTokens.delete(access.token); refreshTokens.delete(refresh.token); throw err; }
    } else scheduleSave();
    return { access, refresh };
}
// Receipt is only a short-lived observation of an existing account grant.
// Never use it as authentication, never expose the code or either token.
export function getAccountConsentStatus(receipt, account) {
    if (!/^[a-f0-9]{64}$/.test(receipt || "") || !account) return "unknown";
    const hash = crypto.createHash("sha256").update(receipt).digest("hex");
    const now = Date.now();
    const matches = grant => grant.gh_scope === "centraldark-account" &&
        grant.consent_receipt_hash === hash && grant.consent_receipt_expires_at > now &&
        grant.account_expires_at > now && grant.account_id === account.account_id &&
        grant.account_session_id === account.account_session_id && grant.account_role === account.account_role;
    for (const grant of accessTokens.values())
        if (grant.expiresAt > now && matches(grant)) return "authenticated";
    for (const grant of authCodes.values())
        if (now - grant.createdAt <= AUTH_CODE_TTL_MS && matches(grant)) return "pending";
    return "unknown";
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
export function peekRefreshToken(token, clientId) {
    const grant = refreshTokens.get(token);
    return grant?.gh_scope === "centraldark-account" && grant.client_id === clientId &&
        grant.expiresAt > Date.now() ? grant : undefined;
}
export function accountGrantIsActive(grant) {
    return !grant.token || (grant.expiresAt > Date.now() && (accessTokens.get(grant.token) === grant || refreshTokens.get(grant.token) === grant));
}
function removeAccountFamily(grant) {
    if (!grant?.account_grant_id) return false;
    let changed = false;
    for (const store of [accessTokens,refreshTokens])
        for (const [key,value] of store)
            if (value.gh_scope === "centraldark-account" && value.account_grant_id === grant.account_grant_id &&
                value.client_id === grant.client_id && value.account_id === grant.account_id &&
                value.account_session_id === grant.account_session_id) { store.delete(key); changed = true; }
    return changed;
}
export function revokeAccountFamily(grant) {
    if (!removeAccountFamily(grant)) return false;
    if (accountStateKey) saveNow(); else scheduleSave();
    return true;
}
export function revokeOAuthToken(token, clientId) {
    const grant = refreshTokens.get(token) || accessTokens.get(token);
    if (!grant || grant.client_id !== clientId) return false;
    if (grant.gh_scope === "centraldark-account") return revokeAccountFamily(grant);
    // Preserve legacy scope and revoke only the exact client-bound token.
    refreshTokens.delete(token); accessTokens.delete(token);
    saveNow();
    return true;
}
export function revokeOwnAccountSession(account) {
    let count = 0;
    const grants = [...refreshTokens.values(),...accessTokens.values()];
    for (const grant of grants) if (grant.gh_scope === "centraldark-account" &&
        grant.account_id === account.account_id && grant.account_session_id === account.account_session_id &&
        removeAccountFamily(grant)) count++;
    // Pending consent codes for this session are invalid too.
    for (const [key,grant] of authCodes) if (grant.gh_scope === "centraldark-account" &&
        grant.account_id === account.account_id && grant.account_session_id === account.account_session_id) authCodes.delete(key);
    if (accountStateKey) saveNow(); else scheduleSave();
    return count;
}
export function rotateAccountTokenPair(previous, input) {
    if (!accountGrantIsActive(previous) || refreshTokens.get(previous.token) !== previous ||
        previous.expiresAt <= Date.now()) return undefined;
    // The old refresh AND its access tokens are invalidated before issuance.
    // No await occurs between compare and mutation; a concurrent replay loses.
    removeAccountFamily(previous);
    try { return issueTokenPair(input); }
    catch (err) {
        // Do not restore consumed grants after an uncertain write. Flush denial
        // if possible, then return an error instead of acknowledging new tokens.
        if (accountStateKey) { try { saveNow(); } catch {} }
        throw err;
    }
}
export function consumeRefreshToken(token, clientId = "") {
    const t = refreshTokens.get(token);
    if (!t)
        return undefined;
    // A mismatch must never burn the owner's single-use refresh token.
    if (Date.now() > t.expiresAt) {
        refreshTokens.delete(token);
        scheduleSave();
        return undefined;
    }
    if ((t.gh_scope === "centraldark-account" || clientId) && t.client_id !== clientId)
        return undefined;
    refreshTokens.delete(token);
    scheduleSave();
    return t;
}
const sessions = new Map();
const eventSubscriptions = new Map();
const eventDeliveries = new Map();
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

// MCP Events reuse the same 0600 atomic state file as OAuth sessions. The
// subscription secret is necessarily persistent, while delivery IDs prevent
// duplicate side effects after process restart.
export const eventSubscriptionStore = Object.freeze({
    listSubscriptions: () => Array.from(eventSubscriptions.values()),
    getSubscription: (id) => eventSubscriptions.get(id),
    putSubscription: (subscription) => {
        eventSubscriptions.set(subscription.id, subscription);
        scheduleSave();
    },
    deleteSubscription: (id) => {
        const removed = eventSubscriptions.delete(id);
        if (removed) scheduleSave();
    },
    hasDelivery: (eventId) => eventDeliveries.has(eventId),
    putDelivery: (eventId, delivery) => {
        eventDeliveries.set(eventId, delivery);
        while (eventDeliveries.size > 10_000) eventDeliveries.delete(eventDeliveries.keys().next().value);
        scheduleSave();
    },
});
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