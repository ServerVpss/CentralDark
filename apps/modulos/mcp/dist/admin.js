// Painel /admin V2.1 — NOC do Dono + busca de logs + teste E2E OAuth.
// Novidades v2.1:
//   • /admin/api/logs            — busca/filtro por rota, cid, level + últimos N
//   • /admin/api/metricas        — contagem de erros nos últimos 5 min
//   • /admin/api/e2e             — teste end-to-end DCR → authorize → token → tools/list
//   • /admin/api/e2e/publico     — versão pública leve (só liveness, sem senha admin)
//   • activeSseSubscribers()     — exportado pro /health/deep contar conexões SSE
import crypto from "node:crypto";
import { execFile } from "node:child_process";
import { Socket } from "node:net";
import { performance } from "node:perf_hooks";
import { getCatalogSummary } from "./tools/core/tools-catalog.js";
import { log } from "./log.js";
import { withCid } from "./correlation.js";
import { config } from "./config.js";
import { getBuildkiteStatus } from "./buildkite-integration.js";
import { getGrokControlDashboard, setGrokControlSelection } from "./grok-control.js";
import { getOperationalSnapshot } from "./operational-telemetry.js";
import { getHarnessWeeklySummary, queryCentralLogs } from "./agent-observability.js";
import { runIntentCycle, readIntentState, publicIntentStatus } from "./intent-cycle-adapter.js";
import { getLinearAdminSnapshot } from "./tools/integrations.js";
import { subscribeAuditEvents } from "./audit-logger.js";
import { appendCentralEvent } from "./log-funnel.js";
const COOKIE = "cd_admin";
const TTL_MS = 2 * 60 * 60 * 1000;
function secret() {
    return process.env.MCP_ADMIN_COOKIE_SECRET
        || process.env.MCP_SESSION_SECRET
        || "cd-admin-fallback-troque-em-prod";
}
function sign(payload) {
    const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const sig = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
    return `${body}.${sig}`;
}
function verify(cookie) {
    if (!cookie || typeof cookie !== "string" || !cookie.includes("."))
        return null;
    const [body, sig] = cookie.split(".");
    const expected = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
    try {
        if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)))
            return null;
    }
    catch {
        return null;
    }
    try {
        const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
        if (payload.exp < Date.now())
            return null;
        return payload;
    }
    catch {
        return null;
    }
}
function parseCookies(header) {
    const out = {};
    if (!header)
        return out;
    for (const part of String(header).split(/;\s*/)) {
        const idx = part.indexOf("=");
        if (idx === -1)
            continue;
        out[part.slice(0, idx)] = decodeURIComponent(part.slice(idx + 1));
    }
    return out;
}
export function isAdmin(req) {
    const cookies = parseCookies(req.headers.cookie);
    const p = verify(cookies[COOKIE]);
    return Boolean(p && p.role === "admin");
}
// ─── Buffer circular de logs em memória ────────────────────────────────
const LOG_BUFFER = [];
const LOG_BUFFER_MAX = 2000;
const subscribers = new Set();
const sseStats = {
    totalConexoes: 0,
    totalEventos: 0,
    eventosRecentes: [],
    ultimasMensagens: [],
    ultimoEventoEm: null,
};
export function activeSseSubscribers() {
    return subscribers.size;
}
export function getSseDiagnostics() {
    const now = Date.now();
    const recentes = sseStats.eventosRecentes.filter((t) => now - t <= 60_000);
    sseStats.eventosRecentes = recentes;
    return {
        conexoesAtivas: subscribers.size,
        conexoesTotaisDesdeRestart: sseStats.totalConexoes,
        eventosTotaisDesdeRestart: sseStats.totalEventos,
        eventosPorMinuto: recentes.length,
        ultimoEventoEm: sseStats.ultimoEventoEm,
        ultimoEventoHaMs: sseStats.ultimoEventoEm ? now - new Date(sseStats.ultimoEventoEm).getTime() : null,
        ultimasMensagens: sseStats.ultimasMensagens.slice(-20),
    };
}
export function pushAdminLog(level, msg, meta) {
    const line = { t: new Date().toISOString(), level, msg, meta };
    LOG_BUFFER.push(line);
    if (LOG_BUFFER.length > LOG_BUFFER_MAX)
        LOG_BUFFER.shift();
    sseStats.totalEventos++;
    sseStats.ultimoEventoEm = line.t;
    sseStats.eventosRecentes.push(Date.now());
    if (sseStats.eventosRecentes.length > 2000)
        sseStats.eventosRecentes.splice(0, sseStats.eventosRecentes.length - 2000);
    sseStats.ultimasMensagens.push({ t: line.t, level, msg, cid: meta?.cid, rota: meta?.path });
    if (sseStats.ultimasMensagens.length > 50)
        sseStats.ultimasMensagens.shift();
    for (const send of subscribers) {
        try {
            send(line);
        }
        catch { /* silencioso */ }
    }
}
// Projecao somente dos metadados do proprio MCP CentralDark.
// Eventos do Desktop Commander remoto (fora deste MCP) nao surgem aqui
// automaticamente; precisam de adaptador do cliente/recibo com autorizacao.
subscribeAuditEvents((evento) => {
    if (evento?.schema !== "centraldark.mcp.tool-call.v1")
        return;
    const safe = (value, length = 120) => typeof value === "string" ? value.slice(0, length) : null;
    pushAdminLog(evento.ok === true ? "info" : "error", "mcp_tool_call", {
        source: "MCP_AUDIT",
        toolName: safe(evento.toolName),
        call_id: safe(evento.call_id),
        correlation_id: safe(evento.correlation_id),
        mission_id: safe(evento.mission_id),
        // PID do host MCP. PID do processo filho nao foi extraido nem presumido.
        mcp_host_pid: Number.isSafeInteger(evento.pid) ? evento.pid : null,
        exitCode: Number.isSafeInteger(evento.exitCode) ? evento.exitCode : null,
        durationMs: Number.isFinite(evento.durationMs) ? evento.durationMs : null,
        status: evento.ok === true ? "PASS" : "FAIL",
        ended_at: safe(evento.ended_at),
        // Nunca transportar args, stdout, stderr, paths ou credenciais ao painel.
    });
});
function extrairRota(linha) {
    const p = linha.meta?.path;
    if (typeof p === "string")
        return p;
    // fallback: procura /algo no msg
    const m = /\s(\/[a-zA-Z0-9/_\-.]+)/.exec(String(linha.msg || ""));
    return m ? m[1] : "-";
}
// ─── HTML NOC (tema Esmeralda) — v2.1 ──────────────────────────────────
export function adminIntentGet(req, res) {
    if (!isAdmin(req)) {
        res.status(401).json({ ok: false, error: 'AUTH_REQUIRED' });
        return;
    }
    res.setHeader('Cache-Control', 'no-store');
    res.json(readIntentState() || { schema: 'centraldark.intent.fixed-point.v1', state: 'UNKNOWN', fixedPoint: false, nextCursor: 'NO_RECEIPT', criteria: [] });
}
export function adminIntentRun(req, res) {
    if (!isAdmin(req)) {
        res.status(401).json({ ok: false, error: 'AUTH_REQUIRED' });
        return;
    }
    // Cookie admin nunca autoriza escrita cross-site.
    try {
        const origin = new URL(String(req.headers.origin || ''));
        const host = String(req.headers.host || '').toLowerCase();
        if (origin.protocol !== 'https:' || origin.host.toLowerCase() !== host) {
            res.status(403).json({ ok: false, error: 'SAME_ORIGIN_REQUIRED' });
            return;
        }
    }
    catch {
        res.status(403).json({ ok: false, error: 'ORIGIN_REQUIRED' });
        return;
    }
    try {
        const result = runIntentCycle(req.body, { dispatch: req.body?.dispatch === true });
        pushAdminLog('info', 'intent_cycle_receipt', { cid: req.cid, fingerprint: result.fingerprint, state: result.state, nextCursor: result.nextCursor, queued: result.queued === true });
        res.setHeader('Cache-Control', 'no-store');
        res.json(result);
    }
    catch (error) {
        const code = /^(INTENT_|MODE_|OWNER_|CRITERIA_|GOAL_|ITERATION_)/.test(String(error?.message)) ? 400 : 409;
        res.status(code).json({ ok: false, state: 'BLOCKED', error: String(error?.message || error).slice(0, 160) });
    }
}
export function intentPublicStatus(_req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.json(publicIntentStatus());
}
// ─── Rotas ────────────────────────────────────────────────────────────
export function adminGet(_req, res) {
    res.setHeader("Cache-Control", "no-store");
    res.redirect(302, "https://admin.centralldark.com/sala-controle");
}
export async function adminGraphProxy(req, res) {
    if (!isAdmin(req)) {
        res.status(401).type("text/plain").send("Admin auth required.");
        return;
    }
    if (req.method !== "GET" && req.method !== "HEAD") {
        res.setHeader("Allow", "GET, HEAD");
        res.status(405).type("text/plain").send("Somente leitura.");
        return;
    }
    try {
        const upstreamPath = req.url && req.url.startsWith("/") ? req.url : "/";
        const upstream = await fetch(`http://127.0.0.1:3030${upstreamPath}`, {
            method: req.method,
            headers: { accept: req.headers.accept || "*/*" },
        });
        res.status(upstream.status);
        for (const header of ["content-type", "cache-control", "etag", "last-modified", "location"]) {
            const value = upstream.headers.get(header);
            if (value)
                res.setHeader(header, value);
        }
        res.setHeader("X-Content-Type-Options", "nosniff");
        if (req.method === "HEAD") {
            res.end();
            return;
        }
        const body = Buffer.from(await upstream.arrayBuffer());
        res.end(body);
    }
    catch (error) {
        res.status(502).json({
            ok: false,
            error: "graph_panel_unavailable",
            message: "Grafo Celestial indisponível no runtime local.",
            detail: error?.message || String(error),
        });
    }
}
export function adminLogin(req, res) {
    const l = withCid(req.cid);
    const senha = String(req.body?.password || "");
    const esperada = process.env.MCP_ADMIN_PASSWORD || "";
    if (!esperada) {
        l.warn("admin_login_sem_senha_configurada", {});
        res.status(500).json({ ok: false, error: "MCP_ADMIN_PASSWORD_NOT_CONFIGURED" });
        return;
    }
    let ok = false;
    try {
        const a = Buffer.from(senha.padEnd(64, "\0").slice(0, 64));
        const b = Buffer.from(esperada.padEnd(64, "\0").slice(0, 64));
        ok = crypto.timingSafeEqual(a, b) && senha.length === esperada.length;
    }
    catch {
        ok = false;
    }
    if (!ok) {
        l.warn("admin_login_falha", { ip: req.ip });
        res.status(401).json({ ok: false, error: "MCP_ADMIN_PASSWORD_INVALID" });
        return;
    }
    const cookie = sign({ role: "admin", exp: Date.now() + TTL_MS });
    res.setHeader("Set-Cookie", `${COOKIE}=${encodeURIComponent(cookie)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${TTL_MS / 1000}`);
    l.info("admin_login_ok", { ip: req.ip });
    if (req.accepts("json"))
        res.json({ ok: true, authenticated: true });
    else
        res.redirect(302, "https://admin.centralldark.com/sala-controle");
}
export function adminLogout(_req, res) {
    res.setHeader("Set-Cookie", `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
    res.redirect(302, "https://admin.centralldark.com/sala-controle");
}
export function adminRotas(req, res) {
    if (!isAdmin(req)) {
        res.status(401).json({ ok: false });
        return;
    }
    res.json({
        rotas: [
            { metodo: "GET", path: "/health", protegido: false },
            { metodo: "GET", path: "/health/deep", protegido: false },
            { metodo: "GET", path: "/status.json", protegido: false },
            { metodo: "GET", path: "/tools.json", protegido: false },
            { metodo: "GET", path: "/openapi.json", protegido: false },
            { metodo: "GET", path: "/.well-known/oauth-authorization-server", protegido: false },
            { metodo: "GET", path: "/.well-known/oauth-protected-resource", protegido: false },
            { metodo: "POST", path: "/register", protegido: false },
            { metodo: "GET/POST", path: "/authorize", protegido: true },
            { metodo: "POST", path: "/token", protegido: true },
            { metodo: "POST", path: "/mcp", protegido: true },
            { metodo: "GET", path: "/admin", protegido: true },
            { metodo: "GET", path: "/admin/grafo/*", protegido: true },
            { metodo: "GET", path: "/admin/logs/stream", protegido: true },
            { metodo: "POST", path: "/admin/api/e2e", protegido: true },
            { metodo: "GET", path: "/admin/api/logs", protegido: true },
            { metodo: "POST", path: "/admin/api/sentinel/events", protegido: true },
            { metodo: "GET", path: "/admin/api/metricas", protegido: true },
            { metodo: "GET", path: "/admin/api/operational-snapshot", protegido: true },
            { metodo: "GET", path: "/admin/api/linear", protegido: true },
            { metodo: "GET", path: "/admin/api/tailscale", protegido: true },
            { metodo: "GET", path: "/linear/status", protegido: false },
        ],
    });
}
function sentinelSupabaseConfig() {
    const url = String(process.env.HUB_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/$/, "");
    const key = String(process.env.HUB_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "").trim();
    return { url, key };
}
function sentinelText(value, max = 500) {
    if (typeof value !== "string")
        return null;
    return value
        .replace(/Bearer\s+[^\s,;&]+/gi, "Bearer [REDACTED]")
        .replace(/((?:["']?(?:password|token|secret|api[_-]?key|authorization)["']?)\s*[:=]\s*["']?)[^\s,;&"'}]+/gi, "$1[REDACTED]")
        .replace(/https?:\/\/[^\s"'<>)]+/gi, (url) => url.split(/[?#]/, 1)[0])
        .slice(0, max);
}
function sentinelEvent(input = {}) {
    const metadata = input.metadata && typeof input.metadata === "object" && !Array.isArray(input.metadata) ? input.metadata : {};
    const kinds = ["code", "promise", "console", "resource", "network", "xhr", "manual"];
    const allowed = {
        schema: "centraldark.sentinel.event.v2",
        event_id: null,
        status: input.status === "UNKNOWN" ? "UNKNOWN" : "FAIL",
        correlation_id: sentinelText(input.correlation_id, 160),
        fingerprint: sentinelText(input.fingerprint, 80),
        severity: ["CRITICAL", "HIGH", "MEDIUM", "LOW"].includes(input.severity) ? input.severity : "UNKNOWN",
        kind: kinds.includes(input.kind) ? input.kind : null,
        page: sentinelText(input.page, 200),
        route: sentinelText(input.route, 200),
        control: sentinelText(input.control, 160),
        source: "cockpit-sentinel",
        message: sentinelText(input.message, 500),
        simplified_message: sentinelText(input.simplified_message, 300),
        http_status: Number.isInteger(input.http_status) ? input.http_status : null,
        method: sentinelText(input.method, 12),
        duration_ms: Number.isFinite(Number(input.duration_ms)) ? Math.max(0, Math.min(120000, Number(input.duration_ms))) : null,
        first_seen: sentinelText(input.first_seen, 40),
        last_seen: sentinelText(input.last_seen, 40),
        occurrences: Number.isInteger(input.occurrences) ? Math.max(1, Math.min(100000, input.occurrences)) : 1,
        sentinel_version: sentinelText(input.sentinel_version, 32),
    };
    const safeMetadata = Object.fromEntries(Object.entries(metadata).slice(0, 30).map(([key, value]) => [String(key).slice(0, 60), sentinelText(typeof value === "string" ? value : JSON.stringify(value), 500)]));
    return { ...allowed, metadata: safeMetadata };
}
function sameOriginSentinel(req) {
    try {
        const origin = new URL(String(req.headers.origin || ""));
        const host = String(req.headers.host || "").toLowerCase();
        if (origin.host.toLowerCase() !== host)
            return false;
        if (origin.protocol === "https:")
            return true;
        return origin.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
    }
    catch {
        return false;
    }
}
export async function adminSentinelEvent(req, res) {
    if (!isAdmin(req)) {
        res.status(401).json({ ok: false, error: "AUTH_REQUIRED" });
        return;
    }
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        res.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
        return;
    }
    if (!sameOriginSentinel(req)) {
        res.status(403).json({ ok: false, error: "SAME_ORIGIN_REQUIRED" });
        return;
    }
    if (Buffer.byteLength(JSON.stringify(req.body || {}), "utf8") > 32768) {
        res.status(413).json({ ok: false, error: "SENTINEL_EVENT_TOO_LARGE" });
        return;
    }
    const event = sentinelEvent(req.body || {});
    if (!event.correlation_id || !event.fingerprint || !event.kind || !event.page) {
        res.status(400).json({ ok: false, error: "SENTINEL_EVENT_REQUIRED_FIELDS" });
        return;
    }
    const eventId = crypto.randomUUID();
    event.event_id = eventId;
    const local = appendCentralEvent({
        event_id: eventId, sector: "control", service: "cockpit-sentinel", source: event.source,
        actor: "cockpit-sentinel", kind: "sentinel_error", level: event.severity === "CRITICAL" || event.severity === "HIGH" ? "error" : "warn",
        key: `sentinel:${event.fingerprint}`, tags: ["sentinel", event.kind, event.severity.toLowerCase()], correlation_id: event.correlation_id,
        message: event.simplified_message || event.message, data: event,
    });
    const { url, key } = sentinelSupabaseConfig();
    if (!url || !key) {
        res.status(503).json({ ok: false, error: "SUPABASE_SERVER_CREDENTIALS_MISSING", event_id: eventId, local });
        return;
    }
    const response = await fetch(`${url}/rest/v1/agent_events`, {
        method: "POST",
        headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ agent: "cockpit-sentinel", area: event.page, acao: event.kind, alvo: event.route || event.control || "cockpit", status: event.status, metadata: event }),
        signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
        pushAdminLog("error", "sentinel_supabase_ingest_fail", { cid: req.cid, status: response.status, correlation_id: event.correlation_id });
        res.status(502).json({ ok: false, error: "SUPABASE_INGEST_FAILED", event_id: eventId });
        return;
    }
    pushAdminLog("warn", "sentinel_event_ingested", { cid: req.cid, event_id: eventId, correlation_id: event.correlation_id, fingerprint: event.fingerprint, severity: event.severity });
    res.status(201).json({ ok: true, event_id: eventId, correlation_id: event.correlation_id, received_at: new Date().toISOString() });
}
function inferirCategoria(t) {
    const n = (t.name || "").toLowerCase();
    if (n.startsWith("tailscale_"))
        return "Tailscale";
    if (n.includes("github") || n.includes("repo") || n.includes("pr_"))
        return "GitHub";
    if (n.includes("telegram") || n.includes("bot_"))
        return "Telegram";
    if (n.includes("supabase") || n.includes("sql") || n.includes("db_"))
        return "Supabase";
    if (n.includes("pm2") || n.includes("vps_") || n.includes("deploy"))
        return "Deploy/VPS";
    if (n.includes("log") || n.includes("status") || n.includes("health") || n.includes("monitor"))
        return "Monitoramento";
    if (n.includes("ai_") || n.includes("llm") || n.includes("chat") || n.includes("gemini") || n.includes("openai"))
        return "IA";
    if (n.includes("admin") || n.includes("skill"))
        return "Admin";
    return "Utilidades";
}
export function adminTools(req, res) {
    if (!isAdmin(req)) {
        res.status(401).json({ ok: false });
        return;
    }
    const summary = getCatalogSummary();
    const categorias = {};
    for (const t of summary.tools || []) {
        const c = inferirCategoria(t);
        (categorias[c] ||= []).push({ name: t.name, description: t.description });
    }
    res.json({ total: summary.toolCount, categorias });
}
export function adminOperationalSnapshot(req, res) {
    if (!isAdmin(req)) {
        res.status(401).json({ ok: false });
        return;
    }
    res.setHeader("Cache-Control", "no-store");
    res.json(getOperationalSnapshot());
}
export async function adminLinear(req, res) {
    if (!isAdmin(req)) {
        res.status(401).json({ ok: false });
        return;
    }
    res.setHeader("Cache-Control", "no-store");
    const limit = Math.max(1, Math.min(Number(req.query.limit) || 25, 100));
    const snapshot = await getLinearAdminSnapshot(limit);
    res.status(snapshot.ok ? 200 : 503).json(snapshot);
}
// CentralDark Commander: reutiliza o owner administrativo e a tailnet privada.
// A sondagem NAO executa comando no Windows nem utiliza o relay pago externo.
function probeCommanderTcp(host, port) {
    return new Promise((resolve) => {
        const socket = new Socket();
        let done = false;
        const finish = (value) => {
            if (done)
                return;
            done = true;
            socket.destroy();
            resolve(value);
        };
        socket.setTimeout(1200);
        socket.once("connect", () => finish("OPEN"));
        socket.once("timeout", () => finish("TIMEOUT"));
        socket.once("error", () => finish("CLOSED"));
        socket.connect(port, host);
    });
}
const COMMANDER_HEALTH_PORT = 9101;
async function probeCommanderHttp(host) {
    try {
        const response = await fetch("http://" + host + ":" + COMMANDER_HEALTH_PORT + "/health", {
            cache: "no-store", redirect: "manual", signal: AbortSignal.timeout(2300),
        });
        return { httpStatus: response.status, state: response.ok ? "HTTP_REACHABLE" : "HTTP_NON_2XX", route: "9101/health" };
    }
    catch {
        return { httpStatus: null, state: "NOT_REACHABLE", route: "9101/health" };
    }
}
export async function measureNativeCommander() {
    let snapshot;
    try {
        const raw = await new Promise((resolve, reject) => {
            execFile("tailscale", ["status", "--json"], { timeout: 4000, maxBuffer: 1048576 }, (error, stdout) => error ? reject(error) : resolve(stdout));
        });
        snapshot = JSON.parse(raw);
    }
    catch {
        return { ok: false, backend_state: "UNKNOWN", route_base: "TAILSCALE_NATIVE",
            commander: { engine: "@wonderwhy-er/desktop-commander@0.2.48", license: "MIT",
                transport: "TAILSCALE_PRIVATE", commandExecution: "UNPROVEN" } };
    }
    const home = Object.values(snapshot.Peer || {}).find((peer) => ["SEGREDO", "WINDOWS-CASA"].includes(String(peer.HostName || "").trim().toUpperCase()));
    const ip = home?.TailscaleIPs?.[0] || null;
    const [ssh, winrm, screenpipe, rdp] = ip && home?.Online
        ? await Promise.all([22, 5985, 3030, 3389].map((port) => probeCommanderTcp(ip, port)))
        : ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"];
    const cockpit = ip && home?.Online ? await probeCommanderHttp(ip) : { httpStatus: null, state: "UNKNOWN" };
    return {
        ok: snapshot.BackendState === "Running", backend_state: snapshot.BackendState || "UNKNOWN",
        route_base: "TAILSCALE_NATIVE", source: "VPS_TAILSCALE_LOCAL",
        measured_at: new Date().toISOString(),
        self: { online: snapshot.BackendState === "Running", host: "VPS",
            ips: snapshot.Self?.TailscaleIPs || [] },
        home: { host: home?.HostName || "SEGREDO", ip, online: home?.Online === true,
            ssh_22: ssh, winrm_5985: winrm, screenpipe_3030: screenpipe,
            commander_9101: cockpit, rdp_3389: rdp },
        commander: { engine: "@wonderwhy-er/desktop-commander@0.2.48", license: "MIT",
            controlPlane: "MCP_CENTRALDARK", transport: "TAILSCALE_PRIVATE",
            commandExecution: "UNPROVEN", authenticatedWindowsSession: false,
            externalRelayRequiredForStatus: false }
    };
}
export async function adminTailscale(req, res) {
    if (!isAdmin(req)) {
        res.status(401).json({ ok: false });
        return;
    }
    res.setHeader("Cache-Control", "no-store");
    const native = await measureNativeCommander();
    if (native.ok) {
        res.json(native);
        return;
    }
    try {
        const upstream = await fetch("http://127.0.0.1:8098/api/tailscale/status", {
            headers: { accept: "application/json" }, signal: AbortSignal.timeout(2500),
        });
        if (!upstream.ok)
            throw new Error("broker_unavailable");
        res.status(upstream.status).type("application/json").send(await upstream.text());
    }
    catch {
        res.status(503).json(native);
    }
}
// ─── Busca de logs (filtro por rota / cid / level / texto) ────────────
export function adminBuscarLogs(req, res) {
    if (!isAdmin(req)) {
        res.status(401).json({ ok: false });
        return;
    }
    // Consulta do funil setorizado dentro da mesma API Admin. O modo sem setor fica intacto.
    if (req.query?.sector != null) {
        const sector = String(req.query.sector || "").trim().toLowerCase();
        const allowed = new Set(["all", "mcp", "agents", "hermes", "vscode", "system", "control", "consciencia"]);
        if (!allowed.has(sector)) {
            res.status(400).json({ error: "sector_not_allowed" });
            return;
        }
        const since = Math.max(1, Math.min(10080, Number(req.query.since_minutes) || 60));
        const limit = Math.max(1, Math.min(200, Number(req.query.limit) || 100));
        const rows = queryCentralLogs({ sector: sector === "all" ? undefined : sector, since_minutes: since, limit });
        const q = String(req.query.q || "").toLowerCase().slice(0, 80);
        const logs = rows.filter(row => !q ||
            [row.kind, row.source, row.actor, row.key].some(v => String(v || "").toLowerCase().includes(q)))
            .map(row => ({
            event_id: String(row.event_id || "").slice(0, 120),
            timestamp: String(row.timestamp || "").slice(0, 64),
            sector: String(row.sector || "").slice(0, 80),
            source: String(row.source || "").slice(0, 160),
            actor: String(row.actor || "").slice(0, 160),
            kind: String(row.kind || "").slice(0, 120),
            level: String(row.level || "").slice(0, 32),
            badge: String(row.badge || "").slice(0, 8),
            key: String(row.key || "").slice(0, 160),
            // Sem args, dados brutos, stdout, paths, cookies ou tokens.
        }));
        res.setHeader("Cache-Control", "no-store");
        res.json({ schema: "centraldark.central-logs.sanitized.v1", sector, count: logs.length, logs });
        return;
    }
    const rota = String(req.query.rota || "").toLowerCase();
    const cid = String(req.query.cid || "").toLowerCase();
    const level = String(req.query.level || "").toLowerCase();
    const q = String(req.query.q || "").toLowerCase();
    const limit = Math.min(Number(req.query.limit) || 200, 1000);
    const out = [];
    // percorre do mais recente pro mais antigo pra pegar os últimos N
    for (let i = LOG_BUFFER.length - 1; i >= 0 && out.length < limit; i--) {
        const linha = LOG_BUFFER[i];
        const r = extrairRota(linha).toLowerCase();
        const c = String(linha.meta?.cid || "").toLowerCase();
        if (rota && !r.includes(rota))
            continue;
        if (cid && !c.includes(cid))
            continue;
        if (level && linha.level !== level)
            continue;
        if (q && !JSON.stringify(linha).toLowerCase().includes(q))
            continue;
        out.push({ ...linha, rota: r, cid: c || undefined });
    }
    res.json({ total: out.length, logs: out });
}
// ─── Métricas: contagem de erros/warns/requests em 5 min ──────────────
export function adminMetricas(req, res) {
    if (!isAdmin(req)) {
        res.status(401).json({ ok: false });
        return;
    }
    const corte = Date.now() - 5 * 60 * 1000;
    let erros = 0, warns = 0, requests = 0;
    for (let i = LOG_BUFFER.length - 1; i >= 0; i--) {
        const l = LOG_BUFFER[i];
        if (new Date(l.t).getTime() < corte)
            break;
        if (l.level === "error")
            erros++;
        else if (l.level === "warn")
            warns++;
        if (l.msg === "http_request_start")
            requests++;
    }
    res.setHeader("Cache-Control", "no-store");
    res.json({ janelaMin: 5, erros, warns, requests, sseAtivas: subscribers.size, harnessWeek: getHarnessWeeklySummary() });
}
export function adminGrokControlGet(req, res) {
    if (!isAdmin(req)) {
        res.status(401).json({ ok: false });
        return;
    }
    res.setHeader("Cache-Control", "no-store");
    res.json(getGrokControlDashboard());
}
export function adminGrokControlPost(req, res) {
    if (!isAdmin(req)) {
        res.status(401).json({ ok: false });
        return;
    }
    const l = withCid(req.cid);
    try {
        const result = setGrokControlSelection(req.body || {}, "admin");
        l.info("admin_grok_mode_selected", {
            mode: result.state?.invocation_mode,
            agent: result.state?.agent_profile,
            model: result.state?.model,
            selected_is_runtime_proof: false,
        });
        res.setHeader("Cache-Control", "no-store");
        res.json(result);
    }
    catch (error) {
        l.warn("admin_grok_mode_rejected", { error: String(error?.message || error).slice(0, 180) });
        res.status(400).json({ ok: false, error: String(error?.message || error) });
    }
}
export function adminBuildkiteStatus(req, res) {
    if (!isAdmin(req)) {
        res.status(401).json({ ok: false });
        return;
    }
    const since = Math.min(Math.max(Number(req.query.since_minutes) || 1440, 1), 10080);
    res.json(getBuildkiteStatus({ since_minutes: since, limit: 1200 }));
}
// ─── Teste E2E: DCR → authorize → token → tools/list ──────────────────
async function fazerRequest(url, opts = {}) {
    const t0 = performance.now();
    try {
        const r = await fetch(url, { redirect: "manual", ...opts, signal: AbortSignal.timeout(10000) });
        const location = r.headers.get("location");
        const texto = await r.text();
        const json = parseMcpJson(texto);
        return { ok: r.ok, status: r.status, ms: Math.round(performance.now() - t0), json, texto: texto.slice(0, 400), location, contentType: r.headers.get("content-type") || "" };
    }
    catch (err) {
        return { ok: false, status: 0, ms: Math.round(performance.now() - t0), erro: String(err?.message || err) };
    }
}
function parseMcpJson(texto) {
    const trimmed = String(texto || "").trim();
    if (!trimmed)
        return null;
    try {
        return JSON.parse(trimmed);
    }
    catch { /* tenta SSE */ }
    const dataLine = trimmed.split(/\r?\n/).find((line) => line.startsWith("data:"));
    if (!dataLine)
        return null;
    try {
        return JSON.parse(dataLine.slice(5).trim());
    }
    catch {
        return null;
    }
}
function extrairToolsCount(payload) {
    if (Array.isArray(payload)) {
        const item = payload.find((p) => p?.result?.tools || p?.error);
        return { toolCount: item?.result?.tools?.length, error: item?.error?.message };
    }
    return { toolCount: payload?.result?.tools?.length, error: payload?.error?.message };
}
async function rodarE2EInterno({ comAdmin, cid }) {
    const base = `http://127.0.0.1:${config.port}`;
    const etapas = [];
    let falhouEm = null;
    const baseHeaders = { "X-Correlation-Id": cid || crypto.randomUUID() };
    // 1) DCR
    const dcr = await fazerRequest(`${base}/register`, {
        method: "POST",
        headers: { ...baseHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
            client_name: "MCP-Admin-E2E",
            redirect_uris: ["http://127.0.0.1/callback"],
            grant_types: ["authorization_code"],
            response_types: ["code"],
            token_endpoint_auth_method: "none",
        }),
    });
    const clientId = dcr.json?.client_id;
    etapas.push({ nome: "DCR /register", ok: dcr.ok && !!clientId, status: dcr.status, ms: dcr.ms, detalhe: clientId ? "client_id emitido" : (dcr.erro || dcr.texto) });
    if (!clientId) {
        falhouEm = "DCR /register";
        return { ok: false, falhouEm, etapas };
    }
    // 2) Discovery
    const disc = await fazerRequest(`${base}/.well-known/oauth-authorization-server`, { headers: baseHeaders });
    etapas.push({ nome: "Discovery /.well-known", ok: disc.ok, status: disc.status, ms: disc.ms, detalhe: disc.json?.issuer || disc.erro });
    if (!disc.ok) {
        falhouEm = "Discovery";
        return { ok: false, falhouEm, etapas };
    }
    if (!comAdmin)
        return { ok: true, publico: true, etapas };
    // 3) /authorize (PKCE+senha admin)
    const codeVerifier = crypto.randomBytes(32).toString("base64url");
    const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");
    const state = crypto.randomBytes(16).toString("base64url");
    const senha = process.env.MCP_ADMIN_PASSWORD || "";
    if (!senha) {
        etapas.push({ nome: "/authorize (PKCE+senha admin)", ok: false, status: "config", ms: 0, detalhe: "MCP_ADMIN_PASSWORD ausente" });
        falhouEm = "authorize";
        return { ok: false, falhouEm, etapas };
    }
    const authParams = new URLSearchParams({
        response_type: "code", client_id: clientId, redirect_uri: "http://127.0.0.1/callback",
        code_challenge: codeChallenge, code_challenge_method: "S256", state, scope: "mcp admin",
    });
    const authz = await fazerRequest(`${base}/authorize`, {
        method: "POST", headers: { ...baseHeaders, "Content-Type": "application/x-www-form-urlencoded" },
        body: authParams.toString() + `&password=${encodeURIComponent(senha)}`,
        redirect: "manual",
    });
    let code = null;
    if (authz.status === 302 && authz.location) {
        try {
            code = new URL(authz.location, "http://127.0.0.1").searchParams.get("code");
        }
        catch { }
    }
    etapas.push({
        nome: "/authorize (PKCE+senha admin)",
        ok: !!code,
        status: authz.status,
        ms: authz.ms,
        detalhe: code ? "code capturado automaticamente" : (authz.texto || authz.erro || "Falhou em emitir code; verifique MCP_ADMIN_PASSWORD/GH_TOKEN"),
    });
    if (!code) {
        falhouEm = "authorize";
        return { ok: false, falhouEm, etapas };
    }
    // 4) /token
    const tok = await fazerRequest(`${base}/token`, {
        method: "POST",
        headers: { ...baseHeaders, "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            code_verifier: codeVerifier,
            client_id: clientId,
            redirect_uri: "http://127.0.0.1/callback",
        }).toString(),
    });
    const accessToken = tok.json?.access_token;
    etapas.push({
        nome: "/token (troca de code por Bearer)",
        ok: !!accessToken,
        status: tok.status,
        ms: tok.ms,
        detalhe: accessToken ? "token emitido" : (tok.json?.error_description || tok.erro || tok.texto),
    });
    if (!accessToken) {
        falhouEm = "token";
        return { ok: false, falhouEm, etapas };
    }
    // 5) initialize via /admin/mcp
    const init = await fazerRequest(`${base}/admin/mcp`, {
        method: "POST",
        headers: { ...baseHeaders, "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}`, "Accept": "application/json, text/event-stream", "MCP-Protocol-Version": "2025-06-18" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "MCP-Admin-E2E", version: "1.0.0" } } }),
    });
    const initJson = init.json || parseMcpJson(init.texto);
    etapas.push({
        nome: "initialize via /admin/mcp",
        ok: init.ok && !initJson?.error,
        status: init.status,
        ms: init.ms,
        detalhe: initJson?.error?.message || initJson?.result?.serverInfo?.name || init.contentType || init.texto,
    });
    if (!init.ok || initJson?.error) {
        falhouEm = "initialize";
        return { ok: false, falhouEm, etapas };
    }
    // 6) tools/list via /admin/mcp
    let tools = await fazerRequest(`${base}/admin/mcp`, {
        method: "POST",
        headers: { ...baseHeaders, "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}`, "Accept": "application/json, text/event-stream", "MCP-Protocol-Version": "2025-06-18" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }),
    });
    let toolsJson = tools.json || parseMcpJson(tools.texto);
    let { toolCount, error: toolsError } = extrairToolsCount(toolsJson);
    if (!tools.ok || toolsError || typeof toolCount !== "number") {
        const batch = await fazerRequest(`${base}/admin/mcp`, {
            method: "POST",
            headers: { ...baseHeaders, "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}`, "Accept": "application/json, text/event-stream", "MCP-Protocol-Version": "2025-06-18" },
            body: JSON.stringify([
                { jsonrpc: "2.0", id: 10, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "MCP-Admin-E2E", version: "1.0.0" } } },
                { jsonrpc: "2.0", method: "notifications/initialized", params: {} },
                { jsonrpc: "2.0", id: 11, method: "tools/list", params: {} },
            ]),
        });
        const batchJson = batch.json || parseMcpJson(batch.texto);
        const batchExtract = extrairToolsCount(batchJson);
        if (batch.ok && typeof batchExtract.toolCount === "number" && !batchExtract.error) {
            tools = batch;
            toolsJson = batchJson;
            toolCount = batchExtract.toolCount;
            toolsError = null;
        }
    }
    etapas.push({
        nome: "tools/list via /admin/mcp",
        ok: tools.ok && typeof toolCount === "number",
        status: tools.status,
        ms: tools.ms,
        detalhe: typeof toolCount === "number" ? `${toolCount} tools listadas` : (toolsError || tools.erro || tools.texto),
    });
    if (comAdmin) {
        const grokStarted = performance.now();
        const grok = getGrokControlDashboard();
        const hasMode = Array.isArray(grok.catalog?.invocation_modes)
            && grok.catalog.invocation_modes.some((item) => item.id === grok.state?.invocation_mode);
        const hasAgent = Array.isArray(grok.catalog?.agent_profiles)
            && grok.catalog.agent_profiles.some((item) => item.id === grok.state?.agent_profile);
        etapas.push({
            nome: "Grok mode control → adapter canônico",
            ok: grok.status === "OK" && hasMode && hasAgent && grok.proof_boundary?.SELECTED_IS_NOT_ACTIVE === true,
            status: 200,
            ms: Math.round(performance.now() - grokStarted),
            detalhe: [
                "mode=" + (grok.state?.invocation_mode || "UNKNOWN"),
                "agent=" + (grok.state?.agent_profile || "UNKNOWN"),
                "activation=" + (grok.activation?.state || "UNKNOWN"),
                "selected!=active",
            ].join(" · "),
        });
    }
    const bkStarted = performance.now();
    const bk = getBuildkiteStatus({ since_minutes: 60, limit: 100 });
    etapas.push({
        nome: "Buildkite sensor → funil CentralDark",
        ok: bk.receiver_ready === true,
        status: 200,
        ms: Math.round(performance.now() - bkStarted),
        detalhe: [
            "receiver=" + (bk.receiver_ready ? "READY" : "BLOCKED"),
            "secret=" + (bk.webhook_secret_configured ? "CONFIGURED" : "NOT_CONFIGURED"),
            "events=" + bk.events,
            "external=" + bk.proof_boundary.external_buildkite_delivery,
        ].join(" · "),
    });
    const allOk = etapas.every(e => e.ok !== false);
    const firstFailed = etapas.find((e) => e.ok === false);
    return { ok: allOk, falhouEm: allOk ? null : (firstFailed?.nome || "UNKNOWN"), etapas };
}
export async function adminE2E(req, res) {
    if (!isAdmin(req)) {
        res.status(401).json({ ok: false });
        return;
    }
    const l = withCid(req.cid);
    l.info("admin_e2e_start", {});
    try {
        const r = await rodarE2EInterno({ comAdmin: true, cid: req.cid });
        l.info("admin_e2e_end", { ok: r.ok, falhouEm: r.falhouEm });
        res.json(r);
    }
    catch (err) {
        l.error("admin_e2e_error", { error: String(err) });
        res.status(500).json({ ok: false, error: String(err) });
    }
}
export async function adminE2EPublico(req, res) {
    // Versão sem senha, usada pelo postdeploy-healthcheck.sh — só liveness DCR+Discovery
    try {
        const r = await rodarE2EInterno({ comAdmin: false, cid: req.cid });
        res.json(r);
    }
    catch (err) {
        res.status(500).json({ ok: false, error: String(err) });
    }
}
export function adminLogsStream(req, res) {
    if (!isAdmin(req)) {
        res.status(401).end();
        return;
    }
    sseStats.totalConexoes++;
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
        "X-Correlation-Id": req.cid,
        "X-Request-Id": req.cid,
    });
    res.write(`retry: 3000\n\n`);
    for (const line of LOG_BUFFER.slice(-100)) {
        res.write(`data: ${JSON.stringify(line)}\n\n`);
    }
    const send = (line) => res.write(`data: ${JSON.stringify(line)}\n\n`);
    subscribers.add(send);
    pushAdminLog("info", "admin_sse_conectado", { cid: req.cid, path: req.path, conexoesAtivas: subscribers.size });
    const ping = setInterval(() => {
        const line = { t: new Date().toISOString(), level: "debug", msg: "admin_sse_ping", meta: { cid: req.cid, path: req.path } };
        sseStats.totalEventos++;
        sseStats.ultimoEventoEm = line.t;
        sseStats.eventosRecentes.push(Date.now());
        sseStats.ultimasMensagens.push({ t: line.t, level: line.level, msg: line.msg, cid: req.cid, rota: req.path });
        if (sseStats.ultimasMensagens.length > 50)
            sseStats.ultimasMensagens.shift();
        res.write(`:ping cid=${req.cid}\n\n`);
    }, 15000);
    req.on("close", () => {
        clearInterval(ping);
        subscribers.delete(send);
        pushAdminLog("info", "admin_sse_desconectado", { cid: req.cid, path: req.path, conexoesAtivas: subscribers.size });
    });
}
export function adminTestarSse(req, res) {
    if (!isAdmin(req)) {
        res.status(401).json({ ok: false });
        return;
    }
    const l = withCid(req.cid);
    l.info("admin_sse_test", { origem: "botão painel" });
    pushAdminLog("info", "admin_sse_test", { origem: "botão painel", cid: req.cid });
    res.json({ ok: true, cid: req.cid, ts: new Date().toISOString() });
}
export function bootstrapAdminLogCapture() {
    for (const level of ["debug", "info", "warn", "error"]) {
        const orig = log[level].bind(log);
        log[level] = (msg, meta) => {
            try {
                pushAdminLog(level, msg, meta);
            }
            catch { /* nunca quebrar log */ }
            orig(msg, meta);
        };
    }
}
//# sourceMappingURL=admin.js.map