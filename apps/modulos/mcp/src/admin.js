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
import { getBuildkiteStatus } from "./buildkite-integration.js";
import { getGrokControlDashboard, setGrokControlSelection } from "./grok-control.js";

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
.card{background:var(--surf);border:1px solid var(--border);border-radius:16px;padding:32px;width:min(400px,92vw);box-shadow:0 20px 60px -20px rgba(0,0,0,.6)}
h1{margin:0 0 4px;font-size:22px;color:var(--em2)}p{margin:0 0 20px;color:var(--muted);font-size:13px}
input{width:100%;padding:12px 14px;border-radius:10px;border:1px solid var(--border);background:#052e2b;color:var(--text);font:inherit}
button{margin-top:12px;width:100%;padding:12px;border:0;border-radius:10px;background:linear-gradient(180deg,var(--em2),var(--em));color:#052e2b;font-weight:700;cursor:pointer;font-size:15px}
button:hover{filter:brightness(1.05)}.err{color:#fca5a5;font-size:13px;margin-top:10px;min-height:18px}
</style></head><body>
<form class="card" method="POST" action="/admin/login">
<h1>🔒 MCP Dono</h1><p>Painel NOC — acesso restrito ao admin CentralDark.</p>
<input type="password" name="password" placeholder="Senha admin" autofocus required/>
<button type="submit">Entrar</button>
<div class="err">__ERR__</div>
</form></body></html>`;

const NOC_HTML = `<!doctype html><html lang="pt-BR"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>MCP CentralDark — Admin</title>
<style>
:root{--bg:#052e2b;--bg2:#031f1d;--surf:#0a3d38;--surf2:#0d4a44;--border:#0f5951;--border2:#137a6e;--text:#e6fff8;--muted:#7fb8ac;--em:#10b981;--em2:#34d399;--err:#f87171;--warn:#fbbf24;--info:#60a5fa}
*{box-sizing:border-box}
body{margin:0;background:radial-gradient(1200px 600px at 20% -10%,#0a3d38 0%,var(--bg) 60%,var(--bg2) 100%);color:var(--text);font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;min-height:100vh}
header{display:flex;justify-content:space-between;align-items:center;padding:18px 28px;border-bottom:1px solid var(--border);background:rgba(5,46,43,.7);backdrop-filter:blur(10px);position:sticky;top:0;z-index:20}
header h1{margin:0;font-size:18px;letter-spacing:.3px;display:flex;align-items:center;gap:10px}
header h1::before{content:"";width:10px;height:10px;border-radius:50%;background:var(--em);box-shadow:0 0 12px var(--em)}
header .meta{font-size:12px;color:var(--muted);display:flex;gap:16px;align-items:center}
header .meta b{color:var(--em2)}
.tabs{display:flex;gap:4px;padding:12px 28px 0;border-bottom:1px solid var(--border);background:rgba(3,31,29,.6);overflow-x:auto}
.tab{padding:10px 18px;border-radius:8px 8px 0 0;cursor:pointer;color:var(--muted);font-weight:600;font-size:13px;border:1px solid transparent;border-bottom:none;transition:all .15s;white-space:nowrap}
.tab:hover{color:var(--text);background:rgba(16,185,129,.08)}
.tab.active{color:var(--em2);background:var(--surf);border-color:var(--border);position:relative}
.tab.active::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;background:var(--em)}
main{padding:24px 28px 40px;max-width:1400px;margin:0 auto}
.pane{display:none;animation:fade .2s ease}
.pane.active{display:block}
@keyframes fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.hero{display:grid;grid-template-columns:2fr repeat(5,1fr);gap:14px;margin-bottom:22px}
.kpi{background:linear-gradient(135deg,var(--surf) 0%,var(--surf2) 100%);border:1px solid var(--border);border-radius:14px;padding:16px 18px;position:relative;overflow:hidden}
.kpi::before{content:"";position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--em),var(--em2))}
.kpi .lbl{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;font-weight:600}
.kpi .val{font-size:28px;font-weight:700;color:var(--em2);margin-top:6px;line-height:1}
.kpi.hero-score .val{font-size:22px;color:var(--text)}
.bar{height:8px;background:rgba(15,89,81,.5);border-radius:99px;overflow:hidden;margin-top:12px}
.bar>div{height:100%;background:linear-gradient(90deg,var(--em),var(--em2));transition:width .5s;box-shadow:0 0 12px rgba(52,211,153,.5)}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.card{background:var(--surf);border:1px solid var(--border);border-radius:14px;padding:18px 20px}
.card h2{margin:0 0 14px;font-size:14px;color:var(--em2);text-transform:uppercase;letter-spacing:.6px;display:flex;justify-content:space-between;align-items:center}
.card h2 .badge{font-size:11px;background:rgba(16,185,129,.15);color:var(--em2);padding:3px 10px;border-radius:99px;text-transform:none;letter-spacing:0;font-weight:600}
.row{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px dashed rgba(15,89,81,.6);font-size:13px}
.row:last-child{border-bottom:none}
.row span:first-child{color:var(--muted)}
.ok{color:var(--em2);font-weight:600}
.err{color:var(--err);font-weight:600}
.warn{color:var(--warn)}
.info{color:var(--info)}
.cat{margin-bottom:16px}
.cat h3{margin:0 0 8px;font-size:12px;color:var(--em2);text-transform:uppercase;letter-spacing:.6px}
.tag{display:inline-block;background:rgba(16,185,129,.12);border:1px solid rgba(52,211,153,.3);color:var(--em2);padding:4px 10px;border-radius:8px;font-size:11px;margin:3px 3px 3px 0;font-family:ui-monospace,monospace;cursor:help}
.tag:hover{background:rgba(16,185,129,.22)}
.log-box{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px;height:420px;overflow-y:auto;font-family:ui-monospace,'SF Mono',monospace;font-size:11.5px;line-height:1.6}
.log-box>div{padding:2px 4px;border-radius:4px}
.log-box .error,.log-box .err{color:var(--err)}
.log-box .warn{color:var(--warn)}
.log-box .info{color:var(--info)}
.log-box .debug{color:var(--muted)}
.delta-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px}
.delta-kpi{background:rgba(3,31,29,.55);border:1px solid var(--border);border-radius:12px;padding:11px 12px}
.delta-kpi .lbl{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.7px;font-weight:700}
.delta-kpi .val{font-size:22px;font-weight:800;margin-top:3px;color:var(--em2);font-family:ui-monospace,'SF Mono',monospace}
.delta-toolbar{display:flex;gap:8px;align-items:center;justify-content:space-between;margin:0 0 10px;flex-wrap:wrap}
.delta-toolbar .left{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.delta-pill{border:1px solid var(--border);background:rgba(3,31,29,.55);border-radius:999px;color:var(--muted);padding:6px 10px;font-size:11px;font-weight:700;letter-spacing:.2px}
.delta-pill.hot{border-color:rgba(248,113,113,.5);color:#fecaca;background:rgba(248,113,113,.12)}
.delta-table{display:grid;gap:8px;max-height:310px;overflow-y:auto;padding-right:4px}
.delta-row{display:grid;grid-template-columns:80px minmax(160px,1.4fr) 80px minmax(220px,2fr) 125px;gap:10px;align-items:start;background:rgba(3,31,29,.58);border:1px solid var(--border);border-left:4px solid var(--info);border-radius:10px;padding:10px 12px;font-size:12px}
.delta-row.error{border-left-color:var(--err)}
.delta-row.warn{border-left-color:var(--warn)}
.delta-row.info{border-left-color:var(--info)}
.delta-sev{font-weight:800;text-transform:uppercase;font-family:ui-monospace,'SF Mono',monospace}
.delta-row.error .delta-sev{color:var(--err)}
.delta-row.warn .delta-sev{color:var(--warn)}
.delta-row.info .delta-sev{color:var(--info)}
.delta-code{color:var(--text);font-family:ui-monospace,'SF Mono',monospace;word-break:break-word}
.delta-route{color:var(--muted);font-family:ui-monospace,'SF Mono',monospace;word-break:break-word}
.delta-hint{color:#c8f5eb;line-height:1.45}
.delta-last{color:var(--muted);text-align:right;font-family:ui-monospace,'SF Mono',monospace}
.delta-empty{border:1px dashed var(--border);border-radius:10px;color:var(--muted);padding:14px;text-align:center;font-size:12px}
.delta-raw{color:var(--muted);font-size:11px;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
@media(max-width:900px){.delta-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.delta-row{grid-template-columns:70px minmax(0,1fr)}.delta-last{text-align:left}}
.filters{display:grid;grid-template-columns:repeat(4,1fr) auto auto;gap:8px;margin-bottom:12px}
.filters input,.filters select{background:var(--bg2);border:1px solid var(--border);color:var(--text);padding:8px 10px;border-radius:8px;font-size:12px;font-family:inherit}
.filters input:focus,.filters select:focus{outline:none;border-color:var(--em)}
#p-grok select{background:var(--bg2);border:1px solid var(--border);color:var(--text);padding:8px 10px;border-radius:8px;font-size:12px;font-family:inherit}
#p-grok label{color:var(--muted);font-size:11px}
.btn{background:linear-gradient(135deg,var(--em),var(--em2));color:#052e2b;border:none;padding:9px 16px;border-radius:8px;cursor:pointer;font-weight:700;font-size:12px;letter-spacing:.3px;transition:transform .1s}
.btn:hover{transform:translateY(-1px)}
.btn.ghost{background:transparent;color:var(--em2);border:1px solid var(--border2)}
.conector-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:8px}
.conector-card h3{margin:0 0 8px;color:var(--em2);font-size:13px;display:flex;align-items:center;gap:8px}
pre.snippet{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:14px;overflow:auto;font-size:11.5px;color:#c8f5eb;margin:0;font-family:ui-monospace,'SF Mono',monospace;max-height:280px}
.etapa{display:grid;grid-template-columns:1fr 100px 90px;gap:10px;padding:8px 12px;border-radius:8px;background:rgba(10,61,56,.5);margin:6px 0;font-size:12.5px;align-items:center}
.etapa.ok{border-left:3px solid var(--em2)}
.etapa.err{border-left:3px solid var(--err)}
.diag-actions{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap}
__PATTERN_ADMIN_STYLE__
@media(max-width:900px){.hero{grid-template-columns:1fr 1fr 1fr}.grid{grid-template-columns:1fr}.conector-grid{grid-template-columns:1fr}.filters{grid-template-columns:1fr 1fr}}
</style></head>
<body>
<header>
  <h1>MCP CentralDark · Painel Admin</h1>
  <div class="meta"><span>versão <b id="ver">?</b></span><span id="clock">--:--:--</span><a href="/admin/logout" class="btn ghost" style="text-decoration:none;padding:6px 12px">sair</a></div>
</header>
<nav class="tabs">
  <div class="tab active" data-p="visao">Visão Geral</div>
  <div class="tab" data-p="tools">Ferramentas</div>
  __PATTERN_ADMIN_TAB__
  <div class="tab" data-p="audit">Auditoria</div>
  <div class="tab" data-p="grok">Grok</div>
  <div class="tab" data-p="buildkite">Buildkite</div>
  <div class="tab" data-p="conector">Conector</div>
  <div class="tab" data-p="diag">Diagnóstico</div>
</nav>
<main>

  <div class="pane active" id="p-visao">
    <div class="hero">
      <div class="kpi hero-score">
        <div class="lbl">Score de Saúde</div>
        <div class="val" id="scoreTxt">--</div>
        <div class="bar"><div id="scoreBar" style="width:0%"></div></div>
      </div>
      <div class="kpi"><div class="lbl">SSE ativas</div><div class="val" id="kpiSse">-</div></div>
      <div class="kpi"><div class="lbl">Erros</div><div class="val" id="kpiErros">-</div></div>
      <div class="kpi"><div class="lbl">Warns</div><div class="val" id="kpiWarns">-</div></div>
      <div class="kpi"><div class="lbl">Requests</div><div class="val" id="kpiReqs">-</div></div>
      <div class="kpi"><div class="lbl">Tools</div><div class="val" id="toolCount">-</div></div>
    </div>
    <div class="grid">
      <div class="card"><h2>Dependências <span class="badge">health/deep</span></h2><div id="checks"></div></div>
      <div class="card"><h2>Processo <span class="badge">runtime</span></h2><div id="proc"></div></div>
    </div>
  </div>

  <div class="pane" id="p-tools">
    <div class="card"><h2>Catálogo de ferramentas MCP <span class="badge" id="toolCountBadge">carregando…</span></h2><div id="tools"></div></div>
  </div>

  __PATTERN_ADMIN_PANE__

  <div class="pane" id="p-audit">
    <div class="card">
      <h2>Buscar logs <span class="badge">/admin/api/logs</span></h2>
      <div class="filters">
        <input id="fRota" placeholder="rota (ex: /health)"/>
        <input id="fCid" placeholder="cid"/>
        <select id="fLevel"><option value="">— level —</option><option>error</option><option>warn</option><option>info</option><option>debug</option></select>
        <input id="fQ" placeholder="texto livre"/>
        <button class="btn" onclick="buscarLogs()">Buscar</button>
        <button class="btn ghost" onclick="limparBusca()">Limpar</button>
      </div>
      <div id="resultBusca" class="log-box" style="height:220px"></div>
    </div>
    <div style="height:14px"></div>
    <div class="card">
      <h2>Delta útil do stream <span class="badge">até 200 grupos recentes · resumo da sessão</span></h2>
      <div class="delta-grid">
        <div class="delta-kpi"><div class="lbl">Eventos vistos</div><div class="val" id="deltaTotal">0</div></div>
        <div class="delta-kpi"><div class="lbl">Erros únicos</div><div class="val" id="deltaErrors">0</div></div>
        <div class="delta-kpi"><div class="lbl">Top repetição</div><div class="val" id="deltaTop">0×</div></div>
        <div class="delta-kpi"><div class="lbl">Último delta</div><div class="val" id="deltaLast">--:--</div></div>
      </div>
      <div class="delta-toolbar">
        <div class="left">
          <span class="delta-pill" id="deltaMode">agrupando por código/rota/mensagem</span>
          <span class="delta-pill hot" id="deltaHot" style="display:none">🔥 repetição crítica</span>
        </div>
        <button class="btn ghost" onclick="limparDeltaUtil()">Limpar delta</button>
      </div>
      <div id="deltaRows" class="delta-table"><div class="delta-empty">Aguardando eventos SSE para separar ruído de ação.</div></div>
    </div>
    <div style="height:14px"></div>
    <div class="card"><h2>Stream bruto ao vivo <span class="badge">SSE /admin/logs/stream</span></h2><div id="log" class="log-box"></div></div>
  </div>

  <div class="pane" id="p-grok">
    <div class="card">
      <h2>🧠 Grok · modos do organismo <span class="badge" id="grokActivation">carregando…</span></h2>
      <p style="color:var(--muted);font-size:12px;margin:0 0 14px">
        Seleção = default das próximas invocações do adapter canônico. SELECTED != ACTIVE; log/runtime continua sendo o juiz.
      </p>
      <div class="delta-grid">
        <div class="delta-kpi"><div class="lbl">Processo vivo</div><div class="val" id="grokRunning">-</div></div>
        <div class="delta-kpi"><div class="lbl">Binário ativo</div><div class="val" id="grokActiveVersion">-</div></div>
        <div class="delta-kpi"><div class="lbl">Instalado</div><div class="val" id="grokInstalledVersion">-</div></div>
        <div class="delta-kpi"><div class="lbl">Seleção</div><div class="val" id="grokSelectedMode">-</div></div>
      </div>
      <div class="grid">
        <div class="card">
          <h2>Seletor <span class="badge">GROK-BUILD-ADAPTER</span></h2>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <label>Invocação<select id="grokInvocation" style="width:100%;margin-top:4px"></select></label>
            <label>Agente<select id="grokAgent" style="width:100%;margin-top:4px"></select></label>
            <label>Permissão<select id="grokPermission" style="width:100%;margin-top:4px"></select></label>
            <label>Modelo<select id="grokModel" style="width:100%;margin-top:4px"></select></label>
            <label>Reasoning<select id="grokEffort" style="width:100%;margin-top:4px"></select></label>
            <div style="display:flex;flex-direction:column;gap:7px;justify-content:center">
              <label><input id="grokSubagents" type="checkbox"/> subagentes</label>
              <label><input id="grokPlan" type="checkbox"/> plan mode disponível</label>
            </div>
          </div>
          <div class="diag-actions" style="margin-top:14px;margin-bottom:0">
            <button class="btn" onclick="salvarGrok()">💾 Salvar default Grok</button>
            <button class="btn ghost" onclick="carregarGrok()">🔄 Remedir</button>
          </div>
          <div id="grokSaveStatus" style="margin-top:10px;color:var(--muted);font-size:12px"></div>
        </div>
        <div class="card">
          <h2>Evidência <span class="badge">dump sanitizado</span></h2>
          <div id="grokEvidence"></div>
          <div style="height:10px"></div>
          <h2>Permissões fortes <span class="badge">não selecionáveis no Admin</span></h2>
          <div id="grokLockedPermissions"></div>
        </div>
      </div>
      <div style="height:14px"></div>
      <div class="card">
        <h2>Padrão observado <span class="badge">console + events + unified</span></h2>
        <div id="grokPattern"></div>
      </div>
    </div>
  </div>

  <div class="pane" id="p-buildkite">
    <div class="card">
      <h2>Buildkite · setor observado <span class="badge">mesmo funil CentralDark</span></h2>
      <div class="delta-grid">
        <div class="delta-kpi"><div class="lbl">Receiver</div><div class="val" id="bkReceiver">-</div></div>
        <div class="delta-kpi"><div class="lbl">Eventos</div><div class="val" id="bkEvents">0</div></div>
        <div class="delta-kpi"><div class="lbl">Falhas</div><div class="val" id="bkFailures">0</div></div>
        <div class="delta-kpi"><div class="lbl">Taxa medida</div><div class="val" id="bkRate">UNKNOWN</div></div>
      </div>
      <div class="grid">
        <div class="card">
          <h2>Capacidades observadas <span class="badge">não inventa ativo</span></h2>
          <div id="bkObserved"></div>
        </div>
        <div class="card">
          <h2>Fronteira → Hermes <span class="badge">advice != action</span></h2>
          <div id="bkRouting"></div>
        </div>
      </div>
      <div style="height:14px"></div>
      <div class="card">
        <h2>Últimos eventos Buildkite <span class="badge">logs/sectors/buildkite</span></h2>
        <div id="bkRecent" class="log-box" style="height:260px"></div>
      </div>
    </div>
  </div>

  <div class="pane" id="p-conector">
    <div class="card">
      <h2>Como conectar clientes MCP <span class="badge">config</span></h2>
      <p style="color:var(--muted);font-size:13px;margin:0 0 14px">Cole os snippets abaixo no arquivo de config do cliente. Endpoint público oficial: <b>https://mcp.centralldark.com/mcp</b></p>
      <div class="conector-grid">
        <div class="conector-card">
          <h3>🖥️ Claude Desktop</h3>
          <pre class="snippet">{
  "mcpServers": {
    "centraldark": {
      "type": "http",
      "url": "https://mcp.centralldark.com/mcp"
    }
  }
}</pre>
        </div>
        <div class="conector-card">
          <h3>⚡ Cursor</h3>
          <pre class="snippet">{
  "mcpServers": {
    "centraldark": {
      "url": "https://mcp.centralldark.com/mcp",
      "transport": "http"
    }
  }
}</pre>
        </div>
        <div class="conector-card">
          <h3>🧠 Codex CLI</h3>
          <pre class="snippet">[mcp.centraldark]
transport = "http"
url = "https://mcp.centralldark.com/mcp"</pre>
        </div>
        <div class="conector-card">
          <h3>🔌 Outros (SSE)</h3>
          <pre class="snippet">endpoint: https://mcp.centralldark.com/mcp
transport: streamable-http
auth: bearer &lt;TOKEN&gt;  (opcional)</pre>
        </div>
      </div>
    </div>
  </div>

  <div class="pane" id="p-diag">
    <div class="card">
      <h2>Diagnóstico end-to-end <span class="badge">E2E</span></h2>
      <div class="diag-actions">
        <button class="btn" onclick="rodarE2E()">▶ Rodar suíte E2E</button>
        <button class="btn ghost" onclick="testarSse()">📡 Testar SSE</button>
        <button class="btn ghost" onclick="recarregar()">🔄 Recarregar métricas</button>
      </div>
      <div id="e2eStatus" style="margin-bottom:10px;color:var(--muted);font-size:13px">aguardando…</div>
      <div id="e2eResultado"></div>
    </div>
  </div>

</main>
<script>
const $ = (id) => document.getElementById(id);
function horaBr(valor){
  const data = valor ? new Date(valor) : new Date();
  if (Number.isNaN(data.getTime())) return '--:--:--';
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(data);
}
function dataHoraBr(valor){
  const data = valor ? new Date(valor) : new Date();
  if (Number.isNaN(data.getTime())) return '?';
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(data);
}
function ts(){return horaBr()}
setInterval(()=>$('clock').textContent=ts(),1000);

document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.pane').forEach(x=>x.classList.remove('active'));
  t.classList.add('active');
  $('p-'+t.dataset.p).classList.add('active');
}));

__PATTERN_ADMIN_SCRIPT__

const deltaState = { total: 0, groups: new Map(), lastAt: null };
function htmlEscape(valor){
  return String(valor ?? '').replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function compactarTexto(valor, limite=190){
  const texto = String(valor ?? '').replace(/\\s+/g, ' ').trim();
  return texto.length > limite ? texto.slice(0, limite - 1) + '…' : texto;
}
function metaTexto(meta){
  if (!meta) return '';
  if (typeof meta === 'string') return meta;
  try { return JSON.stringify(meta); } catch { return String(meta); }
}
function extrairRotaDelta(evento){
  const meta = evento?.meta || {};
  return meta.path || meta.rota || meta.route || meta.url || '-';
}
function extrairCodigoDelta(evento){
  const bruto = [evento?.msg, metaTexto(evento?.meta)].join(' ');
  const conhecidos = ['HUB_POSTGREST_401','HUB_POSTGREST_403','HUB_POSTGREST_404','HUB_POSTGREST_500','ECONNREFUSED','ETIMEDOUT','SIGTERM'];
  for (const codigo of conhecidos) if (bruto.includes(codigo)) return codigo;
  const http = bruto.match(/\\bHTTP[_\\s-]?(\\d{3})\\b/i) || bruto.match(/\\bstatus["':\\s]+(\\d{3})\\b/i);
  if (http) return 'HTTP_' + http[1];
  const erro = bruto.match(/\\b([A-Z][A-Z0-9_]{4,})\\b/);
  return erro ? erro[1] : (evento?.msg || 'EVENTO').slice(0, 42);
}
function hintDelta(codigo, evento){
  const bruto = [evento?.msg, metaTexto(evento?.meta)].join(' ');
  if (codigo === 'HUB_POSTGREST_401' || /Invalid API key/i.test(bruto)) {
    return 'O servidor rejeitou a credencial. Verificar se a chave pertence ao projeto Supabase configurado. Esta hipótese requer validação no serviço.';
  }
  if (/SIGTERM|Device shutdown|offline/i.test(bruto)) {
    return 'Queda controlada de processo/dispositivo. Validar política de restart, heartbeat e reconexão antes de marcar runtime verde.';
  }
  if (/ECONNREFUSED|ETIMEDOUT/i.test(bruto)) {
    return 'Falha de conectividade. Medir alvo, porta, tunnel e serviço antes de retentar deploy.';
  }
  if (String(evento?.level).toLowerCase() === 'error') return 'Erro novo/repetido: preservar evento, medir owner e abrir próximo cursor com evidência.';
  if (String(evento?.level).toLowerCase() === 'warn') return 'Aviso operacional: observar repetição antes de promover para incidente.';
  return 'Evento informativo: manter como contexto, sem ação se não houver repetição ou falha associada.';
}
function chaveDelta(evento){
  const codigo = extrairCodigoDelta(evento);
  const rota = extrairRotaDelta(evento);
  const msg = compactarTexto(evento?.msg || '-', 80);
  return { codigo, rota, msg, key: [String(evento?.level || 'info').toLowerCase(), codigo, rota, msg].join('|') };
}
function registrarDeltaUtil(evento){
  if (!evento || typeof evento !== 'object' || Array.isArray(evento)) return;
  deltaState.total += 1;
  deltaState.lastAt = evento?.t || new Date().toISOString();
  const dados = chaveDelta(evento);
  const severity = String(evento?.level || 'info').toLowerCase();
  const atual = deltaState.groups.get(dados.key) || {
    severity, codigo: dados.codigo, rota: dados.rota, msg: dados.msg,
    count: 0, firstAt: evento?.t || deltaState.lastAt, lastAt: evento?.t || deltaState.lastAt,
    hint: hintDelta(dados.codigo, evento), raw: compactarTexto(metaTexto(evento?.meta), 220)
  };
  atual.count += 1;
  atual.lastAt = evento?.t || deltaState.lastAt;
  atual.raw = compactarTexto(metaTexto(evento?.meta), 220);
  atual.hint = hintDelta(dados.codigo, evento);
  deltaState.groups.delete(dados.key);
  deltaState.groups.set(dados.key, atual);
  if (deltaState.groups.size > 200) deltaState.groups.delete(deltaState.groups.keys().next().value);
  renderDeltaUtil();
}
function renderDeltaUtil(){
  const todos = [...deltaState.groups.values()];
  const prioridade = g => g.severity === 'error' || /_(401|403|5[0-9]{2})$/.test(g.codigo) ? 2 : g.severity === 'warn' ? 1 : 0;
  const grupos = todos.sort((a,b) => prioridade(b) - prioridade(a) || (b.count - a.count) || String(b.lastAt).localeCompare(String(a.lastAt))).slice(0, 12);
  const errosUnicos = todos.filter(g => prioridade(g) === 2).length;
  const top = Math.max(0, ...todos.map(g => g.count));
  $('deltaTotal').textContent = String(deltaState.total);
  $('deltaErrors').textContent = String(errosUnicos);
  $('deltaTop').textContent = top + '×';
  $('deltaLast').textContent = deltaState.lastAt ? horaBr(deltaState.lastAt).slice(0,5) : '--:--';
  $('deltaHot').style.display = todos.some(g => prioridade(g) === 2 && g.count >= 5) ? 'inline-block' : 'none';
  const box = $('deltaRows');
  if (!grupos.length) {
    box.innerHTML = '<div class="delta-empty">Aguardando eventos SSE para separar ruído de ação.</div>';
    return;
  }
  box.innerHTML = grupos.map(g =>
    '<div class="delta-row '+htmlEscape(g.severity)+'">'+
      '<div class="delta-sev">'+htmlEscape(g.severity)+'<br><span class="delta-pill">'+g.count+'×</span></div>'+
      '<div><div class="delta-code">'+htmlEscape(g.codigo)+'</div><div class="delta-raw">'+htmlEscape(g.msg)+'</div></div>'+
      '<div class="delta-route">'+htmlEscape(g.rota)+'</div>'+
      '<div class="delta-hint">'+htmlEscape(g.hint)+'<details><summary>Detalhes do evento</summary><div class="delta-code">'+htmlEscape(g.raw)+'</div><div>Primeiro: '+htmlEscape(horaBr(g.firstAt))+'</div></details></div>'+
      '<div class="delta-last">último<br>'+htmlEscape(horaBr(g.lastAt))+'</div>'+
    '</div>'
  ).join('');
}
function limparDeltaUtil(){
  deltaState.total = 0;
  deltaState.groups.clear();
  deltaState.lastAt = null;
  renderDeltaUtil();
}

async function carregarHealth(){
  const r = await fetch('/health/deep'); const j = await r.json();
  $('ver').textContent = j.versao || j.version || '?';
  $('scoreBar').style.width = j.score+'%';
  $('scoreTxt').textContent = j.score+'% · '+j.status;
  const deps = j.dependencias || j.checks || [];
  $('checks').innerHTML = deps.map(c =>
    '<div class="row"><span>'+(c.nome||c.key)+'</span><span class="'+(c.ok?'ok':'err')+'">'+(c.ok?'✅ OK':'❌ FALHA')+'</span></div>'
  ).join('');
  $('proc').innerHTML =
    '<div class="row"><span>Serviço iniciado</span><span>'+dataHoraBr(j.servicoIniciadoEm)+'</span></div>'+
    '<div class="row"><span>Uptime</span><span>'+(j.uptimeLegivel||Math.round(j.uptimeSec/60)+' min')+'</span></div>'+
    '<div class="row"><span>RSS</span><span>'+j.memoryMb.rss+' MB</span></div>'+
    '<div class="row"><span>Heap</span><span>'+j.memoryMb.heap+' MB</span></div>'+
    '<div class="row"><span>Loadavg</span><span>'+j.loadavg.map(n=>n.toFixed(2)).join(' · ')+'</span></div>'+
    '<div class="row"><span>SSE eventos/min</span><span>'+(j.sse?.eventosPorMinuto ?? 0)+'</span></div>'+
    '<div class="row"><span>Último evento SSE</span><span>'+(j.sse?.ultimoEventoHaMs == null ? 'sem evento' : Math.round(j.sse.ultimoEventoHaMs/1000)+'s atrás')+'</span></div>';
  $('kpiSse').textContent = j.sseAtivas ?? '0';
}

async function carregarMetricas(){
  const r = await fetch('/admin/api/metricas'); const j = await r.json();
  $('kpiErros').textContent = j.erros ?? '-';
  $('kpiWarns').textContent = j.warns ?? '-';
  $('kpiReqs').textContent = j.requests ?? '-';
}

async function carregarTools(){
  const r = await fetch('/admin/api/tools'); const j = await r.json();
  $('toolCount').textContent = j.total;
  const badge = $('toolCountBadge'); if (badge) badge.textContent = j.total+' tools';
  $('tools').innerHTML = Object.entries(j.categorias).map(([cat,list]) =>
    '<div class="cat"><h3>'+cat+' ('+list.length+')</h3>'+
    list.map(t=>'<span class="tag" title="'+(t.description||'').replace(/"/g,'&quot;')+'">'+t.name+'</span>').join('')+
    '</div>'
  ).join('');
}

let GROK_CONTROL = null;

function preencherGrokSelect(id, items, selected){
  const el=$(id); if(!el) return;
  el.innerHTML='';
  for(const item of items||[]){
    if(item.admin_selectable === false) continue;
    const opt=document.createElement('option');
    opt.value=item.id;
    const evidence=item.evidence ? ' · '+item.evidence : '';
    opt.textContent=item.id+evidence;
    if(item.id===selected) opt.selected=true;
    el.appendChild(opt);
  }
}

function renderGrokControl(j){
  GROK_CONTROL=j;
  const catalog=j.catalog||{}, state=j.state||{}, ev=catalog.evidence||{}, runtime=ev.runtime||{}, observed=ev.observed||{}, caps=ev.capabilities||{};
  $('grokActivation').textContent=j.activation?.state||'UNKNOWN';
  $('grokRunning').textContent=runtime.process_running?'RUNNING':'UNKNOWN';
  $('grokActiveVersion').textContent=runtime.active_binary_version_from_path||'UNKNOWN';
  $('grokInstalledVersion').textContent=runtime.installed_version||'UNKNOWN';
  $('grokSelectedMode').textContent=(state.invocation_mode||'?')+' / '+(state.agent_profile||'?');

  preencherGrokSelect('grokInvocation',catalog.invocation_modes,state.invocation_mode);
  preencherGrokSelect('grokAgent',catalog.agent_profiles,state.agent_profile);
  preencherGrokSelect('grokPermission',catalog.permission_modes,state.permission_mode);
  preencherGrokSelect('grokModel',catalog.models,state.model);
  preencherGrokSelect('grokEffort',catalog.reasoning_efforts,state.reasoning_effort);
  $('grokSubagents').checked=state.subagents_enabled===true;
  $('grokPlan').checked=state.plan_enabled===true;

  const selected=j.selected_evidence||{};
  $('grokEvidence').innerHTML=
    '<div class="row"><span>Modo selecionado</span><span>'+htmlEscape(selected.invocation_mode||'UNKNOWN')+'</span></div>'+
    '<div class="row"><span>Agente selecionado</span><span>'+htmlEscape(selected.agent_profile||'UNKNOWN')+'</span></div>'+
    '<div class="row"><span>Modelo</span><span>'+htmlEscape(selected.model||'UNKNOWN')+'</span></div>'+
    '<div class="row"><span>Snapshot</span><span>'+htmlEscape(ev.captured_at?dataHoraBr(ev.captured_at):'UNKNOWN')+'</span></div>'+
    '<div class="row"><span>SELECTED = ACTIVE?</span><span class="warn">NÃO · requer log de execução</span></div>';

  const locked=(catalog.permission_modes||[]).filter(x=>x.admin_selectable===false);
  $('grokLockedPermissions').innerHTML=locked.length
    ? locked.map(x=>'<span class="tag" title="exige missão explícita + writer scope">'+htmlEscape(x.id)+'</span>').join(' ')
    : '<span class="ok">nenhuma</span>';

  const sub=observed.subagents||{};
  const tools=Object.entries(observed.tools||{}).slice(0,12);
  const watcher=ev.watcher_pattern||{};
  $('grokPattern').innerHTML=
    '<div class="row"><span>Eventos capturados</span><span>'+String(observed.event_lines??0)+'</span></div>'+
    '<div class="row"><span>Subagentes</span><span>'+String(sub.spawned??0)+' spawn · '+String(sub.completed??0)+' completos · '+String(sub.failed??0)+' falhas</span></div>'+
    '<div class="row"><span>Tipos observados</span><span>'+htmlEscape(Object.keys(sub.types||{}).join(', ')||'UNKNOWN')+'</span></div>'+
    '<div class="row"><span>Scheduler / monitor</span><span>'+String(observed.scheduler_create_calls??0)+' create · '+String(observed.monitor_calls??0)+' monitor</span></div>'+
    '<div class="row"><span>Retries / falhas inference</span><span>'+String(observed.inference_retries??0)+' / '+String(observed.inference_failures??0)+'</span></div>'+
    '<div class="row"><span>Watcher exato?</span><span class="'+(watcher.bounded_to_exact_run?'ok':'warn')+'">'+(watcher.bounded_to_exact_run?'SIM':'NÃO · risco cristalizado')+'</span></div>'+
    '<div class="row"><span>Personas disponíveis</span><span>'+htmlEscape((caps.personas||[]).join(', ')||'UNKNOWN')+'</span></div>'+
    '<div class="row"><span>Roles disponíveis</span><span>'+htmlEscape((caps.roles||[]).join(', ')||'UNKNOWN')+'</span></div>'+
    '<div class="row"><span>Workflows</span><span>'+htmlEscape((caps.workflows||[]).join(', ')||'UNKNOWN')+'</span></div>'+
    '<div class="row"><span>Tools top</span><span>'+htmlEscape(tools.map(([k,v])=>k+'='+v).join(' · ')||'UNKNOWN')+'</span></div>';
}

async function carregarGrok(){
  const status=$('grokSaveStatus');
  try{
    const r=await fetch('/admin/api/grok/control');
    const j=await r.json();
    if(!r.ok) throw new Error(j.error||('HTTP '+r.status));
    renderGrokControl(j);
    if(status) status.textContent='Estado remedido. Seleção não é prova de execução.';
  }catch(err){
    if(status) status.textContent='❌ '+String(err);
  }
}

async function salvarGrok(){
  const status=$('grokSaveStatus');
  const payload={
    invocation_mode:$('grokInvocation').value,
    agent_profile:$('grokAgent').value,
    permission_mode:$('grokPermission').value,
    model:$('grokModel').value,
    reasoning_effort:$('grokEffort').value,
    subagents_enabled:$('grokSubagents').checked,
    plan_enabled:$('grokPlan').checked,
  };
  try{
    if(status) status.textContent='salvando default operacional…';
    const r=await fetch('/admin/api/grok/control',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload),
    });
    const j=await r.json();
    if(!r.ok) throw new Error(j.error||('HTTP '+r.status));
    renderGrokControl(j);
    if(status) status.textContent='✅ Default salvo. Próxima invocação do adapter consome; execução ainda precisa ser observada.';
  }catch(err){
    if(status) status.textContent='❌ '+String(err);
  }
}

async function carregarBuildkite(){
  const box = $('bkRecent');
  try {
    const r = await fetch('/admin/api/buildkite/status');
    const j = await r.json();
    $('bkReceiver').textContent = j.receiver_ready ? 'READY' : 'BLOCKED';
    $('bkEvents').textContent = String(j.events ?? 0);
    $('bkFailures').textContent = String(j.failures ?? 0);
    const rate = j.measured_failure_rate;
    $('bkRate').textContent = rate
      ? (rate.rate*100).toFixed(1)+'%'
      : 'UNKNOWN';
    const observed = j.observed || {};
    $('bkObserved').innerHTML =
      '<div class="row"><span>Webhook secret</span><span class="'+(j.webhook_secret_configured?'ok':'warn')+'">'+(j.webhook_secret_configured?'CONFIGURADO':'AUSENTE')+'</span></div>'+
      '<div class="row"><span>API token</span><span class="'+(j.api_token_configured?'ok':'warn')+'">'+(j.api_token_configured?'CONFIGURADO':'OPCIONAL/AUSENTE')+'</span></div>'+
      '<div class="row"><span>Pipelines observados</span><span>'+htmlEscape((observed.pipelines||[]).join(', ') || 'UNKNOWN')+'</span></div>'+
      '<div class="row"><span>Agents observados</span><span>'+htmlEscape((observed.agents||[]).join(', ') || 'UNKNOWN')+'</span></div>'+
      '<div class="row"><span>Queues observadas</span><span>'+htmlEscape((observed.queues||[]).join(', ') || 'UNKNOWN')+'</span></div>'+
      '<div class="row"><span>IC95% falha</span><span>'+(rate ? ((rate.low*100).toFixed(1)+'–'+(rate.high*100).toFixed(1)+'% · n='+j.finished_sample) : 'UNKNOWN · sem amostra')+'</span></div>';
    const h = j.hermes || {};
    const advice = j.routing_advice || {};
    $('bkRouting').innerHTML =
      '<div class="row"><span>Conselho</span><span class="'+(advice.state==='ESCALATE_FRONTIER_FOR_REROUTE'?'warn':'ok')+'">'+htmlEscape(advice.state||'UNKNOWN')+'</span></div>'+
      '<div class="row"><span>Motivo</span><span>'+htmlEscape(advice.reason||'UNKNOWN')+'</span></div>'+
      '<div class="row"><span>Hermes amostra</span><span>'+String(h.sample??0)+'</span></div>'+
      '<div class="row"><span>Hermes falha medida</span><span>'+(h.measured_failure_rate==null?'UNKNOWN':(h.measured_failure_rate*100).toFixed(1)+'%')+'</span></div>'+
      '<div class="row"><span>Hermes p95</span><span>'+(h.p95_duration_ms==null?'UNKNOWN':Math.round(h.p95_duration_ms)+' ms')+'</span></div>'+
      '<div class="row"><span>Ação automática</span><span class="warn">'+(advice.action_executed?'EXECUTADA':'NÃO EXECUTADA')+'</span></div>';
    if (box) {
      const rows=(j.recent_events||[]).slice().reverse();
      box.innerHTML = rows.length ? rows.map(e =>
        '<div class="'+htmlEscape(e.level||'info')+'">['+htmlEscape(horaBr(e.timestamp))+'] '+htmlEscape(e.badge||'')+' '+htmlEscape(e.data?.event||e.kind)+' · '+htmlEscape(e.message||'')+'</div>'
      ).join('') : '<div class="warn">Nenhum evento Buildkite observado ainda. Receiver pronto != entrega externa provada.</div>';
    }
  } catch (err) {
    if (box) box.innerHTML='<div class="err">Buildkite status: '+htmlEscape(String(err))+'</div>';
  }
}

function conectarLogs(){
  const es = new EventSource('/admin/logs/stream');
  const box = $('log'); box.innerHTML = '';
  es.onmessage = (ev) => {
    const d = JSON.parse(ev.data);
    registrarDeltaUtil(d);
    const el = document.createElement('div');
    el.className = d.level;
    el.textContent = '['+horaBr(d.t)+'] ['+d.level.toUpperCase()+'] '+d.msg+(d.meta?' '+JSON.stringify(d.meta):'');
    box.appendChild(el);
    if (box.childNodes.length > 300) box.removeChild(box.firstChild);
    box.scrollTop = box.scrollHeight;
  };
  es.onerror = () => { setTimeout(conectarLogs, 3000); es.close(); };
}

async function buscarLogs(){
  const q = new URLSearchParams();
  if ($('fRota').value) q.set('rota', $('fRota').value);
  if ($('fCid').value) q.set('cid', $('fCid').value);
  if ($('fLevel').value) q.set('level', $('fLevel').value);
  if ($('fQ').value) q.set('q', $('fQ').value);
  q.set('limit', '200');
  const r = await fetch('/admin/api/logs?'+q.toString()); const j = await r.json();
  const box = $('resultBusca'); box.innerHTML = '';
  if (!j.logs?.length) { box.textContent = '(nenhum log encontrado com esses filtros)'; return; }
  for (const d of j.logs) {
    const el = document.createElement('div');
    el.className = d.level;
    el.textContent = '['+horaBr(d.t)+'] ['+d.level.toUpperCase()+'] '+(d.rota||'-')+' cid='+(d.cid||'-')+' · '+d.msg+(d.meta?' '+JSON.stringify(d.meta):'');
    box.appendChild(el);
  }
  box.scrollTop = 0;
}
function limparBusca(){ ['fRota','fCid','fLevel','fQ'].forEach(id=>$(id).value=''); $('resultBusca').innerHTML=''; }

async function testarSse(){
  const r = await fetch('/admin/api/testar-sse', {method:'POST'});
  const j = await r.json();
  alert('SSE test: '+JSON.stringify(j));
}

async function rodarE2E(){
  $('e2eStatus').textContent = 'rodando...';
  $('e2eResultado').innerHTML = '';
  try {
    const r = await fetch('/admin/api/e2e', {method:'POST'});
    const j = await r.json();
    $('e2eStatus').textContent = j.ok ? '✅ Sucesso' : '❌ Falhou na etapa: '+(j.falhouEm||'?');
    $('e2eResultado').innerHTML = (j.etapas||[]).map(e =>
      '<div class="etapa '+(e.ok?'ok':'err')+'">' +
      '<span>'+(e.ok?'✅':'❌')+' '+e.nome+(e.detalhe?' · '+e.detalhe:'')+'</span>'+
      '<span>'+(e.status||'-')+'</span>'+
      '<span>'+(e.ms??'-')+' ms</span>'+
      '</div>'
    ).join('');
  } catch (err) {
    $('e2eStatus').textContent = '❌ Erro: '+String(err);
  }
}

function recarregar(){ carregarHealth(); carregarTools(); carregarMetricas(); carregarGrok(); carregarBuildkite(); }
recarregar();
setInterval(carregarHealth, 15000);
setInterval(carregarMetricas, 15000);
conectarLogs();
</script>
</body></html>`;

// ─── Rotas ────────────────────────────────────────────────────────────
export function adminGet(req, res) {
    if (!isAdmin(req)) {
        // #148 item 3: a tela de login e entregue com sucesso -> 200.
        // MOTIVO  > devolver 401 junto com o HTML completo do login fazia
        //           cliente MCP generico ler "unauthorized" e desistir, sem
        //           descobrir que existe UI de login. Provado em 2026-07-28:
        //           GET /admin -> 401 text/html 2760 bytes, sem
        //           WWW-Authenticate, ou seja 401 sem challenge nenhum.
        // ONDE    > issue #148, item 3 da secao "Falhas / atritos".
        // RESOLVE > 200 para a tela de login (contrato explicito "SPA login").
        //           As rotas protegidas de verdade (/admin/api/*) seguem 401
        //           JSON, e senha errada em POST /admin/login segue 401.
        res.setHeader("Cache-Control", "no-store");
        res.status(200).type("text/html").send(LOGIN_HTML.replace("__ERR__", ""));
        return;
    }
    res.type("text/html").send(injectPatternAdmin(NOC_HTML));
}

export function adminLogin(req, res) {
    const l = withCid(req.cid);
    const senha = String(req.body?.password || "");
    const esperada = process.env.MCP_ADMIN_PASSWORD || "";
    if (!esperada) {
        l.warn("admin_login_sem_senha_configurada", {});
        res.status(500).type("text/html").send(LOGIN_HTML.replace("__ERR__", "MCP_ADMIN_PASSWORD não configurada no .env"));
        return;
    }
    let ok = false;
    try {
        const a = Buffer.from(senha.padEnd(64, "\0").slice(0, 64));
        const b = Buffer.from(esperada.padEnd(64, "\0").slice(0, 64));
        ok = crypto.timingSafeEqual(a, b) && senha.length === esperada.length;
    } catch { ok = false; }
    if (!ok) {
        l.warn("admin_login_falha", { ip: req.ip });
        res.status(401).type("text/html").send(LOGIN_HTML.replace("__ERR__", "Senha incorreta."));
        return;
    }
    const cookie = sign({ role: "admin", exp: Date.now() + TTL_MS });
    res.setHeader("Set-Cookie", `${COOKIE}=${encodeURIComponent(cookie)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${TTL_MS / 1000}`);
    l.info("admin_login_ok", { ip: req.ip });
    res.redirect(302, "/admin");
}

export function adminLogout(_req, res) {
    res.setHeader("Set-Cookie", `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
    res.redirect(302, "/admin");
}

export function adminRotas(req, res) {
    if (!isAdmin(req)) { res.status(401).json({ ok: false }); return; }
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
            { metodo: "GET", path: "/admin/logs/stream", protegido: true },
            { metodo: "POST", path: "/admin/api/e2e", protegido: true },
            { metodo: "GET", path: "/admin/api/logs", protegido: true },
            { metodo: "GET", path: "/admin/api/metricas", protegido: true },
        ],
    });
}

function inferirCategoria(t) {
    const n = (t.name || "").toLowerCase();
    if (n.includes("github") || n.includes("repo") || n.includes("pr_")) return "GitHub";
    if (n.includes("telegram") || n.includes("bot_")) return "Telegram";
    if (n.includes("supabase") || n.includes("sql") || n.includes("db_")) return "Supabase";
    if (n.includes("pm2") || n.includes("vps_") || n.includes("deploy")) return "Deploy/VPS";
    if (n.includes("log") || n.includes("status") || n.includes("health") || n.includes("monitor")) return "Monitoramento";
    if (n.includes("ai_") || n.includes("llm") || n.includes("chat") || n.includes("gemini") || n.includes("openai")) return "IA";
    if (n.includes("admin") || n.includes("skill")) return "Admin";
    return "Utilidades";
}

export function adminTools(req, res) {
    if (!isAdmin(req)) { res.status(401).json({ ok: false }); return; }
    const summary = getCatalogSummary();
    const categorias = {};
    for (const t of summary.tools || []) {
        const c = inferirCategoria(t);
        (categorias[c] ||= []).push({ name: t.name, description: t.description });
    }
    res.json({ total: summary.toolCount, categorias });
}

// ─── Busca de logs (filtro por rota / cid / level / texto) ────────────
export function adminBuscarLogs(req, res) {
    if (!isAdmin(req)) { res.status(401).json({ ok: false }); return; }
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
        if (rota && !r.includes(rota)) continue;
        if (cid && !c.includes(cid)) continue;
        if (level && linha.level !== level) continue;
        if (q && !JSON.stringify(linha).toLowerCase().includes(q)) continue;
        out.push({ ...linha, rota: r, cid: c || undefined });
    }
    res.json({ total: out.length, logs: out });
}

// ─── Métricas: contagem de erros/warns/requests em 5 min ──────────────
export function adminMetricas(req, res) {
    if (!isAdmin(req)) { res.status(401).json({ ok: false }); return; }
    const corte = Date.now() - 5 * 60 * 1000;
    let erros = 0, warns = 0, requests = 0;
    for (let i = LOG_BUFFER.length - 1; i >= 0; i--) {
        const l = LOG_BUFFER[i];
        if (new Date(l.t).getTime() < corte) break;
        if (l.level === "error") erros++;
        else if (l.level === "warn") warns++;
        if (l.msg === "http_request_start") requests++;
    }
    res.json({ janelaMin: 5, erros, warns, requests, sseAtivas: subscribers.size });
}

export function adminGrokControlGet(req, res) {
    if (!isAdmin(req)) { res.status(401).json({ ok: false }); return; }
    res.setHeader("Cache-Control", "no-store");
    res.json(getGrokControlDashboard());
}

export function adminGrokControlPost(req, res) {
    if (!isAdmin(req)) { res.status(401).json({ ok: false }); return; }
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
    } catch (error) {
        l.warn("admin_grok_mode_rejected", { error: String(error?.message || error).slice(0, 180) });
        res.status(400).json({ ok: false, error: String(error?.message || error) });
    }
}

export function adminBuildkiteStatus(req, res) {
    if (!isAdmin(req)) { res.status(401).json({ ok: false }); return; }
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
    } catch (err) {
        return { ok: false, status: 0, ms: Math.round(performance.now() - t0), erro: String(err?.message || err) };
    }
}

function parseMcpJson(texto) {
    const trimmed = String(texto || "").trim();
    if (!trimmed) return null;
    try { return JSON.parse(trimmed); } catch { /* tenta SSE */ }
    const dataLine = trimmed.split(/\r?\n/).find((line) => line.startsWith("data:"));
    if (!dataLine) return null;
    try { return JSON.parse(dataLine.slice(5).trim()); } catch { return null; }
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
    if (!clientId) { falhouEm = "DCR /register"; return { ok: false, falhouEm, etapas }; }

    // 2) Discovery
    const disc = await fazerRequest(`${base}/.well-known/oauth-authorization-server`, { headers: baseHeaders });
    etapas.push({ nome: "Discovery /.well-known", ok: disc.ok, status: disc.status, ms: disc.ms, detalhe: disc.json?.issuer || disc.erro });
    if (!disc.ok) { falhouEm = "Discovery"; return { ok: false, falhouEm, etapas }; }

    if (!comAdmin) return { ok: true, publico: true, etapas };

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
        try { code = new URL(authz.location, "http://127.0.0.1").searchParams.get("code"); } catch {}
    }
    
    etapas.push({
        nome: "/authorize (PKCE+senha admin)",
        ok: !!code,
        status: authz.status,
        ms: authz.ms,
        detalhe: code ? "code capturado automaticamente" : (authz.texto || authz.erro || "Falhou em emitir code; verifique MCP_ADMIN_PASSWORD/GH_TOKEN"),
    });
    if (!code) { falhouEm = "authorize"; return { ok: false, falhouEm, etapas }; }

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
    if (!accessToken) { falhouEm = "token"; return { ok: false, falhouEm, etapas }; }

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
    if (!init.ok || initJson?.error) { falhouEm = "initialize"; return { ok: false, falhouEm, etapas }; }

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
    if (!isAdmin(req)) { res.status(401).json({ ok: false }); return; }
    const l = withCid(req.cid);
    l.info("admin_e2e_start", {});
    try {
        const r = await rodarE2EInterno({ comAdmin: true, cid: req.cid });
        l.info("admin_e2e_end", { ok: r.ok, falhouEm: r.falhouEm });
        res.json(r);
    } catch (err) {
        l.error("admin_e2e_error", { error: String(err) });
        res.status(500).json({ ok: false, error: String(err) });
    }
}

export async function adminE2EPublico(req, res) {
    // Versão sem senha, usada pelo postdeploy-healthcheck.sh — só liveness DCR+Discovery
    try {
        const r = await rodarE2EInterno({ comAdmin: false, cid: req.cid });
        res.json(r);
    } catch (err) {
        res.status(500).json({ ok: false, error: String(err) });
    }
}

export function adminLogsStream(req, res) {
    if (!isAdmin(req)) { res.status(401).end(); return; }
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
        if (sseStats.ultimasMensagens.length > 50) sseStats.ultimasMensagens.shift();
        res.write(`:ping cid=${req.cid}\n\n`);
    }, 15000);
    req.on("close", () => {
        clearInterval(ping);
        subscribers.delete(send);
        pushAdminLog("info", "admin_sse_desconectado", { cid: req.cid, path: req.path, conexoesAtivas: subscribers.size });
    });
}

export function adminTestarSse(req, res) {
    if (!isAdmin(req)) { res.status(401).json({ ok: false }); return; }
    const l = withCid(req.cid);
    l.info("admin_sse_test", { origem: "botão painel" });
    pushAdminLog("info", "admin_sse_test", { origem: "botão painel", cid: req.cid });
    res.json({ ok: true, cid: req.cid, ts: new Date().toISOString() });
}

export function bootstrapAdminLogCapture() {
    for (const level of ["debug", "info", "warn", "error"]) {
        const orig = log[level].bind(log);
        log[level] = (msg, meta) => {
            try { pushAdminLog(level, msg, meta); } catch { /* nunca quebrar log */ }
            orig(msg, meta);
        };
    }
}
