# CONTRATO - admin.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\dist\admin.js
**SHA:** 3a8f47302ae27fee
**Timestamp:** 2026-08-28T02:54:31.725854
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- conexoesTotaisDesdeRestart: sseStats.totalConexoes,
- eventosTotaisDesdeRestart: sseStats.totalEventos,

### Gaps
- header h1{margin:0;font-size:18px;letter-spacing:.3px;display:flex;align-items:center;gap:10px}
- header .meta{font-size:12px;color:var(--muted);display:flex;gap:16px;align-items:center}
- .tabs{display:flex;gap:4px;padding:12px 28px 0;border-bottom:1px solid var(--border);background:rgba(3,31,29,.6);overflow-x:auto}
- .hero{display:grid;grid-template-columns:2fr repeat(5,1fr);gap:14px;margin-bottom:22px}
- .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
- .filters{display:grid;grid-template-columns:repeat(4,1fr) auto auto;gap:8px;margin-bottom:12px}
- .conector-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:8px}
- .conector-card h3{margin:0 0 8px;color:var(--em2);font-size:13px;display:flex;align-items:center;gap:8px}
- .etapa{display:grid;grid-template-columns:1fr 100px 90px;gap:10px;padding:8px 12px;border-radius:8px;background:rgba(10,61,56,.5);margin:6px 0;font-size:12.5px;align-items:center}
- .diag-actions{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap}

### Ouro Bruto (primeiros 5000 chars)
```
// Painel /admin V2.1 — NOC do Dono + busca de logs + teste E2E OAuth.
// Novidades v2.1:
//   • /admin/api/logs            — busca/filtro por rota, cid, level + últimos N
//   • /admin/api/metricas        — contagem de erros nos últimos 5 min
//   • /admin/api/e2e             — teste end-to-end DCR → authorize → token → tools/list
//   • /admin/api/e2e/publico     — versão pública leve (só liveness, sem senha admin)
//   • activeSseSubscribers()     — exportado pro /health/deep contar conexões SSE
import crypto from "node:crypto";
import { performance } from "node:perf_hooks";
import { getCatalogSummary } from "./tools/core/tools-catalog.js";
import { log } from "./log.js";
import { withCid } from "./correlation.js";
import { config } from "./config.js";
import { injectPatternAdmin } from "./admin-patterns-ui.js";
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
function isAdmin(req) {
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
function extrairRota(linha) {
    const p = linha.meta?.path;
    if (typeof p === "string")
        return p;
    // fallback: procura /algo no msg
    const m = /\s(\/[a-zA-Z0-9/_\-.]+)/.exec(String(linha.msg || ""));
    return m ? m[1] : "-";
}
// ─── HTML NOC (tema Esmeralda) — v2.1 ──────────────────────────────────
const LOGIN_HTML = `<!doctype html><html lang="pt-BR"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>MCP CentralDark — Admin</title>
<style>
:root{--bg:#052e2b;--surf:#0a3d38;--border:#0f5951;--text:#e6fff8;--muted:#7fb8ac;--em:#10b981;--em2:#34d399}
*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at top,#0a3d38,#052e2b 70%);color:var(--text);font:15px/1.5 -apple-system,Segoe UI,Roboto,
```

---

# CONTRATO - admin.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\src\admin.js
**SHA:** d005dd77b52545a0
**Timestamp:** 2026-08-28T02:54:43.681464
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- conexoesTotaisDesdeRestart: sseStats.totalConexoes,
- eventosTotaisDesdeRestart: sseStats.totalEventos,

### Gaps
- header h1{margin:0;font-size:18px;letter-spacing:.3px;display:flex;align-items:center;gap:10px}
- header .meta{font-size:12px;color:var(--muted);display:flex;gap:16px;align-items:center}
- .tabs{display:flex;gap:4px;padding:12px 28px 0;border-bottom:1px solid var(--border);background:rgba(3,31,29,.6);overflow-x:auto}
- .hero{display:grid;grid-template-columns:2fr repeat(5,1fr);gap:14px;margin-bottom:22px}
- .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
- .filters{display:grid;grid-template-columns:repeat(4,1fr) auto auto;gap:8px;margin-bottom:12px}
- .conector-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:8px}
- .conector-card h3{margin:0 0 8px;color:var(--em2);font-size:13px;display:flex;align-items:center;gap:8px}
- .etapa{display:grid;grid-template-columns:1fr 100px 90px;gap:10px;padding:8px 12px;border-radius:8px;background:rgba(10,61,56,.5);margin:6px 0;font-size:12.5px;align-items:center}
- .diag-actions{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap}

### Ouro Bruto (primeiros 5000 chars)
```
// Painel /admin V2.1 — NOC do Dono + busca de logs + teste E2E OAuth.
// Novidades v2.1:
//   • /admin/api/logs            — busca/filtro por rota, cid, level + últimos N
//   • /admin/api/metricas        — contagem de erros nos últimos 5 min
//   • /admin/api/e2e             — teste end-to-end DCR → authorize → token → tools/list
//   • /admin/api/e2e/publico     — versão pública leve (só liveness, sem senha admin)
//   • activeSseSubscribers()     — exportado pro /health/deep contar conexões SSE
import crypto from "node:crypto";
import { performance } from "node:perf_hooks";
import { getCatalogSummary } from "./tools/core/tools-catalog.js";
import { log } from "./log.js";
import { withCid } from "./correlation.js";
import { config } from "./config.js";
import { injectPatternAdmin } from "./admin-patterns-ui.js";

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
    if (!cookie || typeof cookie !== "string" || !cookie.includes(".")) return null;
    const [body, sig] = cookie.split(".");
    const expected = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
    try {
        if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    } catch { return null; }
    try {
        const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
        if (payload.exp < Date.now()) return null;
        return payload;
    } catch { return null; }
}
function parseCookies(header) {
    const out = {};
    if (!header) return out;
    for (const part of String(header).split(/;\s*/)) {
        const idx = part.indexOf("=");
        if (idx === -1) continue;
        out[part.slice(0, idx)] = decodeURIComponent(part.slice(idx + 1));
    }
    return out;
}
function isAdmin(req) {
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
    if (LOG_BUFFER.length > LOG_BUFFER_MAX) LOG_BUFFER.shift();
    sseStats.totalEventos++;
    sseStats.ultimoEventoEm = line.t;
    sseStats.eventosRecentes.push(Date.now());
    if (sseStats.eventosRecentes.length > 2000) sseStats.eventosRecentes.splice(0, sseStats.eventosRecentes.length - 2000);
    sseStats.ultimasMensagens.push({ t: line.t, level, msg, cid: meta?.cid, rota: meta?.path });
    if (sseStats.ultimasMensagens.length > 50) sseStats.ultimasMensagens.shift();
    for (const send of subscribers) {
        try { send(line); } catch { /* silencioso */ }
    }
}

function extrairRota(linha) {
    const p = linha.meta?.path;
    if (typeof p === "string") return p;
    // fallback: procura /algo no msg
    const m = /\s(\/[a-zA-Z0-9/_\-.]+)/.exec(String(linha.msg || ""));
    return m ? m[1] : "-";
}

// ─── HTML NOC (tema Esmeralda) — v2.1 ──────────────────────────────────
const LOGIN_HTML = `<!doctype html><html lang="pt-BR"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>MCP CentralDark — Admin</title>
<style>
:root{--bg:#052e2b;--surf:#0a3d38;--border:#0f5951;--text:#e6fff8;--muted:#7fb8ac;--em:#10b981;--em2:#34d399}
*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at top,#0a3d38,#052e2b 70%);color:var(--text);font:15px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;display:grid;place-items:center}
.card{background:var(--surf);border:1px solid var(--border);border-radius:16px;padding:32px;
```