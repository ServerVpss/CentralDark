import { readPatternLibrary } from '../../../../scripts/memory-linker/pattern-library.mjs';

export const PATTERN_ADMIN_STYLE = `
.pattern-head{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
.pattern-kpi{background:linear-gradient(135deg,var(--surf),var(--surf2));border:1px solid var(--border);border-radius:12px;padding:14px}
.pattern-kpi .n{font-size:24px;font-weight:800;color:var(--em2);margin-top:4px}.pattern-kpi .t{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.6px}
.pattern-toolbar{display:flex;gap:8px;align-items:center;margin-bottom:16px;flex-wrap:wrap}
.pattern-toolbar input{flex:1;min-width:240px;background:var(--bg2);border:1px solid var(--border);color:var(--text);padding:10px 12px;border-radius:9px;font:inherit}
.pattern-office{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.pattern-drawer{background:var(--surf);border:1px solid var(--border);border-radius:14px;overflow:hidden}
.pattern-drawer-head{padding:15px 18px;background:linear-gradient(135deg,rgba(16,185,129,.12),rgba(52,211,153,.03));border-bottom:1px solid var(--border)}
.pattern-drawer-title{display:flex;justify-content:space-between;gap:10px;align-items:center}.pattern-drawer-title b{color:var(--em2);font-size:14px}.pattern-count{font-size:11px;color:var(--muted)}
.pattern-purpose{font-size:12px;color:var(--muted);margin-top:5px}
.pattern-list{padding:10px}.pattern-empty{padding:18px;color:var(--muted);font-size:12px;text-align:center}
.pattern-item{border:1px solid rgba(15,89,81,.75);border-radius:10px;margin:8px 0;background:rgba(3,31,29,.35)}
.pattern-item summary{list-style:none;cursor:pointer;padding:12px 13px;display:flex;gap:10px;justify-content:space-between;align-items:flex-start}.pattern-item summary::-webkit-details-marker{display:none}
.pattern-item summary:hover{background:rgba(16,185,129,.05)}
.pattern-item-title{font-size:13px;font-weight:700;line-height:1.35}.pattern-item-meta{font-size:10.5px;color:var(--muted);margin-top:5px}
.pattern-status{font-size:10px;padding:3px 7px;border-radius:99px;border:1px solid var(--border);white-space:nowrap;color:var(--muted)}
.pattern-status.ready{color:var(--em2);border-color:rgba(52,211,153,.45);background:rgba(16,185,129,.12)}
.pattern-status.quarantine{color:var(--warn);border-color:rgba(251,191,36,.4);background:rgba(251,191,36,.08)}
.pattern-body{padding:0 13px 13px;border-top:1px dashed rgba(15,89,81,.6);font-size:12px}.pattern-section{margin-top:10px}.pattern-section strong{color:var(--em2);display:block;margin-bottom:4px;font-size:11px;text-transform:uppercase;letter-spacing:.4px}
.pattern-section ul{margin:4px 0 0 18px;padding:0;color:var(--text)}.pattern-target{font-family:ui-monospace,monospace;color:#c8f5eb;overflow-wrap:anywhere}.pattern-tokens{display:flex;flex-wrap:wrap;gap:4px;margin-top:5px}.pattern-token{font-size:10px;color:var(--muted);border:1px solid var(--border);border-radius:6px;padding:2px 6px}
.pattern-note{font-size:11px;color:var(--muted);margin:10px 0 0}
@media(max-width:900px){.pattern-office{grid-template-columns:1fr}.pattern-head{grid-template-columns:1fr 1fr}}
`;

export const PATTERN_ADMIN_TAB = `<div class="tab" data-p="patterns">Padrões</div>`;

export const PATTERN_ADMIN_PANE = `
  <div class="pane" id="p-patterns">
    <div class="pattern-head">
      <div class="pattern-kpi"><div class="t">Padrões recorrentes</div><div class="n" id="patternKpiPatterns">0</div></div>
      <div class="pattern-kpi"><div class="t">Aprendizados em observação</div><div class="n" id="patternKpiCandidates">0</div></div>
      <div class="pattern-kpi"><div class="t">Sessões lembradas</div><div class="n" id="patternKpiSessions">0</div></div>
      <div class="pattern-kpi"><div class="t">Fontes</div><div class="n" id="patternKpiSources">0</div></div>
    </div>
    <div class="card" style="margin-bottom:16px">
      <h2>🗄️ Escritório de padrões <span class="badge" id="patternState">carregando…</span></h2>
      <p style="color:var(--muted);font-size:12px;margin:0 0 12px">
        Cada gaveta guarda aprendizado destilado por função. Candidato continua candidato; recorrência não vira prova sozinha.
      </p>
      <div class="pattern-toolbar">
        <input id="patternSearch" placeholder="buscar padrão, uso, owner, palavra…" oninput="renderPatternOffice()"/>
        <button class="btn ghost" onclick="location.reload()">🔄 Atualizar biblioteca</button>
      </div>
      <div id="patternOffice" class="pattern-office"></div>
      <div class="pattern-note">A biblioteca não guarda conversa crua nem raciocínio privado. Ela mostra somente o aprendizado sanitizado que chegou ao Memory Linker.</div>
    </div>
  </div>
`;

export const PATTERN_ADMIN_SCRIPT = `
const PATTERN_LIBRARY = __PATTERN_LIBRARY_JSON__;
function patternStatusLabel(status){
  const labels = {
    READY_FOR_REVALIDATION:'pronto p/ revalidar',
    PATTERN_CANDIDATE:'padrão candidato',
    OBSERVING:'em observação',
    QUARANTINE:'quarentena',
    IN_RECURRING_PATTERN:'absorvido no padrão'
  };
  return labels[status] || String(status || 'unknown').toLowerCase();
}
function patternStatusClass(status){
  if (status === 'READY_FOR_REVALIDATION') return 'ready';
  if (status === 'QUARANTINE') return 'quarantine';
  return '';
}
function addText(parent, tag, className, text){
  const el = document.createElement(tag); if(className) el.className = className; el.textContent = text ?? ''; parent.appendChild(el); return el;
}
function addListSection(parent, title, values){
  if(!Array.isArray(values) || !values.length) return;
  const box = addText(parent,'div','pattern-section',''); addText(box,'strong','',title);
  const ul = document.createElement('ul'); box.appendChild(ul);
  for(const value of values){ addText(ul,'li','',value); }
}
function renderPatternItem(item){
  const details = document.createElement('details'); details.className='pattern-item';
  const summary = document.createElement('summary'); details.appendChild(summary);
  const left = document.createElement('div'); summary.appendChild(left);
  addText(left,'div','pattern-item-title',item.title || item.id);
  addText(left,'div','pattern-item-meta',(item.session_count||0)+' sessão(ões) · '+(item.source_count||0)+' fonte(s) · '+(item.candidate_count||0)+' ocorrência(s) agrupada(s)');
  addText(summary,'span','pattern-status '+patternStatusClass(item.status),patternStatusLabel(item.status));
  const body = document.createElement('div'); body.className='pattern-body'; details.appendChild(body);
  addListSection(body,'O que aprendeu',item.what_was_learned);
  addListSection(body,'Como usar',item.how_to_use);
  const target = addText(body,'div','pattern-section',''); addText(target,'strong','','Onde entra'); addText(target,'div','pattern-target',item.target || 'UNKNOWN');
  if(Array.isArray(item.shared_tokens) && item.shared_tokens.length){
    const tokenSection = addText(body,'div','pattern-section',''); addText(tokenSection,'strong','','Sinais do padrão');
    const tokens = addText(tokenSection,'div','pattern-tokens','');
    for(const token of item.shared_tokens.slice(0,14)) addText(tokens,'span','pattern-token',token);
  }
  const evidence = addText(body,'div','pattern-section',''); addText(evidence,'strong','','Prova / alcance');
  addText(evidence,'div','', 'owner verificado: '+(item.verified_owner_evidence_count||0)+' · consumidor verificado: '+(item.verified_consumer_evidence_count||0)+' · padrão é prova? NÃO');
  if(item.last_seen) addText(body,'div','pattern-item-meta','última ocorrência: '+dataHoraBr(item.last_seen));
  return details;
}
function renderPatternOffice(){
  $('patternKpiPatterns').textContent = PATTERN_LIBRARY.pattern_count || 0;
  $('patternKpiCandidates').textContent = Math.max(0,(PATTERN_LIBRARY.candidate_count||0)-(PATTERN_LIBRARY.patterns||[]).reduce((n,p)=>n+(p.candidate_count||0),0));
  $('patternKpiSessions').textContent = PATTERN_LIBRARY.session_count || 0;
  $('patternKpiSources').textContent = PATTERN_LIBRARY.source_count || 0;
  $('patternState').textContent = PATTERN_LIBRARY.status || 'EMPTY';
  const query = String($('patternSearch')?.value || '').trim().toLowerCase();
  const office = $('patternOffice'); office.innerHTML='';
  for(const drawer of PATTERN_LIBRARY.drawers || []){
    const visible = (drawer.items || []).filter(item => !query || [item.title,item.target,item.status,...(item.what_was_learned||[]),...(item.how_to_use||[]),...(item.shared_tokens||[])].join(' ').toLowerCase().includes(query));
    if(query && visible.length===0) continue;
    const box = addText(office,'section','pattern-drawer','');
    const head = addText(box,'div','pattern-drawer-head','');
    const title = addText(head,'div','pattern-drawer-title',''); addText(title,'b','',drawer.label || drawer.kind); addText(title,'span','pattern-count',(drawer.pattern_count||0)+' padrão(ões) · '+(drawer.candidate_count||0)+' observando');
    addText(head,'div','pattern-purpose',drawer.purpose || '');
    const list = addText(box,'div','pattern-list','');
    if(!visible.length) addText(list,'div','pattern-empty','gaveta vazia por enquanto');
    else for(const item of visible) list.appendChild(renderPatternItem(item));
  }
  if(!office.childNodes.length) addText(office,'div','pattern-empty',query ? 'nenhuma gaveta bateu com a busca' : 'nenhum aprendizado destilado ainda');
}
renderPatternOffice();
`;

function safeJsonForScript(value) {
  return JSON.stringify(value)
    .replace(/&/g, '\\u0026')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function emptyAdminLibrary(error = null) {
  return {
    schema_version: 1,
    mode: 'PATTERN_LIBRARY_LONGITUDINAL',
    status: error ? 'UNAVAILABLE' : 'EMPTY',
    head_sha: null,
    updated_at: null,
    candidate_count: 0,
    pattern_count: 0,
    session_count: 0,
    source_count: 0,
    private_reasoning_included: false,
    raw_session_content_included: false,
    candidates: [],
    patterns: [],
    drawers: [],
    ...(error ? { error } : {}),
  };
}

export function injectPatternAdmin(html) {
  let library;
  try {
    library = readPatternLibrary();
  } catch (error) {
    library = emptyAdminLibrary(String(error?.message || error));
  }
  return String(html)
    .replace('__PATTERN_ADMIN_STYLE__', PATTERN_ADMIN_STYLE)
    .replace('__PATTERN_ADMIN_TAB__', PATTERN_ADMIN_TAB)
    .replace('__PATTERN_ADMIN_PANE__', PATTERN_ADMIN_PANE)
    .replace('__PATTERN_ADMIN_SCRIPT__', PATTERN_ADMIN_SCRIPT)
    .replace('__PATTERN_LIBRARY_JSON__', safeJsonForScript(library));
}
