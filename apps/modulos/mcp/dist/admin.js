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
<title>NOC — MCP CentralDark</title>
<style>
:root{--bg:#052e2b;--surf:#0a3d38;--surf2:#0d4a44;--border:#0f5951;--text:#e6fff8;--muted:#7fb8ac;--em:#10b981;--em2:#34d399;--warn:#fbbf24;--err:#f87171}
*{box-sizing:border-box}body{margin:0;background:#031f1c;color:var(--text);font:14px/1.5 ui-monospace,Menlo,Consolas,monospace}
header{background:linear-gradient(180deg,#0a3d38,#052e2b);border-bottom:1px solid var(--border);padding:14px 20px;display:flex;justify-content:space-between;align-items:center}
header h1{margin:0;font-size:16px;color:var(--em2)}header .meta{color:var(--muted);font-size:12px}
main{padding:20px;display:grid;gap:20px;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));max-width:1600px;margin:0 auto}
.card{background:var(--surf);border:1px solid var(--border);border-radius:14px;padding:16px;box-shadow:0 10px 30px -12px rgba(0,0,0,.5)}
.card h2{margin:0 0 12px;font-size:13px;color:var(--em2);text-transform:uppercase;letter-spacing:.08em}
.bar{height:14px;background:#052e2b;border-radius:8px;overflow:hidden;border:1px solid var(--border)}
.bar>span{display:block;height:100%;background:linear-gradient(90deg,var(--em),var(--em2));transition:width .3s}
.row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed var(--border);font-size:13px;gap:8px}
.row:last-child{border:0}.ok{color:var(--em2)}.warn{color:var(--warn)}.err{color:var(--err)}
.tag{display:inline-block;padding:2px 8px;border-radius:6px;background:var(--surf2);border:1px solid var(--border);font-size:11px;color:var(--muted);margin:2px}
.log{background:#020e0d;border:1px solid var(--border);border-radius:10px;padding:10px;max-height:340px;overflow-y:auto;font-size:12px}
.log div{padding:2px 4px;border-bottom:1px solid #0a2b28;white-space:pre-wrap;word-break:break-all}
.log .info{color:#a7f3d0}.log .warn{color:var(--warn)}.log .error{color:var(--err)}.log .debug{color:#5eead4}
button,input,select{background:var(--surf2);border:1px solid var(--border);color:var(--text);padding:6px 10px;border-radius:8px;font:inherit;margin:2px 2px}
button{cursor:pointer}button:hover{background:var(--em);color:#052e2b}
input,select{min-width:0}
.cat{margin-top:10px}.cat h3{margin:8px 0 4px;font-size:12px;color:var(--em2)}
.grid2{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center}
.metricas{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center}
.metricas .kpi{background:var(--surf2);border:1px solid var(--border);border-radius:10px;padding:10px}
.metricas .kpi b{display:block;font-size:22px;color:var(--em2);margin-top:2px}
.metricas .kpi small{color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.06em}
.etapa{display:grid;grid-template-columns:1fr auto auto;gap:8px;padding:8px;border-radius:8px;background:var(--surf2);margin:4px 0;border:1px solid var(--border)}
.etapa.ok{border-color:var(--em)}.etapa.err{border-color:var(--err)}
</style></head><body>
<header>
  <h1>🟢 NOC CentralDark — MCP Dono</h1>
  <div class="meta">
    <span id="clock">--:--:--</span>
    · v<span id="ver">?</span>
    · <a href="/admin/logout" style="color:var(--muted)">sair</a>
  </div>
</header>
<main>
  <section class="card" style="grid-column:1/-1">
    <h2>Health Score</h2>
    <div class="grid2">
      <div class="bar"><span id="scoreBar" style="width:0%"></span></div>
      <strong id="scoreTxt" style="min-width:80px;text-align:right">--%</strong>
    </div>
    <div id="checks" style="margin-top:12px"></div>
  </section>

  <section class="card">
    <h2>Métricas (últimos 5 min)</h2>
    <div class="metricas">
      <div class="kpi"><small>Erros</small><b id="kpiErros">-</b></div>
      <div class="kpi"><small>Warns</small><b id="kpiWarns">-</b></div>
      <div class="kpi"><small>Requests</small><b id="kpiReqs">-</b></div>
      <div class="kpi"><small>SSE ativas</small><b id="kpiSse">-</b></div>
    </div>
  </section>

  <section class="card">
    <h2>Info do processo</h2>
    <div id="proc"></div>
  </section>

  <section class="card" style="grid-column:1/-1">
    <h2>🧪 Teste end-to-end OAuth</h2>
    <div>Simula um cliente ChatGPT: DCR → authorize → token → tools/list.</div>
    <div style="margin-top:8px">
      <button onclick="rodarE2E()">▶️ Rodar teste E2E</button>
      <span id="e2eStatus" style="margin-left:8px;color:var(--muted)"></span>
    </div>
    <div id="e2eResultado" style="margin-top:10px"></div>
  </section>

  <section class="card" style="grid-column:1/-1">
    <h2>🔎 Busca de logs</h2>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
      <input id="fRota" placeholder="rota (ex: /token)" size="18"/>
      <input id="fCid" placeholder="request-id (cid)" size="24"/>
      <select id="fLevel">
        <option value="">todos os níveis</option>
        <option value="debug">debug</option>
        <option value="info">info</option>
        <option value="warn">warn</option>
        <option value="error">error</option>
      </select>
      <input id="fQ" placeholder="texto livre" size="20"/>
      <button onclick="buscarLogs()">Buscar</button>
      <button onclick="limparBusca()">Limpar</button>
    </div>
    <div id="resultBusca" class="log" style="max-height:260px"></div>
  </section>

  <section class="card" style="grid-column:1/-1">
    <h2>Catálogo de tools <span id="toolCount" class="tag">…</span></h2>
    <div id="tools"></div>
  </section>

  <section class="card" style="grid-column:1/-1">
    <h2>Logs ao vivo (SSE)</h2>
    <div>
      <button onclick="testarSse()">🔬 Testar SSE</button>
      <button onclick="recarregar()">🔄 Recarregar tudo</button>
    </div>
    <div id="log" class="log" style="margin-top:10px">Aguardando eventos…</div>
  </section>
</main>
<script>
const $ = (id) => document.getElementById(id);
function ts(){return new Date().toLocaleTimeString('pt-BR')}
setInterval(()=>$('clock').textContent=ts(),1000);

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
    '<div class="row"><span>Serviço iniciado</span><span>'+(j.servicoIniciadoEm||'?').replace('T',' ').slice(0,19)+'</span></div>'+
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
  $('toolCount').textContent = j.total+' tools';
  $('tools').innerHTML = Object.entries(j.categorias).map(([cat,list]) =>
    '<div class="cat"><h3>'+cat+' ('+list.length+')</h3>'+
    list.map(t=>'<span class="tag" title="'+(t.description||'').replace(/"/g,'&quot;')+'">'+t.name+'</span>').join('')+
    '</div>'
  ).join('');
}

function conectarLogs(){
  const es = new EventSource('/admin/logs/stream');
  const box = $('log'); box.innerHTML = '';
  es.onmessage = (ev) => {
    const d = JSON.parse(ev.data);
    const el = document.createElement('div');
    el.className = d.level;
    el.textContent = '['+d.t.slice(11,19)+'] ['+d.level.toUpperCase()+'] '+d.msg+(d.meta?' '+JSON.stringify(d.meta):'');
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
    el.textContent = '['+d.t.slice(11,19)+'] ['+d.level.toUpperCase()+'] '+(d.rota||'-')+' cid='+(d.cid||'-')+' · '+d.msg+(d.meta?' '+JSON.stringify(d.meta):'');
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

function recarregar(){ carregarHealth(); carregarTools(); carregarMetricas(); }
recarregar();
setInterval(carregarHealth, 15000);
setInterval(carregarMetricas, 15000);
conectarLogs();
</script>
</body></html>`;

// ─── Rotas ────────────────────────────────────────────────────────────
export function adminGet(req, res) {
    if (!isAdmin(req)) {
        res.status(401).type("text/html").send(LOGIN_HTML.replace("__ERR__", ""));
        return;
    }
    res.type("text/html").send(NOC_HTML);
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

// ─── Teste E2E: DCR → authorize → token → tools/list ──────────────────
async function fazerRequest(url, opts = {}) {
    const t0 = performance.now();
    try {
        const r = await fetch(url, { redirect: "manual", ...opts, signal: AbortSignal.timeout(10000) });
        const location = r.headers.get("location");
        const texto = await r.text();
        let json = null;
        try { json = JSON.parse(texto); } catch { /* ok */ }
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
        code_challenge: codeChallenge, code_challenge_method: "S256", state, scope: "mcp",
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

    // 5) initialize via /mcp
    const init = await fazerRequest(`${base}/mcp`, {
        method: "POST",
        headers: { ...baseHeaders, "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}`, "Accept": "application/json, text/event-stream", "MCP-Protocol-Version": "2025-06-18" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "MCP-Admin-E2E", version: "1.0.0" } } }),
    });
    const initJson = init.json || parseMcpJson(init.texto);
    etapas.push({
        nome: "initialize via /mcp",
        ok: init.ok && !initJson?.error,
        status: init.status,
        ms: init.ms,
        detalhe: initJson?.error?.message || initJson?.result?.serverInfo?.name || init.contentType || init.texto,
    });
    if (!init.ok || initJson?.error) { falhouEm = "initialize"; return { ok: false, falhouEm, etapas }; }

    // 6) tools/list via /mcp
    let tools = await fazerRequest(`${base}/mcp`, {
        method: "POST",
        headers: { ...baseHeaders, "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}`, "Accept": "application/json, text/event-stream", "MCP-Protocol-Version": "2025-06-18" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }),
    });
    let toolsJson = tools.json || parseMcpJson(tools.texto);
    let { toolCount, error: toolsError } = extrairToolsCount(toolsJson);
    if (!tools.ok || toolsError || typeof toolCount !== "number") {
        const batch = await fazerRequest(`${base}/mcp`, {
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
        nome: "tools/list via /mcp",
        ok: tools.ok && typeof toolCount === "number",
        status: tools.status,
        ms: tools.ms,
        detalhe: typeof toolCount === "number" ? `${toolCount} tools listadas` : (toolsError || tools.erro || tools.texto),
    });

    const allOk = etapas.every(e => e.ok !== false);
    return { ok: allOk, falhouEm: allOk ? null : "tools/list", etapas };
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
