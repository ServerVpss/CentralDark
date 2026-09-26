import { readFileSync } from 'node:fs';
import { readPatternLibrary } from '../../../../scripts/memory-linker/pattern-library.mjs';

const ADMIN_REGISTRY_URL = new URL('../../../../docs/CONSCIENCIA/ADMINISTRAVEIS.json', import.meta.url);

export const PATTERN_ADMIN_STYLE = `
.pattern-head{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
.pattern-kpi{background:linear-gradient(135deg,var(--surf),var(--surf2));border:1px solid var(--border);border-radius:12px;padding:14px}
.pattern-kpi .n{font-size:24px;font-weight:800;color:var(--em2);margin-top:4px}.pattern-kpi .t{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.6px}
.pattern-toolbar,.admin-toolbar{display:flex;gap:8px;align-items:center;margin-bottom:16px;flex-wrap:wrap}
.pattern-toolbar input,.admin-toolbar input{flex:1;min-width:240px;background:var(--bg2);border:1px solid var(--border);color:var(--text);padding:10px 12px;border-radius:9px;font:inherit}
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
.admin-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
.admin-kpi{background:linear-gradient(135deg,var(--surf),var(--surf2));border:1px solid var(--border);border-radius:12px;padding:14px}.admin-kpi .t{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.6px}.admin-kpi .n{font-size:24px;font-weight:800;color:var(--em2);margin-top:4px}
.admin-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.admin-card{background:var(--surf);border:1px solid var(--border);border-radius:14px;padding:17px;position:relative;overflow:hidden}.admin-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--em),var(--em2))}
.admin-card-head{display:flex;gap:12px;align-items:flex-start;justify-content:space-between}.admin-title-wrap{display:flex;gap:10px;align-items:flex-start}.admin-glyph{font-size:25px;line-height:1}.admin-title{font-size:16px;font-weight:800;color:var(--text)}.admin-sub{font-size:11px;color:var(--muted);margin-top:3px}.admin-status{font-size:10px;color:var(--em2);border:1px solid rgba(52,211,153,.4);background:rgba(16,185,129,.1);padding:4px 8px;border-radius:99px;white-space:nowrap}
.admin-purpose{font-size:12px;color:var(--muted);margin:12px 0}.admin-command{display:flex;gap:8px;align-items:center;background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:10px 12px;font-family:ui-monospace,'SF Mono',monospace;color:#c8f5eb}.admin-command code{flex:1;overflow-wrap:anywhere}.admin-mini-btn{border:1px solid var(--border2);background:transparent;color:var(--em2);border-radius:8px;padding:6px 8px;cursor:pointer;font:inherit}.admin-mini-btn:hover{background:rgba(16,185,129,.08)}
.admin-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.admin-action{border:1px solid var(--border2);background:transparent;color:var(--em2);border-radius:8px;padding:7px 10px;cursor:pointer;font-size:11px;font-weight:700;text-decoration:none}.admin-action:hover{background:rgba(16,185,129,.08)}
.admin-details{margin-top:12px;border-top:1px dashed rgba(15,89,81,.65);padding-top:10px}.admin-details summary{cursor:pointer;color:var(--em2);font-size:12px;font-weight:700}.admin-flow{margin:8px 0 0 18px;padding:0;font-size:11px;color:var(--text)}.admin-aliases{font-size:10.5px;color:var(--muted);margin-top:6px}.admin-help{font-size:11px;line-height:1.5;color:var(--muted);margin-top:9px}.admin-owner{font-family:ui-monospace,monospace;color:#c8f5eb;font-size:10.5px;overflow-wrap:anywhere;margin-top:9px}
.compass-shell{margin-top:14px;padding:13px;background:radial-gradient(circle at center,rgba(16,185,129,.10),rgba(3,31,29,.35));border:1px solid var(--border);border-radius:13px}.compass-title{font-size:11px;color:var(--em2);font-weight:800;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px}.compass-grid{display:grid;grid-template-columns:repeat(3,54px);grid-template-rows:repeat(3,48px);gap:5px;justify-content:center}.compass-axis{border:1px solid var(--border2);border-radius:10px;background:rgba(3,31,29,.65);color:var(--text);font-size:22px;font-weight:800;cursor:pointer}.compass-axis:hover,.compass-axis[aria-pressed='true']{background:rgba(16,185,129,.18);color:var(--em2);box-shadow:0 0 0 1px rgba(52,211,153,.25)}.compass-center{color:var(--warn)}.compass-round{display:flex;justify-content:center;margin-top:7px}.compass-explain{min-height:44px;margin-top:10px;padding:9px 10px;background:var(--bg2);border-radius:8px;font-size:11px;color:var(--muted);line-height:1.45}.compass-explain b{color:var(--em2)}
.admin-compasses{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px}.admin-chip{font-size:10px;color:var(--muted);border:1px solid var(--border);border-radius:99px;padding:3px 7px}.admin-buttons-explain{display:grid;gap:5px;margin-top:8px}.admin-button-explain{font-size:10.5px;color:var(--muted);padding:6px 8px;border:1px solid rgba(15,89,81,.6);border-radius:7px}.admin-button-explain b{color:var(--text)}
.admin-toast{position:fixed;right:20px;bottom:20px;z-index:99;background:var(--surf2);border:1px solid var(--border2);color:var(--text);padding:10px 14px;border-radius:10px;box-shadow:0 16px 40px rgba(0,0,0,.35);font-size:12px;display:none}.admin-toast.show{display:block}.admin-hidden-note{font-size:11px;color:var(--muted)}
@media(max-width:900px){.pattern-office,.admin-grid{grid-template-columns:1fr}.pattern-head,.admin-kpis{grid-template-columns:1fr 1fr}}
`;

export const PATTERN_ADMIN_TAB = `<div class="tab" data-p="patterns">Padrões</div><div class="tab" data-p="commands">Comandos</div>`;

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

  <div class="pane" id="p-commands">
    <div class="admin-kpis">
      <div class="admin-kpi"><div class="t">Administráveis</div><div class="n" id="adminKpiTotal">0</div></div>
      <div class="admin-kpi"><div class="t">Comandos</div><div class="n" id="adminKpiCommands">0</div></div>
      <div class="admin-kpi"><div class="t">Ocultos locais</div><div class="n" id="adminKpiHidden">0</div></div>
      <div class="admin-kpi"><div class="t">Registro</div><div class="n" id="adminKpiStatus" style="font-size:16px">—</div></div>
    </div>
    <div class="card" style="margin-bottom:16px">
      <h2>🧭 Central de Comandos <span class="badge">controle do CHEFE</span></h2>
      <p style="color:var(--muted);font-size:12px;margin:0 0 12px">
        O painel lê o registro canônico de administráveis. Ficha visual não vira autoridade: editar comportamento oficial continua no owner canônico.
      </p>
      <div class="admin-toolbar">
        <input id="adminSearch" placeholder="buscar comando, função, alias, owner…" oninput="renderAdminControls()"/>
        <button class="btn ghost" id="adminShowHidden" type="button" onclick="toggleAdminShowHidden()">👁 Mostrar ocultos</button>
        <button class="btn ghost" type="button" onclick="location.reload()">🔄 Atualizar registro</button>
      </div>
      <div id="adminGrid" class="admin-grid"></div>
      <div class="pattern-note">Regra: PROVEN_ADMINISTRABLE → registrar em <code>docs/CONSCIENCIA/ADMINISTRAVEIS.json</code> → esta aba renderiza automaticamente.</div>
    </div>
  </div>
  <div id="adminToast" class="admin-toast" role="status" aria-live="polite"></div>
`;

export const PATTERN_ADMIN_SCRIPT = `
const PATTERN_LIBRARY = __PATTERN_LIBRARY_JSON__;
const ADMIN_REGISTRY = __ADMIN_REGISTRY_JSON__;
const ADMIN_HIDDEN_KEY = 'centraldark-admin-hidden-v1';
let ADMIN_SHOW_HIDDEN = false;

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

function adminHiddenIds(){
  try { return new Set(JSON.parse(localStorage.getItem(ADMIN_HIDDEN_KEY) || '[]')); }
  catch { return new Set(); }
}
function saveAdminHidden(set){ localStorage.setItem(ADMIN_HIDDEN_KEY, JSON.stringify([...set])); }
function adminToast(message){
  const el=$('adminToast'); if(!el) return; el.textContent=message; el.classList.add('show');
  clearTimeout(adminToast._timer); adminToast._timer=setTimeout(()=>el.classList.remove('show'),1800);
}
async function copyAdminCommand(command){
  try { await navigator.clipboard.writeText(command); adminToast('Gatilho copiado: '+command); }
  catch {
    const t=document.createElement('textarea'); t.value=command; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); adminToast('Gatilho copiado: '+command);
  }
}
function adminEditUrl(owner){
  const safe=String(owner||'').split('/').filter(Boolean).map(encodeURIComponent).join('/');
  return 'https://github.com/ServerVpss/CentralDark/edit/main/'+safe;
}
function hideAdminCard(id){ const set=adminHiddenIds(); set.add(id); saveAdminHidden(set); renderAdminControls(); adminToast('Ficha ocultada só neste navegador.'); }
function restoreAdminCard(id){ const set=adminHiddenIds(); set.delete(id); saveAdminHidden(set); renderAdminControls(); adminToast('Ficha restaurada.'); }
function toggleAdminShowHidden(){ ADMIN_SHOW_HIDDEN=!ADMIN_SHOW_HIDDEN; const btn=$('adminShowHidden'); if(btn) btn.textContent=ADMIN_SHOW_HIDDEN?'🙈 Esconder ocultos':'👁 Mostrar ocultos'; renderAdminControls(); }
function selectCompassAxis(cardId,index){
  const item=(ADMIN_REGISTRY.items||[]).find(x=>x.id===cardId); if(!item || !Array.isArray(item.directions)) return;
  const direction=item.directions[index]; const box=$('compassExplain-'+cardId); if(box) box.innerHTML='<b>'+escapeHtml(direction.symbol+' '+direction.name)+'</b><br>'+escapeHtml(direction.description||'');
  document.querySelectorAll('[data-compass-card="'+CSS.escape(cardId)+'"]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
}
function escapeHtml(value){ return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function renderCompass(parent,item){
  if(!Array.isArray(item.directions) || !item.directions.length) return;
  const bySymbol=new Map(item.directions.map((d,i)=>[d.symbol,{d,i}]));
  const shell=addText(parent,'div','compass-shell',''); addText(shell,'div','compass-title','Multibússola · toque numa direção');
  const grid=addText(shell,'div','compass-grid','');
  for(const symbol of ['↖','↑','↗','←','✣','→','↙','↓','↘']){
    const entry=bySymbol.get(symbol); const b=document.createElement('button'); b.type='button'; b.className='compass-axis'+(symbol==='✣'?' compass-center':''); b.textContent=symbol; b.setAttribute('aria-label',entry?entry.d.name:symbol); b.setAttribute('aria-pressed','false');
    if(entry){ b.dataset.compassCard=item.id; b.onclick=()=>selectCompassAxis(item.id,entry.i); }
    else b.disabled=true;
    grid.appendChild(b);
  }
  const round=addText(shell,'div','compass-round',''); const rt=bySymbol.get('↔');
  if(rt){ const b=document.createElement('button'); b.type='button'; b.className='compass-axis'; b.style.width='172px'; b.textContent='↔ CONTRAMÃO'; b.dataset.compassCard=item.id; b.setAttribute('aria-label',rt.d.name); b.setAttribute('aria-pressed','false'); b.onclick=()=>selectCompassAxis(item.id,rt.i); round.appendChild(b); }
  const explain=addText(shell,'div','compass-explain','Toque em uma seta para ver o que ela mede.'); explain.id='compassExplain-'+item.id;
  if(Array.isArray(item.compasses)&&item.compasses.length){ const chips=addText(shell,'div','admin-compasses',''); for(const c of item.compasses) addText(chips,'span','admin-chip','🧭 '+c); }
}
function renderAdminCard(item, hidden){
  const card=addText(document.createDocumentFragment(),'article','admin-card','');
  const head=addText(card,'div','admin-card-head',''); const wrap=addText(head,'div','admin-title-wrap',''); addText(wrap,'div','admin-glyph',item.glyph||'⚙️');
  const titleBox=addText(wrap,'div','',''); addText(titleBox,'div','admin-title',item.title||item.id); addText(titleBox,'div','admin-sub',(item.kind||'item')+' · '+(item.id||'')); addText(head,'span','admin-status',hidden?'OCULTO LOCAL':(item.status||'UNKNOWN'));
  addText(card,'div','admin-purpose',item.purpose||'');
  const cmd=addText(card,'div','admin-command',''); addText(cmd,'code','',item.command||'SEM_GATILHO'); const copy=document.createElement('button'); copy.type='button'; copy.className='admin-mini-btn'; copy.textContent='📋'; copy.setAttribute('aria-label','Copiar gatilho '+(item.command||'')); copy.onclick=()=>copyAdminCommand(item.command||''); cmd.appendChild(copy);
  if(Array.isArray(item.aliases)&&item.aliases.length) addText(card,'div','admin-aliases','Aliases: '+item.aliases.join(' · '));
  addText(card,'div','admin-help','Como engatilha: '+(item.trigger_help||'não documentado'));
  addText(card,'div','admin-owner','Owner: '+(item.owner||'UNKNOWN'));
  renderCompass(card,item);
  const actions=addText(card,'div','admin-actions','');
  const copyAction=addText(actions,'button','admin-action','📋 Copiar gatilho'); copyAction.type='button'; copyAction.onclick=()=>copyAdminCommand(item.command||'');
  const edit=document.createElement('a'); edit.className='admin-action'; edit.textContent='✏️ Editar oficial'; edit.href=adminEditUrl(item.owner); edit.target='_blank'; edit.rel='noopener noreferrer'; actions.appendChild(edit);
  const hide=addText(actions,'button','admin-action',hidden?'↩️ Restaurar visual':'🧽 Ocultar ficha'); hide.type='button'; hide.onclick=()=>hidden?restoreAdminCard(item.id):hideAdminCard(item.id);
  const details=document.createElement('details'); details.className='admin-details'; card.appendChild(details); const summary=document.createElement('summary'); summary.textContent='Como funciona / o que cada botão faz'; details.appendChild(summary);
  if(Array.isArray(item.flow)&&item.flow.length){ const ol=document.createElement('ol'); ol.className='admin-flow'; for(const step of item.flow) addText(ol,'li','',step); details.appendChild(ol); }
  if(Array.isArray(item.buttons)&&item.buttons.length){ const box=addText(details,'div','admin-buttons-explain',''); for(const b of item.buttons){ const row=addText(box,'div','admin-button-explain',''); row.innerHTML='<b>'+escapeHtml((b.icon||'')+' '+(b.label||b.id))+'</b> — '+escapeHtml(b.effect||''); } }
  return card;
}
function renderAdminControls(){
  const items=Array.isArray(ADMIN_REGISTRY.items)?ADMIN_REGISTRY.items.filter(x=>x&&x.administrable!==false):[]; const hidden=adminHiddenIds();
  $('adminKpiTotal').textContent=items.length; $('adminKpiCommands').textContent=items.filter(x=>x.kind==='command').length; $('adminKpiHidden').textContent=hidden.size; $('adminKpiStatus').textContent=ADMIN_REGISTRY.status||'UNKNOWN';
  const query=String($('adminSearch')?.value||'').trim().toLowerCase(); const grid=$('adminGrid'); grid.innerHTML='';
  const visible=items.filter(item=>{ const isHidden=hidden.has(item.id); if(isHidden&&!ADMIN_SHOW_HIDDEN) return false; const hay=[item.id,item.title,item.command,item.owner,item.purpose,item.trigger_help,...(item.aliases||[]),...(item.compasses||[])].join(' ').toLowerCase(); return !query||hay.includes(query); });
  for(const item of visible) grid.appendChild(renderAdminCard(item,hidden.has(item.id)));
  if(!visible.length){ const empty=addText(grid,'div','pattern-empty',query?'nenhum administrável bateu com a busca':(hidden.size&&!ADMIN_SHOW_HIDDEN?'todas as fichas estão ocultas neste navegador':'nenhum administrável registrado')); empty.style.gridColumn='1/-1'; }
}
renderPatternOffice();
renderAdminControls();
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

function emptyAdministrables(error = null) {
  return {
    schema_version: 1,
    status: error ? 'UNAVAILABLE' : 'EMPTY',
    owner: 'docs/CONSCIENCIA/ADMINISTRAVEIS.md',
    items: [],
    ...(error ? { error } : {}),
  };
}

function readAdministrables() {
  try {
    const parsed = JSON.parse(readFileSync(ADMIN_REGISTRY_URL, 'utf8'));
    if (!parsed || !Array.isArray(parsed.items)) throw new Error('ADMIN_REGISTRY_ITEMS_INVALID');
    return parsed;
  } catch (error) {
    return emptyAdministrables(String(error?.message || error));
  }
}

export function injectPatternAdmin(html) {
  let library;
  try {
    library = readPatternLibrary();
  } catch (error) {
    library = emptyAdminLibrary(String(error?.message || error));
  }
  const administrables = readAdministrables();
  return String(html)
    .replace('__PATTERN_ADMIN_STYLE__', PATTERN_ADMIN_STYLE)
    .replace('__PATTERN_ADMIN_TAB__', PATTERN_ADMIN_TAB)
    .replace('__PATTERN_ADMIN_PANE__', PATTERN_ADMIN_PANE)
    .replace('__PATTERN_ADMIN_SCRIPT__', PATTERN_ADMIN_SCRIPT)
    .replace('__PATTERN_LIBRARY_JSON__', safeJsonForScript(library))
    .replace('__ADMIN_REGISTRY_JSON__', safeJsonForScript(administrables));
}
