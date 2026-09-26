/**
 * RemoteBridge — WebSocket server bridging Overclock panes/PTY/missions to a
 * remote thin client (e.g. iPhone). Agents and CLIs stay on the Mac; the
 * remote side is display + input only.
 *
 * Protocol: JSON frames over WSS (self-signed cert). See PROTOCOL section below.
 *
 * PORT: process.env.OVERCLOCK_REMOTE_PORT ?? (dev sidecar instance ? 8790 : 8789)
 *       Dev and prod get DISTINCT default ports (F-018, same identity split as F-010's
 *       MCP port) so a prod instance holding 8789 no longer silently kills the dev
 *       remote-bridge on EADDRINUSE.
 * TLS:  Self-signed cert generated on first run, stored in
 *       <userData>/remote-bridge/tls.json  (PEM key + cert)
 * AUTH: 6-digit pairing code (rotates every 5 min) → opaque 32-byte hex token.
 *       Token hash (SHA-256) + issuedAt persisted in <userData>/remote-bridge/tokens.json.
 *       Tokens expire after 30 days.
 *
 * Ported from packages/shell/src/main/remote/RemoteBridge.ts (Electron-free).
 */
import { createServer as createHttpsServer } from 'node:https';
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { readFile, writeFile, mkdir, chmod } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { EventEmitter } from 'node:events';
import { WebSocketServer } from 'ws';
import selfsigned from 'selfsigned';
import { isDevSidecarInstance } from '@overclock-app/core';
async function loadOrCreateTls(dir) {
    const tlsPath = join(dir, 'tls.json');
    if (existsSync(tlsPath)) {
        try {
            const raw = await readFile(tlsPath, 'utf-8');
            const parsed = JSON.parse(raw);
            if (typeof parsed.key === 'string' && typeof parsed.cert === 'string')
                return parsed;
        }
        catch { /* regenerate */ }
    }
    const attrs = [{ name: 'commonName', value: 'overclock-remote-bridge' }];
    const tenYears = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000);
    const pems = await selfsigned.generate(attrs, {
        keySize: 2048,
        algorithm: 'sha256',
        notAfterDate: tenYears,
    });
    const store = { key: pems.private, cert: pems.cert };
    await mkdir(dir, { recursive: true });
    // Write with mode 0o600 so the private key is never world-readable.
    await writeFile(tlsPath, JSON.stringify(store, null, 2), { encoding: 'utf-8', mode: 0o600 });
    try {
        await chmod(tlsPath, 0o600);
    }
    catch { /* belt-and-suspenders */ }
    return store;
}
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
function sha256hex(input) {
    return createHash('sha256').update(input, 'utf-8').digest('hex');
}
async function loadTokenStore(dir) {
    try {
        const raw = await readFile(join(dir, 'tokens.json'), 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.tokens)) {
            return parsed.tokens.filter((t) => typeof t === 'object' && t !== null && typeof t.hash === 'string' && typeof t.issuedAt === 'number');
        }
        // Migrate legacy format: hashes without issuedAt → treat as issued now so they still work
        // for one TTL window but will expire naturally.
        if (Array.isArray(parsed.hashes)) {
            const now = Date.now();
            return parsed.hashes
                .filter((h) => typeof h === 'string')
                .map((hash) => ({ hash, issuedAt: now }));
        }
    }
    catch { /* empty or corrupt — start fresh */ }
    return [];
}
async function persistTokenStore(dir, store) {
    const file = { tokens: store };
    const path = join(dir, 'tokens.json');
    await writeFile(path, JSON.stringify(file, null, 2), { encoding: 'utf-8', mode: 0o600 });
    try {
        await chmod(path, 0o600);
    }
    catch { /* belt-and-suspenders */ }
}
// ─── Rate-limit constants ─────────────────────────────────────────────────────
const AUTH_RATE_LIMIT = 5; // per-connection: max failed attempts per window
const AUTH_RATE_WINDOW_MS = 60_000;
const IP_RATE_LIMIT = 20; // global: max failed attempts per IP per window
const IP_RATE_WINDOW_MS = 60_000;
const MAX_CONNECTIONS = 50;
const PAIR_CODE_EXPIRY_MS = 5 * 60_000;
const SCROLLBACK_MAX_BYTES = 128 * 1024;
const PANE_INPUT_MAX_BYTES = 8192;
const MAX_PAYLOAD_BYTES = 256 * 1024;
function isRateLimited(state) {
    const now = Date.now();
    if (now - state.attemptWindowStart > AUTH_RATE_WINDOW_MS) {
        state.failedAttempts = 0;
        state.attemptWindowStart = now;
    }
    return state.failedAttempts >= AUTH_RATE_LIMIT;
}
function recordFailedAttempt(state) {
    const now = Date.now();
    if (now - state.attemptWindowStart > AUTH_RATE_WINDOW_MS) {
        state.failedAttempts = 0;
        state.attemptWindowStart = now;
    }
    state.failedAttempts++;
}
// ─── Main class ───────────────────────────────────────────────────────────────
export class RemoteBridge extends EventEmitter {
    httpsServer = null;
    wss = null;
    clients = new Map();
    tokenStore = [];
    pairCode = null;
    pairCodeExpiresAt = 0;
    /** Global IP-level rate limit: Map<ip, {count, windowStart}>. Keyed by remoteAddress. */
    ipRateLimit = new Map();
    bridgeDir;
    port;
    deps;
    constructor(deps) {
        super();
        this.deps = deps;
        this.bridgeDir = join(deps.dataDir, 'remote-bridge');
        const defaultPort = isDevSidecarInstance() ? '8790' : '8789';
        this.port = deps.port ?? parseInt(process.env['OVERCLOCK_REMOTE_PORT'] ?? defaultPort, 10);
        this.rotatePairCode();
        setInterval(() => { this.rotatePairCode(); }, PAIR_CODE_EXPIRY_MS).unref?.();
    }
    // ─── IP rate limiter (global, across connections) ─────────────────────────
    isIpRateLimited(ip) {
        const now = Date.now();
        const entry = this.ipRateLimit.get(ip);
        if (!entry || now - entry.windowStart > IP_RATE_WINDOW_MS)
            return false;
        return entry.count >= IP_RATE_LIMIT;
    }
    recordIpFailure(ip) {
        const now = Date.now();
        const entry = this.ipRateLimit.get(ip);
        if (!entry || now - entry.windowStart > IP_RATE_WINDOW_MS) {
            this.ipRateLimit.set(ip, { count: 1, windowStart: now });
        }
        else {
            entry.count++;
        }
    }
    // ─── Pairing code ────────────────────────────────────────────────────────────
    rotatePairCode() {
        // 6 decimal digits, zero-padded
        const n = randomBytes(3).readUIntBE(0, 3) % 1_000_000;
        this.pairCode = String(n).padStart(6, '0');
        this.pairCodeExpiresAt = Date.now() + PAIR_CODE_EXPIRY_MS;
        // F-07: code surfaced ONLY via IPC (emit → renderer), never written to stdout.
        this.emit('pairCode', this.pairCode);
    }
    /** Returns the current valid pairing code and its expiry (epoch ms). */
    getPairCode() {
        return { code: this.pairCode ?? '------', expiresAt: this.pairCodeExpiresAt };
    }
    /** Revoke all issued tokens and persist the empty store. */
    revokeAllTokens() {
        this.tokenStore = [];
        void persistTokenStore(this.bridgeDir, this.tokenStore);
    }
    // ─── Startup ─────────────────────────────────────────────────────────────────
    async start() {
        await mkdir(this.bridgeDir, { recursive: true });
        this.tokenStore = await loadTokenStore(this.bridgeDir);
        const tls = await loadOrCreateTls(this.bridgeDir);
        const certPath = join(this.bridgeDir, 'tls.json');
        this.httpsServer = createHttpsServer({ key: tls.key, cert: tls.cert });
        // F-03: cap incoming message size to 256 KiB.
        this.wss = new WebSocketServer({ server: this.httpsServer, maxPayload: MAX_PAYLOAD_BYTES });
        this.wss.on('connection', (ws, req) => { this.handleConnection(ws, req); });
        // ROBUSTEZ: erro do wss/httpsServer (ex: EADDRINUSE) NÃO pode derrubar o sidecar —
        // remote control é feature secundária. Sem este handler o 'error' do wss é throw fatal.
        this.wss.on('error', (err) => {
            process.stderr.write(`[remote-bridge] wss error: ${err instanceof Error ? err.message : String(err)}\n`);
        });
        const bindAddr = process.env['OVERCLOCK_REMOTE_BIND'] ?? '0.0.0.0';
        const bound = await new Promise((resolve) => {
            const onErr = (err) => {
                process.stderr.write(`[remote-bridge] bind falhou (${err.code ?? err.message}) — remote control desabilitado nesta sessão\n`);
                resolve(false);
            };
            this.httpsServer.once('error', onErr);
            this.httpsServer.listen(this.port, bindAddr, () => {
                this.httpsServer.removeListener('error', onErr);
                // handler permanente p/ erros pós-bind (não-fatal)
                this.httpsServer.on('error', (e) => process.stderr.write(`[remote-bridge] server error: ${e instanceof Error ? e.message : String(e)}\n`));
                resolve(true);
            });
        });
        if (!bound) {
            try {
                this.httpsServer.close();
            }
            catch { /* ignore */ }
            this.httpsServer = null;
            this.wss = null;
            return null;
        }
        // F-10: warn when exposed on all interfaces so the user knows.
        if (bindAddr === '0.0.0.0') {
            process.stderr.write(`[remote-bridge] Warning: listening on all interfaces (0.0.0.0:${this.port}). Set OVERCLOCK_REMOTE_BIND to restrict.\n`);
        }
        process.stderr.write(`[remote-bridge] Listening on wss://${bindAddr}:${this.port} | cert: ${certPath}\n`);
        return { port: this.port, certPath };
    }
    async stop() {
        this.wss?.close();
        await new Promise((resolve) => {
            if (!this.httpsServer) {
                resolve();
                return;
            }
            this.httpsServer.close(() => resolve());
        });
    }
    // ─── Receive PTY data from the main process and fan out to subscribers ───────
    /**
     * Call this whenever a PTY data event fires. The bridge fans the chunk out
     * to all authenticated clients subscribed to this pane.
     */
    onPtyData(paneId, data) {
        if (!data)
            return;
        const frame = JSON.stringify({ type: 'pane.output', paneId, data });
        for (const [ws, state] of this.clients) {
            if (state.authed && state.subscriptions.has(paneId) && ws.readyState === ws.OPEN) {
                ws.send(frame);
            }
        }
    }
    /** Broadcast pane list update to all authed clients. */
    broadcastPanes() {
        const panes = this.serializePanes();
        const frame = JSON.stringify({ type: 'panes', panes });
        for (const [ws, state] of this.clients) {
            if (state.authed && ws.readyState === ws.OPEN)
                ws.send(frame);
        }
    }
    /** Broadcast mission list update to all authed clients. */
    async broadcastMissions() {
        const missions = await this.serializeMissions();
        const frame = JSON.stringify({ type: 'missions', missions });
        for (const [ws, state] of this.clients) {
            if (state.authed && ws.readyState === ws.OPEN)
                ws.send(frame);
        }
    }
    // ─── Connection handling ──────────────────────────────────────────────────────
    handleConnection(ws, req) {
        // F-02: connection cap — refuse when at limit.
        if (this.clients.size >= MAX_CONNECTIONS) {
            try {
                ws.close(1013, 'try again later');
            }
            catch { /* gone */ }
            return;
        }
        // F-01: global IP rate limit check on new connection.
        const ip = req.socket.remoteAddress ?? 'unknown';
        if (this.isIpRateLimited(ip)) {
            try {
                ws.close(1008, 'too many failed attempts');
            }
            catch { /* gone */ }
            return;
        }
        const state = {
            authed: false,
            failedAttempts: 0,
            attemptWindowStart: Date.now(),
            subscriptions: new Set(),
        };
        this.clients.set(ws, state);
        ws.on('message', (raw) => { this.handleMessage(ws, state, raw, ip); });
        ws.on('close', () => { this.clients.delete(ws); });
        ws.on('error', () => { this.clients.delete(ws); try {
            ws.terminate();
        }
        catch { /* gone */ } });
    }
    handleMessage(ws, state, raw, ip) {
        let frame;
        try {
            frame = JSON.parse(raw.toString('utf-8'));
        }
        catch {
            this.send(ws, { type: 'error', message: 'invalid JSON' });
            return;
        }
        // Always allow pair + auth frames so unauthenticated clients can authenticate.
        if (frame.type === 'ping') {
            this.send(ws, { type: 'pong' });
            return;
        }
        if (frame.type === 'pair') {
            this.handlePair(ws, state, frame.code, ip);
            return;
        }
        if (frame.type === 'auth') {
            this.handleAuth(ws, state, frame.token, ip);
            return;
        }
        // All other frames require auth.
        if (!state.authed) {
            this.send(ws, { type: 'auth_error', message: 'not authenticated' });
            return;
        }
        switch (frame.type) {
            case 'panes.list':
                this.handlePanesList(ws);
                break;
            case 'missions.list':
                this.handleMissionsList(ws);
                break;
            case 'pane.subscribe':
                this.handlePaneSubscribe(ws, state, frame.paneId);
                break;
            case 'pane.unsubscribe':
                state.subscriptions.delete(frame.paneId);
                break;
            case 'pane.input':
                this.handlePaneInput(ws, frame.paneId, frame.data);
                break;
            case 'pane.resize':
                this.handlePaneResize(ws, frame.paneId, frame.cols, frame.rows);
                break;
            case 'squad.status':
                this.handleSquadStatus(ws);
                break;
            default: this.send(ws, { type: 'error', message: 'unknown frame type' });
        }
    }
    // ─── Auth handlers ────────────────────────────────────────────────────────────
    handlePair(ws, state, code, ip) {
        // F-01: check global IP limit first, then per-connection limit.
        if (this.isIpRateLimited(ip) || isRateLimited(state)) {
            this.send(ws, { type: 'auth_error', message: 'too many attempts — try again later' });
            return;
        }
        const now = Date.now();
        const validCode = this.pairCode;
        const codeExpired = now > this.pairCodeExpiresAt;
        const codeBytes = Buffer.from(typeof code === 'string' ? code : '', 'utf-8');
        const expectedBytes = Buffer.from(typeof validCode === 'string' ? validCode : '\x00', 'utf-8');
        const same = codeBytes.length === expectedBytes.length && timingSafeEqual(codeBytes, expectedBytes);
        if (!same || codeExpired || typeof code !== 'string') {
            recordFailedAttempt(state);
            this.recordIpFailure(ip);
            this.send(ws, { type: 'auth_error', message: 'invalid or expired pairing code' });
            return;
        }
        const token = randomBytes(32).toString('hex');
        const hash = sha256hex(token);
        // F-04: store hash with issuedAt for TTL enforcement.
        this.tokenStore.push({ hash, issuedAt: now });
        void persistTokenStore(this.bridgeDir, this.tokenStore);
        state.authed = true;
        state.failedAttempts = 0;
        this.send(ws, { type: 'paired', token });
        this.rotatePairCode();
    }
    handleAuth(ws, state, token, ip) {
        // F-01: check global IP limit first, then per-connection limit.
        if (this.isIpRateLimited(ip) || isRateLimited(state)) {
            this.send(ws, { type: 'auth_error', message: 'too many attempts — try again later' });
            return;
        }
        if (typeof token !== 'string' || token.length !== 64) {
            recordFailedAttempt(state);
            this.recordIpFailure(ip);
            this.send(ws, { type: 'auth_error', message: 'invalid token format' });
            return;
        }
        const hash = sha256hex(token);
        const now = Date.now();
        let matched = false;
        for (const entry of this.tokenStore) {
            const storedBuf = Buffer.from(entry.hash, 'hex');
            const hashBuf = Buffer.from(hash, 'hex');
            if (storedBuf.length === hashBuf.length && timingSafeEqual(storedBuf, hashBuf)) {
                // F-04: reject tokens past TTL.
                if (now - entry.issuedAt > TOKEN_TTL_MS) {
                    break;
                }
                matched = true;
                break;
            }
        }
        if (!matched) {
            recordFailedAttempt(state);
            this.recordIpFailure(ip);
            this.send(ws, { type: 'auth_error', message: 'invalid token' });
            return;
        }
        state.authed = true;
        state.failedAttempts = 0;
        this.send(ws, { type: 'authed' });
    }
    // ─── Pane handlers ────────────────────────────────────────────────────────────
    handlePanesList(ws) {
        this.send(ws, { type: 'panes', panes: this.serializePanes() });
    }
    handlePaneSubscribe(ws, state, paneId) {
        if (typeof paneId !== 'string' || !paneId)
            return;
        state.subscriptions.add(paneId);
        // Send scrollback first so client gets context before live stream.
        if (this.deps.hasPane(paneId)) {
            try {
                const buf = this.deps.getPaneBuffer(paneId);
                let scrollback = buf.readRawText();
                if (scrollback.length > SCROLLBACK_MAX_BYTES) {
                    // Trim from the front to stay within budget.
                    scrollback = scrollback.slice(scrollback.length - SCROLLBACK_MAX_BYTES);
                }
                if (scrollback.length > 0) {
                    this.send(ws, { type: 'pane.output', paneId, data: scrollback });
                }
            }
            catch { /* pane may have died between hasPane check and read */ }
        }
    }
    handlePaneInput(ws, paneId, data) {
        if (typeof paneId !== 'string' || !paneId || typeof data !== 'string') {
            this.send(ws, { type: 'error', message: 'invalid pane.input frame' });
            return;
        }
        // F-03: cap pane input to prevent PTY buffer flooding.
        if (data.length > PANE_INPUT_MAX_BYTES) {
            this.send(ws, { type: 'error', message: 'pane.input data too large' });
            return;
        }
        // Security: validate pane exists in live registry before writing.
        if (!this.deps.hasPane(paneId)) {
            this.send(ws, { type: 'error', message: `pane not found: ${paneId}` });
            return;
        }
        try {
            this.deps.writePaneInput(paneId, data);
        }
        catch (err) {
            this.send(ws, { type: 'error', message: `write failed: ${err instanceof Error ? err.message : String(err)}` });
        }
    }
    handlePaneResize(ws, paneId, cols, rows) {
        if (typeof paneId !== 'string' || !paneId) {
            this.send(ws, { type: 'error', message: 'invalid pane.resize frame' });
            return;
        }
        // Reject non-finite / non-positive dimensions before they hit the PTY.
        if (!Number.isInteger(cols) || !Number.isInteger(rows) || cols <= 0 || rows <= 0 || cols > 1000 || rows > 1000) {
            this.send(ws, { type: 'error', message: 'invalid pane.resize dimensions' });
            return;
        }
        if (!this.deps.hasPane(paneId)) {
            this.send(ws, { type: 'error', message: `pane not found: ${paneId}` });
            return;
        }
        try {
            this.deps.resizePane(paneId, cols, rows);
        }
        catch (err) {
            this.send(ws, { type: 'error', message: `resize failed: ${err instanceof Error ? err.message : String(err)}` });
        }
    }
    // ─── Mission/squad handlers ───────────────────────────────────────────────────
    handleMissionsList(ws) {
        this.deps.readMissions()
            .then((missions) => {
            this.send(ws, { type: 'missions', missions: this.serializeMissionList(missions) });
        })
            .catch(() => {
            this.send(ws, { type: 'missions', missions: [] });
        });
    }
    handleSquadStatus(ws) {
        const panes = this.serializePanes();
        this.deps.readMissions()
            .then((missions) => {
            this.send(ws, { type: 'squad', panes, missions: this.serializeMissionList(missions) });
        })
            .catch(() => {
            this.send(ws, { type: 'squad', panes, missions: [] });
        });
    }
    // ─── Serialization ────────────────────────────────────────────────────────────
    serializePanes() {
        return this.deps.listPanes().map((p) => ({
            id: p.paneId,
            title: p.agent,
            status: p.status,
            cwd: p.cwd,
            agent: p.agent,
            model: p.model,
            missionId: p.missionId,
            attentionRequired: p.attentionRequired,
        }));
    }
    serializeMissionList(missions) {
        return missions.map((m) => ({
            id: m.id,
            title: m.title,
            status: m.status,
            workspaceId: m.workspaceId,
            objective: m.objective,
            branch: m.branch,
            createdAt: m.createdAt,
            updatedAt: m.updatedAt,
        }));
    }
    async serializeMissions() {
        const missions = await this.deps.readMissions().catch(() => []);
        return this.serializeMissionList(missions);
    }
    // ─── Helpers ─────────────────────────────────────────────────────────────────
    send(ws, payload) {
        try {
            if (ws.readyState === ws.OPEN)
                ws.send(JSON.stringify(payload));
        }
        catch { /* ignore closed socket */ }
    }
}
//# sourceMappingURL=remoteBridge.js.map