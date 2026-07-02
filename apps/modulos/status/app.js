const DATA_URL = './painel-data.json';
const REFRESH_MS = 30000;

const $ = (id) => document.getElementById(id);

function pct(value) {
  const n = Number(value || 0);
  return Math.max(0, Math.min(100, n));
}

function safe(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[char]);
}

function statusLabel(status) {
  const map = {
    done: '✅ concluído',
    doing: '🟡 em andamento',
    next: '🔜 próximo',
    later: '⏳ depois',
    forte: '✅ forte',
    ativo: '🟢 ativo',
    andando: '🟡 andando',
    começando: '🔵 começando',
    rodando: '🟢 rodando',
    parcial: '🟡 parcial',
    pendente: '⚠️ pendente',
    'meio caminho': '🟡 meio caminho',
    'em montagem': '🔧 em montagem',
    feito: '✅ feito',
    ok: '🟢 ok'
  };
  return map[status] || status || 'status';
}

// Tudo no painel é renderizado em horário do Brasil (America/Sao_Paulo, BRT)
// independente do fuso do navegador ou do servidor que gerou o JSON.
const BR_TZ = 'America/Sao_Paulo';
function formatDate(dateLike) {
  const d = dateLike ? new Date(dateLike) : new Date();
  if (Number.isNaN(d.getTime())) return '--';
  const txt = d.toLocaleString('pt-BR', {
    timeZone: BR_TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  return txt + ' BRT';
}

async function fetchJson(url) {
  const join = url.includes('?') ? '&' : '?';
  const res = await fetch(url + join + 't=' + Date.now(), { cache: 'no-store' });
  if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
  return res.json();
}

function calcOverallProgress(data) {
  // Calcula automaticamente das fases — se não houver, usa project.overallProgress
  const phases = Array.isArray(data.phases) ? data.phases : [];
  if (phases.length) {
    const sum = phases.reduce((s, p) => s + pct(p.percent), 0);
    return Math.round(sum / phases.length);
  }
  return pct((data.project || {}).overallProgress);
}

function renderData(data) {
  const project = data.project || {};
  $('projectSummary').textContent = project.summary || 'Painel do projeto CentralDark.';
  const overall = calcOverallProgress(data);
  $('overallProgress').textContent = overall + '%';
  $('overallBar').style.width = overall + '%';

  const parts = formatDate(data.updatedAt).split(', ');
  $('lastUpdated').textContent = parts[1] || '--:--';
  $('lastUpdatedDate').textContent = parts[0] || '--';

  $('maturityList').innerHTML = (data.maturity || []).map((item) =>
    '<article class="maturity-card">' +
      '<strong><span>' + safe(item.name) + '</span><span>' + pct(item.value) + '%</span></strong>' +
      '<div class="bar"><i style="width:' + pct(item.value) + '%"></i></div>' +
      '<p><b>' + safe(statusLabel(item.status)) + '</b> · ' + safe(item.detail) + '</p>' +
    '</article>'
  ).join('');

  $('agentsList').innerHTML = (data.agents || []).map((agent) =>
    '<article class="agent-card">' +
      '<div class="agent-emoji">' + safe(agent.emoji || '🤖') + '</div>' +
      '<div>' +
        '<h3>' + safe(agent.name) + '</h3>' +
        '<small>' + safe(agent.role) + ' · ' + pct(agent.power) + '%</small>' +
        '<p>' + safe(agent.description) + '</p>' +
        '<div class="bar"><i style="width:' + pct(agent.power) + '%"></i></div>' +
      '</div>' +
    '</article>'
  ).join('');

  $('milestones').innerHTML = (data.milestones || []).map((m) =>
    '<article class="timeline-item ' + safe(m.status || '') + '">' +
      '<h3>' + safe(m.title) + '</h3>' +
      '<div class="bar"><i style="width:' + pct(m.percent) + '%"></i></div>' +
      '<p>' + safe(statusLabel(m.status)) + ' · ' + pct(m.percent) + '%</p>' +
    '</article>'
  ).join('');

  $('nextSteps').innerHTML = (data.nextSteps || []).map((step) => '<li>' + safe(step) + '</li>').join('');
  $('safeRules').innerHTML = (data.safeRules || []).map((rule) => '<li>' + safe(rule) + '</li>').join('');
}

function renderEvents(data) {
  const box = $('eventsList');
  if (!box) return;

  const events = Array.isArray(data.events) ? data.events : [];
  if (!events.length) {
    box.innerHTML = '<article class="event-card"><div><strong>Nenhum evento ainda</strong><p>Quando avançarmos no chat, os acontecimentos aparecem aqui.</p></div><span>aguardando</span></article>';
    return;
  }

  box.innerHTML = events.map((event) => {
    const title  = event.title  || event.titulo  || 'Evento do projeto';
    const detail = event.detail || event.detalhe || '';
    const sha    = event.sha    ? ' · <code>' + safe(String(event.sha).slice(0, 7)) + '</code>' : '';
    const actor  = event.actor  ? ' · @' + safe(event.actor) : '';
    const stStr  = event.status ? ' · ' + safe(statusLabel(event.status)) : '';
    return '<article class="event-card">' +
      '<div>' +
        '<strong>' + safe(title) + '</strong>' +
        '<p>' + safe(detail) + '</p>' +
      '</div>' +
      '<span>' + safe(event.area || 'Projeto') + sha + actor + stStr + ' · ' + safe(formatDate(event.time || new Date())) + '</span>' +
    '</article>';
  }).join('');
}

function renderAiSuggestions(data) {
  const box = $('aiSuggestionsList');
  if (!box) return;

  const suggestions = Array.isArray(data.aiSuggestions) ? data.aiSuggestions : [];
  if (!suggestions.length) {
    box.innerHTML = '<article class="event-card"><div><strong>Nenhuma sugestão IA/Codex</strong><p>Quando o Codex ou outra IA sugerir algo útil, vai aparecer aqui.</p></div><span>aguardando</span></article>';
    return;
  }

  box.innerHTML = suggestions.slice(0, 8).map((item) => {
    const refs = [];
    if (item.relatedIssue) refs.push('Issue #' + safe(item.relatedIssue));
    if (item.relatedPr) refs.push('PR #' + safe(item.relatedPr));
    if (item.needsConfirmation) refs.push('exige confirmação');

    return '<article class="event-card">' +
      '<div>' +
        '<strong>' + safe(item.title || 'Sugestão IA/Codex') + '</strong>' +
        '<p>' + safe(item.summary || item.instruction || '') + '</p>' +
        (item.copyText ? '<p><b>Texto para copiar:</b> ' + safe(item.copyText) + '</p>' : '') +
        (item.instruction ? '<p><b>Como usar:</b> ' + safe(item.instruction) + '</p>' : '') +
      '</div>' +
      '<span>' + safe(item.origin || 'IA') + ' · ' + safe(item.priority || 'normal') + ' · ' + safe(item.status || 'nova') + (refs.length ? ' · ' + refs.join(' · ') : '') + '</span>' +
    '</article>';
  }).join('');
}

function setGlobal(ok, title, detail) {
  const card = $('globalStatus');
  const pulse = card.querySelector('.pulse');
  pulse.classList.remove('ok', 'bad');
  pulse.classList.add(ok ? 'ok' : 'bad');
  card.querySelector('strong').textContent = title;
  card.querySelector('small').textContent = detail;
}

function liveCard(name, ok, detail, extra) {
  const cls = ok ? 'ok' : 'bad';
  return '<article class="live-card">' +
    '<div>' +
      '<h3>' + safe(name) + '</h3>' +
      '<p>' + safe(detail) + '</p>' +
      '<small class="live-extra ' + cls + '">' + safe(extra || (ok ? 'online' : 'alerta')) + '</small>' +
    '</div>' +
    '<span class="live-dot ' + cls + '"></span>' +
  '</article>';
}

async function renderLive(data) {
  const endpoints = data.publicEndpoints || [];
  const rows = [];
  let mcpOk = false;
  let mcpTools = '--';
  let mcpVersion = '';

  for (const ep of endpoints) {
    const started = performance.now();
    try {
      const json = await fetchJson(ep.url);
      const ms = Math.round(performance.now() - started);
      const statusStr = String(json.status || '').toLowerCase();
      // Para endpoints de dados (type=data), HTTP 200 = ok
      const ok = ep.type === 'data' || Boolean(
        json.ok === true ||
        json.healthy === true ||
        (json.health && json.health.ok === true) ||
        ['ok','online','healthy','up','ready'].includes(statusStr) ||
        (Number(json.toolCount) > 0 && !json.error)
      );

      if (ep.type === 'health' && String(ep.name).toLowerCase().includes('mcp')) {
        mcpOk = ok;
        mcpTools = json.toolCount || json.publicToolCount || json.runtimeToolCount || '--';
        mcpVersion = json.version || (json.health && json.health.version) || '';
      }

      rows.push({ name: ep.name, ok, detail: ms + 'ms · ' + ep.url, extra: json.version ? 'v' + json.version : 'respondendo' });
    } catch (err) {
      rows.push({ name: ep.name, ok: false, detail: ep.url, extra: 'CORS bloqueou (sem acesso externo)' });
    }
  }

  const fallback = (data.project && data.project.liveFallback) ? data.project.liveFallback : {};
  const finalMcpOk = mcpOk || fallback.mcpStatus === 'online';
  const finalTools = mcpTools !== '--' ? mcpTools : (fallback.mcpToolCount || '--');
  const finalVersion = mcpVersion || fallback.mcpVersion || '';

  $('mcpHealth').textContent = finalMcpOk ? 'ONLINE' : 'ALERTA';
  $('mcpDetail').textContent = finalVersion ? 'v' + finalVersion : 'verificando endpoint';
  $('toolCount').textContent = finalTools;
  setGlobal(
    finalMcpOk,
    finalMcpOk ? 'Sistema respirando' : 'Atenção no MCP',
    mcpOk ? 'Health respondeu' : 'Fallback painel-data.json'
  );

  // Endpoints externos
  let html = '';
  if (rows.length) {
    html += '<p class="live-group-label">🌐 Endpoints públicos</p>';
    html += rows.map(r => liveCard(r.name, r.ok, r.detail, r.extra)).join('');
  }

  // PM2 (do painel-data.json — atualiza quando IA chama atualizar_painel)
  const pm2 = data.pm2 || {};
  const pm2Entries = Object.entries(pm2);
  if (pm2Entries.length) {
    html += '<p class="live-group-label">⚡ PM2 — processos VPS</p>';
    html += pm2Entries.map(([name, status]) => {
      const ok = status === 'online';
      const label = status === 'online' ? 'online' : status === 'stopped' ? 'parado' : status;
      return liveCard(name, ok, 'PM2 · VPS', label);
    }).join('');
  }

  // Docker (do painel-data.json)
  const docker = data.docker || {};
  const dockerEntries = Object.entries(docker);
  if (dockerEntries.length) {
    html += '<p class="live-group-label">🐳 Docker — containers VPS</p>';
    html += dockerEntries.map(([name, status]) => {
      const ok = status === 'healthy' || status === 'running';
      return liveCard(name, ok, 'Docker · VPS', status);
    }).join('');
  }

  $('liveStatus').innerHTML = html || '<p style="color:#888;font-size:12px">Nenhum serviço configurado.</p>';
}

async function refresh() {
  try {
    const data = await fetchJson(DATA_URL);
    renderData(data);
    renderEvents(data);
    renderAiSuggestions(data);
    await renderLive(data);
    renderMcpHealth().catch(e => console.warn('[mcpHealth]', e));
    renderGrafoVivo().catch(e => console.warn('[grafoVivo]', e));
  } catch (err) {
    setGlobal(false, 'Erro no painel', 'Não consegui carregar painel-data.json');
    $('liveStatus').innerHTML =
      '<article class="live-card"><div><h3>Erro</h3><p>' + safe(err.message || err) + '</p></div><span class="live-dot bad"></span></article>';
  }
}

function tickClock() {
  $('footerClock').textContent = 'Agora: ' + formatDate(new Date());
}

refresh();
setInterval(refresh, REFRESH_MS);
setInterval(tickClock, 1000);
tickClock();

/* ============= MEGA PAINEL AUTO-VIVO ============= */

function slug(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function cardId(type,sector,title){return slug(type+'-'+sector+'-'+title)}
function recalcProgress(c){if(!c)return 0;const t=Number(c.criteriaTotal||0),d=Number(c.criteriaDone||0);if(t<=0)return Number(c.progress||0);let p=Math.floor((d/t)*100);if((c.status==='bloqueado'||c.status==='erro')&&p>=100)p=99;return Math.max(0,Math.min(100,p))}

function renderCard(c){
  const p = recalcProgress(c);
  const sev = (c.severity||'p3').toLowerCase();
  const st = (c.status||'novo');
  const links = (c.links||[]).map(l=>`<a href="${safe(l.url||l)}" target="_blank" rel="noopener">${safe(l.label||'link')}</a>`).join(' · ');
  return `<article class="av-card">
    <div class="av-head">
      <h3>${safe(c.title||c.id)}</h3>
      <span class="av-badge ${sev}">${sev}</span>
    </div>
    <p>${safe(c.evidence||'')}</p>
    <div class="bar"><i style="width:${p}%"></i></div>
    <div class="av-meta">
      <span class="av-badge status-${safe(st)}">${safe(st.replace(/_/g,' '))}</span>
      <span class="av-badge">${safe(c.owner||'?')}</span>
      <span class="av-badge">${safe(c.type||'card')}</span>
      <span class="av-badge">${p}%</span>
      <span class="av-badge">${safe(c.source||'')}</span>
    </div>
    ${c.nextAction?`<p class="av-next">▶ ${safe(c.nextAction)}</p>`:''}
    ${links?`<p class="av-meta">${links}</p>`:''}
  </article>`;
}

function renderCardLists(data){
  const sets = [['iaCards','iaCardsList'],['botCards','botCardsList'],['sectorCards','sectorCardsList']];
  sets.forEach(([k,id])=>{
    const el=$(id); if(!el) return;
    const arr=Array.isArray(data[k])?data[k]:[];
    el.innerHTML = arr.length ? arr.map(renderCard).join('') : '<p style="color:#888;font-size:12px">Nenhum card ainda.</p>';
  });
}

function renderHumanReview(data){
  const el=$('humanReviewList'); if(!el) return;
  const arr = Array.isArray(data.humanReview)?data.humanReview:[];
  if(!arr.length){el.innerHTML='<p style="color:#888;font-size:12px">Sem itens aguardando revisão humana.</p>';return}
  el.innerHTML = arr.map(r=>{
    const sev=(r.severity||'p3').toLowerCase();
    return `<article class="av-card">
      <div class="av-head">
        <h3>${safe(r.kind||'')} #${safe(r.number||'')} · ${safe(r.title||'')}</h3>
        <span class="av-badge ${sev}">${sev}</span>
      </div>
      <p>${safe(r.summary||'')}</p>
      <div class="av-meta">
        <span class="av-badge status-${safe(r.status||'aguardando_revisao_humana')}">${safe((r.status||'aguardando_revisao_humana').replace(/_/g,' '))}</span>
        <span class="av-badge">bot: ${safe(r.bot||'?')}</span>
      </div>
      <p class="av-next">▶ ${safe(r.nextAction||'')}</p>
      ${r.url?`<p class="av-meta"><a href="${safe(r.url)}" target="_blank" rel="noopener">Abrir no GitHub →</a></p>`:''}
    </article>`;
  }).join('');
}

let _iaTimelineCache=[];
function renderIaTimeline(data){
  const el=$('iaTimelineList'); if(!el) return;
  _iaTimelineCache = Array.isArray(data.iaTimeline)?data.iaTimeline.slice().sort((a,b)=>(b.time||'').localeCompare(a.time||'')):[];
  const sel=$('timelineFilterIa');
  if(sel && sel.children.length<=1){
    [...new Set(_iaTimelineCache.map(t=>t.ia))].forEach(ia=>{
      const o=document.createElement('option'); o.value=ia; o.textContent=ia; sel.appendChild(o);
    });
  }
  applyTimelineFilter();
}
function applyTimelineFilter(){
  const el=$('iaTimelineList'); if(!el) return;
  const ia=$('timelineFilterIa')?.value||'';
  const st=$('timelineFilterStatus')?.value||'';
  const list = _iaTimelineCache.filter(t=>(!ia||t.ia===ia)&&(!st||t.status===st));
  if(!list.length){el.innerHTML='<p style="color:#888;font-size:12px">Sem eventos com esses filtros.</p>';return}
  el.innerHTML = list.map(t=>`<div class="tl-item ${safe(t.status||'')}">
    <span class="tl-time">${safe(formatDate(t.time))}</span>
    <span class="tl-ia">${safe(t.ia||'?')}</span>
    <span class="tl-action">${safe(t.action||'')} ${t.area?`· <i>${safe(t.area)}</i>`:''}</span>
    <span class="tl-status">${safe(t.status||'')}</span>
  </div>`).join('');
}

function renderPhases(data){
  const el=$('phasesList'); if(!el) return;
  const arr = Array.isArray(data.phases)?data.phases:[];
  el.innerHTML = arr.map(ph=>`<div class="phase-row">
    <h3>${safe(ph.name)} <span style="float:right;font-size:12px;color:#bbb">${pct(ph.percent)}% · ${safe((ph.status||'').replace(/_/g,' '))}</span></h3>
    <div class="bar"><i style="width:${pct(ph.percent)}%"></i></div>
    <div class="phase-items">${(ph.items||[]).map(i=>`<span>${safe(i)}</span>`).join('')}</div>
  </div>`).join('');
}

/* ========= MCP TESTE (read-only, sem token) ========= */
const MCP_TEST_BUTTONS = [
  {key:'status',label:'📊 Status MCP',type:'json'},
  {key:'health',label:'❤️ Health',type:'json'},
  {key:'readme',label:'📘 Ler README',type:'text'},
  {key:'consciencia',label:'🧠 Ler CONSCIENCIA',type:'text'},
  {key:'pendencias',label:'📋 Listar PENDENCIAS',type:'text'},
  {key:'relatorios',label:'📂 Últimos relatórios',type:'json'}
];

function mountMcpTest(data){
  const box=$('mcpTestButtons'); if(!box||box.dataset.mounted) return;
  box.dataset.mounted='1';
  const cfg = data.mcpTest||{endpoints:{}};
  MCP_TEST_BUTTONS.forEach(b=>{
    const btn=document.createElement('button');
    btn.textContent=b.label;
    btn.onclick=()=>runMcpTest(b,cfg.endpoints[b.key],btn);
    if(!cfg.endpoints[b.key]) btn.disabled=true;
    box.appendChild(btn);
  });
}

async function runMcpTest(b,url,btn){
  const out=$('mcpTestOutput'); out.classList.remove('err');
  if(!url){out.textContent='Endpoint não configurado.';return}
  out.textContent='⏳ Consultando '+url+' ...';
  btn.disabled=true;
  try{
    const res=await fetch(url,{cache:'no-store'});
    const ct=res.headers.get('content-type')||'';
    let body;
    if(b.type==='json'||ct.includes('json')){
      body=JSON.stringify(await res.json(),null,2);
    } else {
      body=await res.text();
      if(body.length>20000) body=body.slice(0,20000)+'\n\n... (truncado)';
    }
    out.textContent='✅ '+res.status+' '+res.statusText+'\nURL: '+url+'\n\n'+body;
  }catch(e){
    out.classList.add('err');
    out.textContent='❌ Falhou: '+(e.message||e)+'\n\nDica: pode ser CORS ou MCP fora do ar. Sem token exposto, sem retry destrutivo.';
  }finally{btn.disabled=false}
}

/* ========= Histórico do vps-healthcheck (últimos 30 dias) ========= */
const HC_URL = './healthcheck-history.json';
const SEV_RANK = { p0: 4, p1: 3, p2: 2, p3: 1 };

async function renderHealthcheck(){
  const bars=$('hcBars'), sum=$('hcSummary'), foot=$('hcFoot');
  if(!bars||!sum) return;
  let data;
  try{ data = await fetchJson(HC_URL + '?t=' + Date.now()); }
  catch(e){
    sum.innerHTML = '<span class="hc-loading">sem histórico ainda</span>';
    bars.innerHTML = '<p style="color:#888;font-size:12px">O bot ainda não rodou nenhuma vez. O primeiro run agenda em até 6h.</p>';
    return;
  }
  const events = Array.isArray(data.events) ? data.events : [];
  // Bucketiza por dia (últimos 30) — pior severidade do dia define a cor.
  const days = [];
  const today = new Date(); today.setUTCHours(0,0,0,0);
  for(let i=29;i>=0;i--){
    const d = new Date(today.getTime() - i*86400000);
    const key = d.toISOString().slice(0,10);
    days.push({ key, date: d, sev: null, count: 0, lastIssue: null });
  }
  const byKey = Object.fromEntries(days.map(d=>[d.key,d]));
  events.forEach(ev=>{
    const k = (ev.time||'').slice(0,10);
    const day = byKey[k]; if(!day) return;
    day.count++;
    const sev = (ev.severity||'p3').toLowerCase();
    if(!day.sev || SEV_RANK[sev] > SEV_RANK[day.sev]) day.sev = sev;
    if(!day.lastIssue && ev.issueNumber) day.lastIssue = { n: ev.issueNumber, url: ev.issueUrl };
  });

  // Contadores agregados
  const counts = {p0:0,p1:0,p2:0,p3:0};
  events.forEach(e=>{ const s=(e.severity||'p3').toLowerCase(); if(counts[s]!=null) counts[s]++; });
  const latest = data.latestIssue || (events.length ? { number: events[events.length-1].issueNumber, url: events[events.length-1].issueUrl, severity: events[events.length-1].severity } : null);

  sum.innerHTML = `
    <span class="hc-count p0">P0 · ${counts.p0}</span>
    <span class="hc-count p1">P1 · ${counts.p1}</span>
    <span class="hc-count p2">P2 · ${counts.p2}</span>
    <span class="hc-count p3">P3 · ${counts.p3}</span>
    ${latest && latest.url ? `<a class="hc-link" href="${safe(latest.url)}" target="_blank" rel="noopener">Issue #${safe(latest.number)} (${safe((latest.severity||'p3').toUpperCase())}) →</a>` : ''}
  `;

  bars.innerHTML = days.map(d=>{
    const sev = d.sev || 'empty';
    const titleParts = [d.key];
    if(d.count) titleParts.push(`${d.count} run(s)`, `pior: ${sev.toUpperCase()}`);
    else titleParts.push('sem execução');
    if(d.lastIssue) titleParts.push(`Issue #${d.lastIssue.n}`);
    const click = d.lastIssue?.url ? `onclick="window.open('${d.lastIssue.url}','_blank','noopener')"` : '';
    const cursor = d.lastIssue?.url ? 'style="cursor:pointer"' : '';
    return `<span class="hc-bar ${sev}" title="${safe(titleParts.join(' · '))}" ${click} ${cursor}></span>`;
  }).join('');

  const last = events[events.length-1];
  foot.innerHTML = last
    ? `Última execução: <b>${safe(formatDate(last.time))}</b> · severidade <b>${safe((last.severity||'p3').toUpperCase())}</b> · ${safe(events.length)} run(s) nos últimos 30 dias.`
    : 'Nenhuma execução registrada ainda.';
}

/* ========= Sessões MultiZap / WuzAPI ========= */
const WZ_URL = './wuzapi-sessions.json';
const REPO_SLUG = 'ServerVpss/clone-deck';

async function renderWuzapiSessions(){
  const list = $('wzList'), sum = $('wzSummary'), foot = $('wzFoot');
  if(!list || !sum) return;
  let data;
  try { data = await fetchJson(WZ_URL + '?t=' + Date.now()); }
  catch(e){
    sum.innerHTML = '<span class="hc-loading">sem snapshot ainda</span>';
    list.innerHTML = '<p style="color:#888;font-size:12px">O monitor ainda não rodou. Primeiro run em ~15min.</p>';
    return;
  }
  const sessions = Array.isArray(data.sessions) ? data.sessions : [];
  const ok = data.connected ?? sessions.filter(s=>s.connected && s.loggedIn).length;
  const off = data.disconnected ?? (sessions.length - ok);
  const sev = off === 0 ? 'p3' : off === sessions.length ? 'p1' : 'p2';

  sum.innerHTML = `
    <span class="hc-count p3">✅ ${ok} ok</span>
    ${off ? `<span class="hc-count ${sev}">⚠️ ${off} off</span>` : ''}
    <span class="hc-count" style="background:rgba(255,255,255,.05);color:#aaa">total ${sessions.length}</span>
  `;

  list.innerHTML = sessions.length ? sessions.map(s => {
    const cls = s.connected && s.loggedIn ? 'ok' : (s.hasQr ? 'qr' : 'off');
    const badge = s.connected && s.loggedIn ? '🟢 conectado · logado' : s.hasQr ? '🟡 QR pendente' : '🔴 desconectado';
    const issueUrl = `https://github.com/${REPO_SLUG}/issues?q=is%3Aissue+label%3Amultizap+${encodeURIComponent(s.name)}`;
    return `
      <article class="wz-card ${safe(cls)}">
        <header>
          <strong>${safe(s.name)}</strong>
          <span class="wz-badge ${safe(cls)}">${badge}</span>
        </header>
        <dl>
          <div><dt>JID</dt><dd><code>${safe(s.jid || '-')}</code></dd></div>
          <div><dt>ID</dt><dd><code>${safe(s.id || '-')}</code></dd></div>
          <div><dt>Eventos</dt><dd>${safe(s.events || '-')}</dd></div>
          <div><dt>Webhook</dt><dd class="wz-webhook" title="${safe(s.webhook||'')}">${safe(s.webhook ? '✅ presente (mascarado)' : '—')}</dd></div>
        </dl>
        <footer>
          <a href="${safe(issueUrl)}" target="_blank" rel="noopener">📜 Logs/alertas no GitHub →</a>
        </footer>
      </article>
    `;
  }).join('') : '<p style="color:#888;font-size:12px">Nenhuma sessão cadastrada na WuzAPI.</p>';

  foot.innerHTML = `Última verificação: <b>${safe(formatDate(data.generatedAt))}</b> · próxima execução: ${safe(data.nextRun || '~15min')}. <span style="color:#666">Logs sanitizados, sem token exposto.</span>`;
}

/* ========= Pipeline — Tarefas por estágio ========= */
const PIPELINE_ORDER = ['LOCAL','GITHUB','PR_ABERTO','CHECKS','APROVADO','MERGEADO','VPS','PRODUCAO','CONSOLIDADO'];
const PIPELINE_META = {
  'LOCAL':          { emoji:'📝', label:'Local',      cls:'local'      },
  'GITHUB':         { emoji:'☁️', label:'GitHub',     cls:'github'     },
  'PR_ABERTO':      { emoji:'🔁', label:'PR Aberto',  cls:'pr'         },
  'CHECKS':         { emoji:'🧪', label:'Checks',     cls:'checks'     },
  'ATUALIZADO':     { emoji:'🧪', label:'Checks',     cls:'checks'     },
  'APROVADO':       { emoji:'✅', label:'Aprovado',   cls:'aprovado'   },
  'REVISAO_PEDIDA': { emoji:'🔄', label:'Revisão',    cls:'revisao'    },
  'MERGEADO':       { emoji:'🟢', label:'Mergeado',   cls:'mergeado'   },
  'VPS':            { emoji:'🚀', label:'VPS',         cls:'vps'        },
  'VPS_ERRO':       { emoji:'⚠️', label:'VPS Erro',   cls:'erro'       },
  'PRODUCAO':       { emoji:'🌐', label:'Produção',   cls:'producao'   },
  'CONSOLIDADO':    { emoji:'🏁', label:'Consolidado',cls:'consolidado'},
  'FECHADO':        { emoji:'❌', label:'Fechado',    cls:'fechado'    },
  'COMENTADO':      { emoji:'💬', label:'Comentário', cls:'checks'     },
};

function renderTarefasAtivas(data) {
  const el = $('tarefasAtivasList'); if (!el) return;
  const tarefas = Array.isArray(data.tarefasAtivas) ? data.tarefasAtivas : [];
  if (!tarefas.length) {
    el.innerHTML = '<p class="pipeline-empty">Nenhuma tarefa ativa. Abre um PR para ver o pipeline aqui.</p>';
    return;
  }
  el.innerHTML = tarefas.map(t => {
    const meta = PIPELINE_META[t.estagio] || { emoji: t.emoji || '⚙️', label: t.label || t.estagio, cls: 'default' };
    const curIdx = PIPELINE_ORDER.indexOf(t.estagio);
    const steps = PIPELINE_ORDER.map((s, i) => {
      const sm = PIPELINE_META[s] || {};
      const done = i < curIdx;
      const active = i === curIdx;
      return `<span class="pipe-step ${done?'done':''} ${active?'active':''}" title="${sm.label||s}">${sm.emoji||'·'}</span>`;
    }).join('');
    const num = t.numero ? `<a href="${safe(t.url||'#')}" target="_blank" rel="noopener" class="pipe-num">PR #${t.numero}</a>` : '';
    const age = t.updatedAt ? formatDate(t.updatedAt) : '';
    return `<article class="pipe-card ${meta.cls}">
      <div class="pipe-head">
        <span class="pipe-badge ${meta.cls}">${meta.emoji} ${meta.label}</span>
        ${num}
        <span class="pipe-author">@${safe(t.author||'?')}</span>
      </div>
      <p class="pipe-title">${safe(t.titulo||t.id)}</p>
      <div class="pipe-steps">${steps}</div>
      <p class="pipe-time">${safe(age)}</p>
    </article>`;
  }).join('');
}

function renderLinearSync(data) {
  const el = $('linearSyncCard'); if (!el) return;
  const d = data.linearSync || {};
  const tag = document.getElementById('linearSyncStatusTag');
  const status = d.statusConexao || 'desconectado';
  const dotCls = status === 'ok' ? 'dot--green' : status === 'alerta' ? 'dot--yellow' : 'dot--red';
  if (tag) { tag.textContent = status; tag.className = `tag ${status === 'ok' ? '' : 'tag--alert'}`; }
  el.innerHTML = `<div class="live-row">
    <span class="dot ${dotCls}"></span>
    <span><strong>${safe(d.teamAtivo || '—')}</strong> · ${safe(d.statusConexaoDetalhe || status)}</span>
  </div>
  <div style="margin-top:8px;display:flex;gap:16px;flex-wrap:wrap">
    <span>📋 Issues abertas: <strong>${d.issuesAbertas ?? '—'}</strong></span>
    <span>🔴 Críticas (P0+P1): <strong>${d.issuesCriticas ?? '—'}</strong></span>
    <span>🕐 Último sync: <strong>${d.ultimoSync ? formatDate(d.ultimoSync) : 'nunca'}</strong></span>
  </div>
  ${d.proxAcao ? `<p style="margin-top:8px;opacity:0.7;font-size:0.85rem">→ ${safe(d.proxAcao)}</p>` : ''}`;
}

function renderHandoffAtual(data) {
  const el = $('handoffAtualCard'); if (!el) return;
  const d = data.handoffAtual || {};
  el.innerHTML = `<div style="display:grid;gap:6px">
    <div class="live-row"><span>🤖 IA atual:</span><strong>${safe(d.iaAtual || '—')}</strong></div>
    <div class="live-row"><span>📅 Sessão:</span><span>${safe(d.sessaoIniciada || '—')}</span></div>
    <div class="live-row"><span>✅ Última ação:</span><span>${safe(d.ultimaAcao || '—')}</span></div>
    <div class="live-row"><span>➡️ Próxima IA:</span><strong>${safe(d.proximaIARecomendada || '—')}</strong></div>
    <div class="live-row"><span>🎯 Próxima ação:</span><span>${safe(d.proximaAcaoExata || '—')}</span></div>
    ${d.handoffSalvoEm ? `<div class="live-row"><span>📄 Handoff em:</span><code style="font-size:0.8rem">${safe(d.handoffSalvoEm)}</code></div>` : ''}
  </div>`;
}

function renderSegurancaArea(data) {
  const el = $('segurancaAreaCard'); if (!el) return;
  const d = data.segurancaAreaProtegida || {};
  const rows = Object.entries(d).map(([k, v]) => {
    const icon = k.includes('whatsapp') ? '📱' : k.includes('docker') ? '🐳' : k.includes('caddy') ? '🌐' : k.includes('pm2') ? '⚙️' : k.includes('supabase') ? '🗄️' : k.includes('dns') ? '🔗' : k.includes('git') ? '📦' : '🔒';
    return `<div class="live-row"><span>${icon} <code style="font-size:0.8rem">${safe(k)}</code></span><span style="color:var(--c-orange,#f97316);font-size:0.85rem">${safe(v)}</span></div>`;
  }).join('');
  el.innerHTML = rows || '<p>Sem regras registradas.</p>';
}

function renderVpsTelemetry(data) {
  const t = data.telemetry;
  if (!t) return;
  const cpuEl = $('vpsCpu'); if (cpuEl) cpuEl.textContent = t.cpu || '--%';
  const ramEl = $('vpsRam'); if (ramEl) ramEl.textContent = (t.ramPercent ? t.ramPercent + '%' : '--%');
  const ramDEl = $('vpsRamDetail'); if (ramDEl) ramDEl.textContent = t.ram || '--';
  const discoEl = $('vpsDisco'); if (discoEl) discoEl.textContent = t.disco || '--%';
  const loadEl = $('vpsLoad'); if (loadEl) loadEl.textContent = 'load: ' + (t.load || '--');
  const atEl = $('vpsTelemetryAt'); if (atEl) atEl.textContent = t.brtTimestamp || '--';
}

/* ========= Hook no refresh ========= */
const _origRefresh = refresh;
refresh = async function(){
  await _origRefresh();
  try{
    const data = await fetchJson(DATA_URL);
    mountMcpTest(data);
    renderCardLists(data);
    renderTarefasAtivas(data);
    renderHumanReview(data);
    renderIaTimeline(data);
    renderLinearSync(data);
    renderHandoffAtual(data);
    renderSegurancaArea(data);
    renderPhases(data);
    renderHealthcheck();
    renderWuzapiSessions();
    renderVpsTelemetry(data);
  }catch(e){console.warn('auto-vivo render fail',e)}
};


document.addEventListener('change',(e)=>{
  if(e.target&&(e.target.id==='timelineFilterIa'||e.target.id==='timelineFilterStatus')) applyTimelineFilter();
});

/* ============= MCP HEALTH (WATCHDOG) ============= */
async function renderMcpHealth() {
  try {
    const res = await fetch('./mcp-health.json?t=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const h = await res.json();
    const tag = document.getElementById('mcpHealthTag');
    const lastStatus = h?.lastCheck?.status || 'unknown';
    if (lastStatus === 'ok') {
      tag.textContent = '🟢 estável';
      tag.style.background = 'rgba(16,185,129,.15)';
      tag.style.color = '#10b981';
    } else if (lastStatus === 'pending_install') {
      tag.textContent = '🟡 watchdog não instalado';
      tag.style.background = 'rgba(245,158,11,.15)';
      tag.style.color = '#f59e0b';
    } else {
      tag.textContent = '🔴 instável';
      tag.style.background = 'rgba(239,68,68,.15)';
      tag.style.color = '#ef4444';
    }
    document.getElementById('mhUptime').textContent = (h?.last24h?.uptimePct ?? '—') + '%';
    document.getElementById('mhChecks').textContent = h?.last24h?.checks ?? '—';
    document.getElementById('mhFails').textContent = h?.last24h?.failures ?? '—';
    document.getElementById('mhRestarts').textContent = h?.last24h?.autoRestarts ?? '—';
    document.getElementById('mhLatency').textContent = (h?.lastCheck?.latencyMs ?? '—') + ' ms';
    document.getElementById('mhLastFail').textContent = h?.lastFailureAt && h.lastFailureAt !== 'null'
      ? formatDate(h.lastFailureAt) : '—';
  } catch (e) {
    const tag = document.getElementById('mcpHealthTag');
    if (tag) { tag.textContent = 'sem dados'; tag.style.color = '#6b7280'; }
  }
}

/* ============= GRAFO VIVO (force-graph via CDN) ============= */
let __fg = null;
async function renderGrafoVivo() {
  const container = document.getElementById('grafoVivoContainer');
  const loading = document.getElementById('grafoVivoLoading');
  const tag = document.getElementById('grafoTag');
  if (!container) return;

  // Carrega force-graph sob demanda (canvas, partículas nativas)
  if (typeof ForceGraph === 'undefined') {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/force-graph@1.43.5/dist/force-graph.min.js';
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    }).catch(() => { tag.textContent = 'lib offline'; });
    if (typeof ForceGraph === 'undefined') { tag.textContent = 'lib offline'; return; }
  }

  // Puxa dados
  let raw;
  try {
    const res = await fetch('./graph-data.json?t=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    raw = await res.json();
  } catch (e) {
    if (loading) loading.textContent = '⚠️ graph-data.json ainda não gerado';
    tag.textContent = 'sem dados';
    return;
  }

  if (loading) loading.style.display = 'none';
  tag.textContent = `${raw.nodes?.length ?? 0} nós · ${raw.edges?.length ?? 0} arestas`;

  const colorByType = {
    orquestrador: '#10b981', bot: '#f59e0b', gateway: '#8b5cf6',
    servico: '#3b82f6', storage: '#6b7280', monitoramento: '#ec4899',
    ia: '#10b981', default: '#94a3b8'
  };

  // Formato force-graph: { nodes: [{id,...}], links: [{source, target, value}] }
  const gdata = {
    nodes: (raw.nodes || []).map(n => ({
      id: n.id,
      label: n.label || n.id,
      type: n.type || 'default',
      color: colorByType[n.type] || colorByType.default
    })),
    links: (raw.edges || []).map(e => ({
      source: e.from, target: e.to, label: e.label || '', value: e.weight || 1
    }))
  };

  // Atualização incremental (não recria — evita "pular")
  if (__fg) {
    __fg.graphData(gdata);
    return;
  }

  const width = container.clientWidth;
  const height = container.clientHeight || 520;

  __fg = ForceGraph()(container)
    .width(width)
    .height(height)
    .backgroundColor('#0a0d12')
    .graphData(gdata)
    .nodeId('id')
    .nodeLabel(n => `${n.label} · ${n.type}`)
    .nodeVal(n => Math.max(4, (n.type === 'orquestrador' ? 12 : 6)))
    .nodeColor(n => n.color)
    .nodeCanvasObjectMode(() => 'after')
    .nodeCanvasObject((node, ctx, globalScale) => {
      const label = node.label;
      const fontSize = Math.max(10 / globalScale, 3);
      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = 'rgba(230,233,239,.9)';
      ctx.fillText(label, node.x, node.y + 9);
    })
    .linkColor(() => 'rgba(148,163,184,.25)')
    .linkWidth(l => Math.min(3, 0.5 + l.value * 0.3))
    .linkDirectionalParticles(l => Math.min(4, Math.ceil(l.value / 2)))
    .linkDirectionalParticleSpeed(l => 0.003 + l.value * 0.0008)
    .linkDirectionalParticleColor(() => '#10b981')
    .linkDirectionalParticleWidth(2)
    .cooldownTicks(120)
    .d3AlphaDecay(0.03)
    .d3VelocityDecay(0.35);

  // Ajuste de repulsão pra evitar bola-de-fios
  if (__fg.d3Force && __fg.d3Force('charge')) {
    __fg.d3Force('charge').strength(-140);
  }

  // Redimensiona junto com container
  window.addEventListener('resize', () => {
    if (__fg && container) {
      __fg.width(container.clientWidth).height(container.clientHeight || 520);
    }
  });
}


refresh();
