// Painel visual do MCP CentralDark.
// Servido em GET / e GET /painel.
// HTML autocontido (CSS + JS inline). Sem dependências novas.
// Tema inspirado no "Esmeralda" (light default, esmeralda hsl(160 84% 39%),
// sombras 3D táteis, cantos arredondados).
//
// Fonte de dados: GET /status.json (mesmo servidor, sem CORS, sem auth).
// Atualização automática a cada 30s. Tokens/IDs mascarados na UI.
const HTML = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>MCP CentralDark — Painel</title>
<meta name="description" content="Painel ao vivo do servidor MCP CentralDark: status, conectores, catálogo de tools, OAuth e tokens." />
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%2310b981'/%3E%3Cpath d='M16 40V24l8 10 8-10v16M40 24v16M40 24l8 8 8-8' stroke='white' stroke-width='4' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E" />
<style>
:root{
  --bg: hsl(150 20% 98%);
  --surface: #ffffff;
  --surface-2: hsl(150 18% 96%);
  --border: hsl(150 14% 90%);
  --text: hsl(160 20% 14%);
  --muted: hsl(160 8% 45%);
  --primary: hsl(160 84% 39%);
  --primary-soft: hsl(160 84% 95%);
  --warn: hsl(38 92% 50%);
  --warn-soft: hsl(38 92% 95%);
  --error: hsl(0 78% 56%);
  --error-soft: hsl(0 78% 96%);
  --radius-card: 14px;
  --radius-btn: 10px;
  --shadow-soft: 0 1px 0 rgba(255,255,255,.9) inset, 0 1px 2px rgba(16,24,40,.04), 0 6px 14px -8px rgba(16,24,40,.10);
  --shadow-primary: 0 1px 0 rgba(255,255,255,.25) inset, 0 6px 14px -4px hsl(160 84% 39% / .45);
  --shadow-pressed: 0 1px 1px rgba(16,24,40,.08) inset;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:var(--bg);color:var(--text);font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
a{color:var(--primary);text-decoration:none}
a:hover{text-decoration:underline}
.wrap{max-width:1180px;margin:0 auto;padding:24px 20px 80px}
.brand{display:flex;align-items:center;gap:12px;margin-bottom:18px}
.brand .logo{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,hsl(160 84% 45%),hsl(160 84% 32%));display:grid;place-items:center;color:#fff;font-weight:800;box-shadow:var(--shadow-primary)}
.brand h1{font-size:18px;margin:0;font-weight:700;letter-spacing:-.01em}
.brand .sub{color:var(--muted);font-size:12px}
.row{display:flex;flex-wrap:wrap;gap:14px}
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);box-shadow:var(--shadow-soft);padding:18px}
.card h2{font-size:13px;margin:0 0 12px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);font-weight:700}
.grid{display:grid;gap:14px}
.grid.cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}
.grid.cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}
.grid.cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}
@media (max-width:780px){.grid.cols-2,.grid.cols-3,.grid.cols-4{grid-template-columns:1fr}}
.badge{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;padding:4px 10px;border-radius:999px;border:1px solid transparent}
.badge.ok{background:var(--primary-soft);color:hsl(160 84% 22%);border-color:hsl(160 60% 80%)}
.badge.warn{background:var(--warn-soft);color:hsl(38 92% 28%);border-color:hsl(38 80% 80%)}
.badge.error{background:var(--error-soft);color:hsl(0 70% 38%);border-color:hsl(0 60% 85%)}
.dot{width:8px;height:8px;border-radius:50%;display:inline-block}
.dot.ok{background:var(--primary)}
.dot.warn{background:var(--warn)}
.dot.error{background:var(--error)}
.btn{display:inline-flex;align-items:center;gap:8px;padding:9px 14px;border-radius:var(--radius-btn);border:1px solid var(--border);background:var(--surface);color:var(--text);font:600 13px/1 inherit;cursor:pointer;box-shadow:var(--shadow-soft);transition:transform .12s,box-shadow .12s}
.btn:hover{background:var(--surface-2)}
.btn:active{transform:translateY(1px);box-shadow:var(--shadow-pressed)}
.btn.primary{background:var(--primary);color:#fff;border-color:transparent;box-shadow:var(--shadow-primary)}
.btn.primary:hover{filter:brightness(.97)}
.btn.danger{background:var(--error);color:#fff;border-color:transparent;box-shadow:0 1px 0 rgba(255,255,255,.25) inset, 0 6px 14px -4px hsl(0 78% 56% / .45)}
.stat{display:flex;flex-direction:column;gap:4px;padding:12px 14px;background:var(--surface-2);border-radius:12px;border:1px solid var(--border)}
.stat .k{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;font-weight:600}
.stat .v{font-size:22px;font-weight:700;letter-spacing:-.02em}
.conn{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border);border-radius:12px;background:var(--surface-2)}
.conn .name{font-weight:600;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.conn .meta{font-size:11px;color:var(--muted);white-space:nowrap}
details.group{border:1px solid var(--border);border-radius:12px;background:var(--surface-2);padding:0;margin-bottom:8px;overflow:hidden}
details.group>summary{list-style:none;cursor:pointer;padding:12px 14px;display:flex;align-items:center;gap:10px;font-weight:600}
details.group>summary::-webkit-details-marker{display:none}
details.group>summary .chev{margin-left:auto;color:var(--muted);transition:transform .15s}
details.group[open]>summary .chev{transform:rotate(90deg)}
details.group .tools{padding:8px 14px 14px;display:flex;flex-wrap:wrap;gap:6px}
.tool{font:600 11px/1 ui-monospace,SFMono-Regular,Menlo,monospace;padding:5px 8px;border-radius:6px;background:#fff;border:1px solid var(--border);color:var(--text)}
table{width:100%;border-collapse:separate;border-spacing:0;font-size:13px}
thead th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);font-weight:700;padding:10px 12px;border-bottom:1px solid var(--border);background:var(--surface-2)}
tbody td{padding:10px 12px;border-bottom:1px solid var(--border)}
tbody tr:last-child td{border-bottom:0}
code,.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.foot{margin-top:30px;text-align:center;color:var(--muted);font-size:12px}
.foot a{margin:0 8px}
.toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--text);color:#fff;padding:12px 18px;border-radius:10px;font-size:13px;font-weight:500;box-shadow:0 10px 30px -10px rgba(0,0,0,.3);opacity:0;pointer-events:none;transition:opacity .2s,transform .2s}
.toast.show{opacity:1;transform:translateX(-50%) translateY(-4px)}
.skeleton{background:linear-gradient(90deg,var(--surface-2) 0%,var(--border) 50%,var(--surface-2) 100%);background-size:200% 100%;animation:sk 1.2s infinite;border-radius:8px;height:14px}
@keyframes sk{0%{background-position:200% 0}100%{background-position:-200% 0}}
.section{margin-top:18px}
.hdr-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:18px}
.hdr-row .spacer{flex:1}
.recom{padding:10px 12px;border-radius:10px;background:var(--surface-2);border-left:3px solid var(--warn);font-size:13px;margin-bottom:8px}
.recom.error{border-left-color:var(--error)}
.recom.ok{border-left-color:var(--primary)}
.suggest{padding:10px 12px;border-radius:10px;background:var(--surface-2);border:1px solid var(--border);margin-bottom:8px}
.suggest .nm{font-weight:700;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px}
.suggest .pr{font-size:10px;text-transform:uppercase;font-weight:700;padding:2px 6px;border-radius:4px;margin-left:6px}
.suggest .pr.high{background:var(--error-soft);color:hsl(0 70% 38%)}
.suggest .pr.med{background:var(--warn-soft);color:hsl(38 92% 28%)}
.suggest .pr.low{background:var(--primary-soft);color:hsl(160 84% 22%)}
.suggest .rs{color:var(--muted);font-size:12px;margin-top:4px}
.login-chip{display:inline-flex;align-items:center;gap:6px;background:var(--surface-2);border:1px solid var(--border);padding:5px 10px;border-radius:999px;font-size:12px;margin:4px 4px 0 0}
</style>
</head>
<body>
<div class="wrap">
  <div class="brand">
    <div class="logo">M</div>
    <div>
      <h1>MCP CentralDark</h1>
      <div class="sub">Painel ao vivo · <span class="mono" id="host">mcp.centralldark.com</span></div>
    </div>
  </div>

  <div class="hdr-row">
    <span id="statusBadge" class="badge ok"><span class="dot ok"></span><span>Carregando…</span></span>
    <span id="lastUpdate" style="color:var(--muted);font-size:12px"></span>
    <div class="spacer"></div>
    <button class="btn primary" id="refreshBtn">↻ Atualizar agora</button>
  </div>

  <div class="card">
    <h2>Visão geral</h2>
    <div class="grid cols-4" id="overview">
      <div class="stat"><div class="k">Uptime</div><div class="v skeleton" style="width:80px;height:22px"></div></div>
      <div class="stat"><div class="k">Versão</div><div class="v skeleton" style="width:60px;height:22px"></div></div>
      <div class="stat"><div class="k">Tools</div><div class="v skeleton" style="width:50px;height:22px"></div></div>
      <div class="stat"><div class="k">Catálogo</div><div class="v skeleton" style="width:120px;height:22px"></div></div>
    </div>
  </div>

  <div class="card section">
    <h2>Conectores</h2>
    <div class="grid cols-3" id="connectors">
      <div class="skeleton" style="height:48px"></div>
      <div class="skeleton" style="height:48px"></div>
      <div class="skeleton" style="height:48px"></div>
    </div>
  </div>

  <div class="card section">
    <h2>Catálogo de tools</h2>
    <div id="catalog"><div class="skeleton" style="height:40px;margin-bottom:8px"></div><div class="skeleton" style="height:40px"></div></div>
  </div>

  <div class="card section">
    <h2>OAuth · Clients e sessões</h2>
    <div class="grid cols-4" id="oauthStats">
      <div class="stat"><div class="k">Clients</div><div class="v skeleton" style="width:40px;height:22px"></div></div>
      <div class="stat"><div class="k">Access tokens</div><div class="v skeleton" style="width:40px;height:22px"></div></div>
      <div class="stat"><div class="k">Refresh tokens</div><div class="v skeleton" style="width:40px;height:22px"></div></div>
      <div class="stat"><div class="k">Sessões</div><div class="v skeleton" style="width:40px;height:22px"></div></div>
    </div>
    <div style="margin-top:14px" id="ghLogins"></div>
  </div>

  <div class="card section">
    <h2>Tokens emitidos</h2>
    <div id="tokensBox">
      <div style="color:var(--muted);font-size:13px">Sem dados de tokens individuais no momento. Os totais aparecem acima.</div>
    </div>
  </div>

  <div class="grid cols-2 section">
    <div class="card">
      <h2>Sugestões de melhoria</h2>
      <div id="suggestions"><div class="skeleton" style="height:50px"></div></div>
    </div>
    <div class="card">
      <h2>Recomendações</h2>
      <div id="recommendations"><div class="skeleton" style="height:50px"></div></div>
    </div>
  </div>

  <div class="foot">
    <a href="/status.json">/status.json</a> ·
    <a href="/health">/health</a> ·
    <a href="/mcp">/mcp</a> ·
    <a href="/.well-known/oauth-authorization-server">OAuth metadata</a>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
(function(){
  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
  const toast = (msg, ms=2600) => { const t=$("#toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove("show"),ms); };
  const mask = (s) => { if(!s) return "—"; const v=String(s); if(v.length<=8) return v[0]+"***"+v[v.length-1]; return v.slice(0,3)+"***"+v.slice(-3); };
  const fmtUptime = (sec) => { if(!sec) return "—"; const d=Math.floor(sec/86400), h=Math.floor((sec%86400)/3600), m=Math.floor((sec%3600)/60); if(d>0) return d+"d "+h+"h"; if(h>0) return h+"h "+m+"m"; return m+"m"; };
  const countOf = (x) => { if(typeof x==="number") return x; if(Array.isArray(x)) return x.length; if(x && typeof x==="object") return Object.keys(x).length; return 0; };
  const levelClass = (lv) => lv==="ok" ? "ok" : lv==="warn" ? "warn" : "error";

  $("#host").textContent = location.host;

  async function load(){
    try{
      const r = await fetch("/status.json", {cache:"no-store"});
      if(!r.ok) throw new Error("HTTP "+r.status);
      const d = await r.json();
      render(d);
      $("#lastUpdate").textContent = "Atualizado " + new Date().toLocaleTimeString("pt-BR");
    }catch(e){
      $("#statusBadge").innerHTML = '<span class="dot error"></span><span>Erro ao consultar</span>';
      $("#statusBadge").className = "badge error";
      toast("Falha ao buscar /status.json: " + e.message);
    }
  }

  function render(d){
    // badge principal
    const ok = !!d.ok;
    const sb = $("#statusBadge");
    sb.className = "badge " + (ok ? "ok" : "warn");
    sb.innerHTML = '<span class="dot '+(ok?"ok":"warn")+'"></span><span>'+(ok?"Online":"Atenção")+'</span>';

    // overview
    $("#overview").innerHTML = [
      stat("Uptime", fmtUptime(d.uptimeSec)),
      stat("Versão", d.version || "—"),
      stat("Tools", String(d.catalog?.toolCount ?? 0)),
      stat("Catálogo", '<span class="mono" style="font-size:13px">'+(d.catalog?.catalogVersion || "—")+"</span>")
    ].join("");

    // conectores
    const conns = Array.isArray(d.connectors) ? d.connectors : [];
    $("#connectors").innerHTML = conns.length ? conns.map(c => {
      const lv = levelClass(c.level);
      const meta = [c.detail, typeof c.latencyMs==="number" ? (c.latencyMs+"ms") : null].filter(Boolean).join(" · ");
      return '<div class="conn"><span class="dot '+lv+'"></span><span class="name">'+esc(c.name)+'</span><span class="meta">'+esc(meta)+'</span></div>';
    }).join("") : '<div style="color:var(--muted)">Sem conectores reportados.</div>';

    // catálogo (grupos)
    const groups = Array.isArray(d.groups) ? d.groups : [];
    $("#catalog").innerHTML = groups.length ? groups.map(g => {
      const lv = levelClass(g.level);
      const tools = Array.isArray(g.names) ? g.names : [];
      return '<details class="group">'
        + '<summary><span class="dot '+lv+'"></span><span>'+esc(g.label||g.id)+'</span>'
        + '<span class="badge '+lv+'" style="margin-left:6px">'+(g.count||tools.length)+'</span>'
        + '<span class="chev">›</span></summary>'
        + '<div class="tools">'+tools.map(t=>'<span class="tool">'+esc(t)+'</span>').join("")+'</div>'
        + '</details>';
    }).join("") : '<div style="color:var(--muted)">Sem grupos no catálogo.</div>';

    // oauth stats
    const a = d.auth || d.state || {};
    $("#oauthStats").innerHTML = [
      stat("Clients", countOf(a.clients)),
      stat("Access tokens", countOf(a.accessTokens)),
      stat("Refresh tokens", countOf(a.refreshTokens)),
      stat("Sessões", countOf(a.sessions))
    ].join("");

    // logins github
    const logins = Array.isArray(a.uniqueGhLogins) ? a.uniqueGhLogins : [];
    $("#ghLogins").innerHTML = logins.length
      ? '<div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;font-weight:700;margin-bottom:8px">Logins GitHub autenticados</div>'
        + logins.map(l => '<span class="login-chip">'+esc(l)+'</span>').join("")
      : '<div style="color:var(--muted);font-size:13px">Nenhum login GitHub registrado ainda.</div>';

    // tokens (lista detalhada se vier)
    const tokens = Array.isArray(a.tokens) ? a.tokens : [];
    if(tokens.length){
      $("#tokensBox").innerHTML = '<table><thead><tr><th>ID</th><th>Tipo</th><th>Login</th><th>Criado</th><th></th></tr></thead><tbody>'
        + tokens.map(t => '<tr>'
          + '<td><code>'+esc(mask(t.id))+'</code></td>'
          + '<td>'+esc(t.type||"—")+'</td>'
          + '<td>'+esc(t.login||"—")+'</td>'
          + '<td>'+esc(t.createdAt||"—")+'</td>'
          + '<td><button class="btn danger" data-revoke="'+esc(t.id||"")+'">Revogar</button></td>'
          + '</tr>').join("")
        + '</tbody></table>';
      $$("[data-revoke]").forEach(b => b.addEventListener("click", () => toast("Endpoint de revogação ainda não disponível.")));
    }

    // sugestões
    const sug = Array.isArray(d.suggestedTools) ? d.suggestedTools : [];
    $("#suggestions").innerHTML = sug.length ? sug.map(s =>
      '<div class="suggest"><span class="nm">'+esc(s.name)+'</span><span class="pr '+esc(s.priority||"low")+'">'+esc(s.priority||"low")+'</span><div class="rs">'+esc(s.reason||"")+'</div></div>'
    ).join("") : '<div style="color:var(--muted);font-size:13px">Nenhuma sugestão no momento.</div>';

    // recomendações
    const rec = Array.isArray(d.recommendations) ? d.recommendations : [];
    $("#recommendations").innerHTML = rec.length ? rec.map(r =>
      '<div class="recom '+esc(r.level||"warn")+'">'+esc(r.text||"")+'</div>'
    ).join("") : '<div style="color:var(--muted);font-size:13px">Tudo certo, sem recomendações ativas.</div>';
  }

  function stat(k,v){ return '<div class="stat"><div class="k">'+esc(k)+'</div><div class="v">'+(typeof v==="string"?v:esc(String(v)))+'</div></div>'; }
  function esc(s){ const map={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}; return String(s==null?'':s).replace(/[&<>"']/g, c => map[c]); }

  $("#refreshBtn").addEventListener("click", () => { $("#refreshBtn").disabled=true; load().finally(()=>setTimeout(()=>$("#refreshBtn").disabled=false,400)); });
  load();
  setInterval(load, 30000);
})();
</script>
</body>
</html>
`;
export function servePainel(_req, res) {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(HTML);
}
//# sourceMappingURL=painel.js.map