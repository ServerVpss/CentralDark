// Painel /admin — NOC do Dono. Protegido por senha (MCP_ADMIN_PASSWORD).
// Após login seta cookie assinado curto (2h) e libera:
//   • Health Score visual (barra) + status de cada dependência
//   • Catálogo de tools por categoria (nome, descrição, uso)
//   • Rotas do servidor + mapa de subdomínios
//   • Stream de logs ao vivo (SSE em /admin/logs/stream)
//   • Ações rápidas (recarregar catálogo, testar SSE)
// Nada de dados sensíveis fora do log server-side.
import crypto from "node:crypto";
import { getCatalogSummary } from "./tools/core/tools-catalog.js";
import { log } from "./log.js";
import { withCid } from "./correlation.js";

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

// ─── Buffer circular de logs em memória (últimas 500 linhas) ──────────────
const LOG_BUFFER = [];
const LOG_BUFFER_MAX = 500;
const subscribers = new Set();

export function pushAdminLog(level, msg, meta) {
    const line = { t: new Date().toISOString(), level, msg, meta };
    LOG_BUFFER.push(line);
    if (LOG_BUFFER.length > LOG_BUFFER_MAX) LOG_BUFFER.shift();
    for (const send of subscribers) {
        try { send(line); } catch { /* silencioso */ }
    }
}

// ─── HTML NOC (tema Esmeralda) ────────────────────────────────────────────
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
.row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed var(--border);font-size:13px}
.row:last-child{border:0}.ok{color:var(--em2)}.warn{color:var(--warn)}.err{color:var(--err)}
.tag{display:inline-block;padding:2px 8px;border-radius:6px;background:var(--surf2);border:1px solid var(--border);font-size:11px;color:var(--muted);margin:2px}
.log{background:#020e0d;border:1px solid var(--border);border-radius:10px;padding:10px;max-height:340px;overflow-y:auto;font-size:12px}
.log div{padding:2px 4px;border-bottom:1px solid #0a2b28;white-space:pre-wrap;word-break:break-all}
.log .info{color:#a7f3d0}.log .warn{color:var(--warn)}.log .error{color:var(--err)}.log .debug{color:#5eead4}
button{background:var(--surf2);border:1px solid var(--border);color:var(--text);padding:6px 12px;border-radius:8px;cursor:pointer;font:inherit;margin:4px 4px 0 0}
button:hover{background:var(--em);color:#052e2b}
details{margin-top:8px}summary{cursor:pointer;color:var(--muted);font-size:12px}
.cat{margin-top:10px}.cat h3{margin:8px 0 4px;font-size:12px;color:var(--em2)}
.grid2{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center}
</style></head><body>
<header>
  <h1>🟢 NOC CentralDark — MCP Dono</h1>
  <div class="meta">
    <span id="clock">--:--:--</span>
    · <a href="/admin/logout" style="color:var(--muted)">sair</a>
  </div>
</header>
<main>
  <section class="card" style="grid-column:1/-1">
    <h2>Health Score</h2>
    <div class="grid2">
      <div class="bar"><span id="scoreBar" style="width:0%"></span></div>
      <strong id="scoreTxt" style="min-width:60px;text-align:right">--%</strong>
    </div>
    <div id="checks" style="margin-top:12px"></div>
  </section>

  <section class="card">
    <h2>Info do processo</h2>
    <div id="proc"></div>
  </section>

  <section class="card">
    <h2>Rotas ativas</h2>
    <div id="rotas"></div>
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
  $('scoreBar').style.width = j.score+'%';
  $('scoreTxt').textContent = j.score+'% · '+j.status;
  $('checks').innerHTML = (j.checks||[]).map(c =>
    '<div class="row"><span>'+c.key+'</span><span class="'+(c.ok?'ok':'err')+'">'+(c.ok?'✅ OK':'❌ FALHA')+'</span></div>'
  ).join('');
  $('proc').innerHTML =
    '<div class="row"><span>Uptime</span><span>'+Math.round(j.uptimeSec/60)+' min</span></div>'+
    '<div class="row"><span>RSS</span><span>'+j.memoryMb.rss+' MB</span></div>'+
    '<div class="row"><span>Heap</span><span>'+j.memoryMb.heap+' MB</span></div>'+
    '<div class="row"><span>Loadavg</span><span>'+j.loadavg.map(n=>n.toFixed(2)).join(' · ')+'</span></div>'+
    '<div class="row"><span>Versão</span><span>'+j.version+'</span></div>';
}

async function carregarRotas(){
  const r = await fetch('/admin/api/rotas'); const j = await r.json();
  $('rotas').innerHTML = j.rotas.map(x =>
    '<div class="row"><span>'+x.metodo+' '+x.path+'</span><span class="'+(x.protegido?'warn':'ok')+'">'+(x.protegido?'🔒':'público')+'</span></div>'
  ).join('');
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

async function testarSse(){
  const r = await fetch('/admin/api/testar-sse', {method:'POST'});
  const j = await r.json();
  alert('SSE test: '+JSON.stringify(j));
}
function recarregar(){ carregarHealth(); carregarRotas(); carregarTools(); }

recarregar();
setInterval(carregarHealth, 15000);
conectarLogs();
</script>
</body></html>`;

// ─── Rotas exportadas ────────────────────────────────────────────────────
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

export function adminLogsStream(req, res) {
    if (!isAdmin(req)) { res.status(401).end(); return; }
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
    });
    res.write(`retry: 3000\n\n`);
    // Envia buffer inicial
    for (const line of LOG_BUFFER.slice(-100)) {
        res.write(`data: ${JSON.stringify(line)}\n\n`);
    }
    const send = (line) => res.write(`data: ${JSON.stringify(line)}\n\n`);
    subscribers.add(send);
    const ping = setInterval(() => res.write(`:ping\n\n`), 15000);
    req.on("close", () => {
        clearInterval(ping);
        subscribers.delete(send);
    });
}

export function adminTestarSse(req, res) {
    if (!isAdmin(req)) { res.status(401).json({ ok: false }); return; }
    const l = withCid(req.cid);
    l.info("admin_sse_test", { origem: "botão painel" });
    pushAdminLog("info", "admin_sse_test", { origem: "botão painel", cid: req.cid });
    res.json({ ok: true, cid: req.cid, ts: new Date().toISOString() });
}

// Instala captura automática dos logs no buffer/subscribers
export function bootstrapAdminLogCapture() {
    for (const level of ["debug", "info", "warn", "error"]) {
        const orig = log[level].bind(log);
        log[level] = (msg, meta) => {
            try { pushAdminLog(level, msg, meta); } catch { /* nunca quebrar log */ }
            orig(msg, meta);
        };
    }
}
