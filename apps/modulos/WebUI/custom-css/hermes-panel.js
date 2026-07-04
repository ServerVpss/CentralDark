/* ═══════════════════════════════════════════════════════════════
   Cadeia Hermes + Auditoria — Painel embutido no Open WebUI
   Cole no admin: Settings → Interface → Custom JS
   Requer: hermes-panel.css carregado no Custom CSS.
   API: https://api.centralldark.com/hermes/*
   ═══════════════════════════════════════════════════════════════ */
(function () {
  if (window.__hermesPainelBoot) return;
  window.__hermesPainelBoot = true;

  const API = 'https://api.centralldark.com';
  const TOKEN_KEY = 'hermes_api_token';

  function getToken() {
    let t = localStorage.getItem(TOKEN_KEY);
    if (!t) {
      t = prompt('Token da API CentralDark (fica salvo no navegador):');
      if (t) localStorage.setItem(TOKEN_KEY, t.trim());
    }
    return t;
  }

  function toast(msg, isErr) {
    let el = document.getElementById('hermes-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'hermes-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.className = 'show' + (isErr ? ' err' : '');
    clearTimeout(el._t);
    el._t = setTimeout(() => (el.className = ''), 2600);
  }

  async function api(path, opts = {}) {
    const t = getToken();
    const r = await fetch(API + path, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + t,
        ...(opts.headers || {}),
      },
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }

  // ═══════════════════════════ Aba Cadeia ═══════════════════════════
  let cadeia = [];

  function renderCadeia() {
    const body = document.querySelector('#hermes-modal .tab-cadeia');
    body.innerHTML = '';
    cadeia.forEach((m, i) => {
      const row = document.createElement('div');
      row.className = 'row ' + (m.ativo ? 'on' : 'off');
      row.innerHTML = `
        <div class="pos">${i + 1}</div>
        <div class="mod">${m.modelo}<small>${m.via || ''} · ${m.nota || ''}</small></div>
        <input type="number" min="5" max="180" value="${m.timeout_s}" />
        <div class="arrows"><button data-up>▲</button><button data-dn>▼</button></div>
        <div class="toggle"></div>
      `;
      row.querySelector('input').oninput = (e) => (m.timeout_s = parseInt(e.target.value) || 15);
      row.querySelector('.toggle').onclick = () => { m.ativo = !m.ativo; renderCadeia(); };
      row.querySelector('[data-up]').onclick = () => { if (i > 0) { [cadeia[i-1], cadeia[i]] = [cadeia[i], cadeia[i-1]]; renderCadeia(); } };
      row.querySelector('[data-dn]').onclick = () => { if (i < cadeia.length - 1) { [cadeia[i+1], cadeia[i]] = [cadeia[i], cadeia[i+1]]; renderCadeia(); } };
      body.appendChild(row);
    });
  }

  async function loadCadeia() {
    try {
      const j = await api('/hermes/cadeia');
      cadeia = (j.cadeia || []).map((m, i) => ({ ...m, posicao: i + 1 }));
      renderCadeia();
    } catch (e) { toast('Erro ao carregar: ' + e.message, true); }
  }

  async function saveCadeia() {
    try {
      cadeia.forEach((m, i) => (m.posicao = i + 1));
      await api('/hermes/cadeia', { method: 'PUT', body: JSON.stringify({ cadeia }) });
      toast('Cadeia salva ✓');
    } catch (e) { toast('Erro ao salvar: ' + e.message, true); }
  }

  async function revertCadeia() {
    if (!confirm('Reverter para o backup anterior?')) return;
    try {
      await api('/hermes/cadeia/reverter', { method: 'POST' });
      toast('Revertido ✓');
      loadCadeia();
    } catch (e) { toast('Erro: ' + e.message, true); }
  }

  // ═══════════════════════════ Aba Auditoria ═══════════════════════════
  let auditRefresh = null;
  let auditFiltroStatus = '';
  let auditDiaAtual = '';

  function fmtHora(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('pt-BR', { hour12: false });
    } catch { return iso; }
  }

  function fmtDur(ms) {
    if (ms == null) return '—';
    if (ms < 1000) return ms + 'ms';
    return (ms / 1000).toFixed(1) + 's';
  }

  function badgeStatus(s) {
    const cls = ({
      OK: 'ok', FALHOU: 'err', TIMEOUT: 'warn',
      BLOQUEADO: 'blk', BLOQUEADO_CONFIG: 'blk',
      ERRO_SPAWN: 'err', DRY_RUN: 'info', EXECUTADO: 'ok', ERRO_CWD: 'err',
    })[s] || 'info';
    return `<span class="badge ${cls}">${s || '?'}</span>`;
  }

  async function loadAuditStats() {
    try {
      const s = await api('/hermes/audit/stats?dias=1');
      const box = document.querySelector('#hermes-modal .audit-cards');
      const st = s.por_status || {};
      box.innerHTML = `
        <div class="card ok"><div class="n">${st.OK || 0}</div><div class="l">OK hoje</div></div>
        <div class="card err"><div class="n">${(st.FALHOU || 0) + (st.ERRO_SPAWN || 0)}</div><div class="l">Falhas</div></div>
        <div class="card blk"><div class="n">${(st.BLOQUEADO || 0) + (st.BLOQUEADO_CONFIG || 0)}</div><div class="l">Bloqueados</div></div>
        <div class="card info"><div class="n">${s.total || 0}</div><div class="l">Total</div></div>
      `;
    } catch (e) { /* silencioso */ }
  }

  async function loadAuditDias() {
    try {
      const j = await api('/hermes/audit/dias');
      const sel = document.querySelector('#hermes-modal .audit-dia');
      const atual = auditDiaAtual || (j.dias[0]?.dia || new Date().toISOString().slice(0, 10));
      auditDiaAtual = atual;
      sel.innerHTML = j.dias.map(d => `<option value="${d.dia}" ${d.dia === atual ? 'selected' : ''}>${d.dia}</option>`).join('') ||
        `<option value="${atual}">${atual}</option>`;
    } catch (e) { /* silencioso */ }
  }

  async function loadAuditItens() {
    try {
      const qs = new URLSearchParams({ date: auditDiaAtual, limit: '200' });
      if (auditFiltroStatus) qs.set('status', auditFiltroStatus);
      const j = await api('/hermes/audit?' + qs.toString());
      const tbody = document.querySelector('#hermes-modal .audit-tbody');
      if (!j.itens.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty">Sem registros neste filtro.</td></tr>`;
        return;
      }
      tbody.innerHTML = j.itens.map(r => `
        <tr>
          <td>${fmtHora(r.timestamp)}</td>
          <td>${r.usuario || '?'}</td>
          <td>${r.ip || '?'}</td>
          <td>${r.tool || '?'}</td>
          <td class="cmd" title="${(r.command || '').replace(/"/g, '&quot;')}">${(r.command || '').slice(0, 60)}</td>
          <td>${badgeStatus(r.status)}</td>
          <td>${fmtDur(r.durationMs)}</td>
        </tr>
      `).join('');
    } catch (e) { toast('Erro auditoria: ' + e.message, true); }
  }

  async function loadAuditAll() {
    await loadAuditDias();
    await Promise.all([loadAuditStats(), loadAuditItens()]);
  }

  function startAuditAutoRefresh() {
    stopAuditAutoRefresh();
    auditRefresh = setInterval(loadAuditItens, 10_000);
  }
  function stopAuditAutoRefresh() {
    if (auditRefresh) { clearInterval(auditRefresh); auditRefresh = null; }
  }

  // ═══════════════════════════ Abas ═══════════════════════════
  function switchTab(nome) {
    const modal = document.querySelector('#hermes-modal');
    modal.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === nome));
    modal.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.dataset.pane === nome));
    modal.querySelector('footer').dataset.tab = nome;
    stopAuditAutoRefresh();
    if (nome === 'cadeia') { loadCadeia(); }
    else if (nome === 'audit') { loadAuditAll(); startAuditAutoRefresh(); }
  }

  function buildUI() {
    const fab = document.createElement('div');
    fab.id = 'hermes-fab';
    fab.title = 'Cadeia Hermes';
    fab.textContent = 'H';
    document.body.appendChild(fab);

    const modal = document.createElement('div');
    modal.id = 'hermes-modal';
    modal.innerHTML = `
      <div class="box">
        <header>
          <h2>⚡ Cadeia Hermes</h2>
          <nav class="tabs">
            <button class="tab-btn active" data-tab="cadeia">Cadeia</button>
            <button class="tab-btn" data-tab="audit">Auditoria</button>
          </nav>
          <span class="x">×</span>
        </header>
        <div class="body">
          <div class="tab-pane active tab-cadeia" data-pane="cadeia"></div>
          <div class="tab-pane tab-audit" data-pane="audit">
            <div class="audit-cards"></div>
            <div class="audit-filtros">
              <label>Dia: <select class="audit-dia"></select></label>
              <label>Status:
                <select class="audit-status">
                  <option value="">todos</option>
                  <option value="OK">OK</option>
                  <option value="FALHOU">FALHOU</option>
                  <option value="TIMEOUT">TIMEOUT</option>
                  <option value="BLOQUEADO">BLOQUEADO</option>
                  <option value="BLOQUEADO_CONFIG">BLOQUEADO_CONFIG</option>
                  <option value="EXECUTADO">EXECUTADO</option>
                  <option value="DRY_RUN">DRY_RUN</option>
                </select>
              </label>
              <button class="audit-reload">↻ Atualizar</button>
            </div>
            <div class="audit-wrap">
              <table class="audit-table">
                <thead><tr>
                  <th>Hora</th><th>Usuário</th><th>IP</th><th>Ferramenta</th><th>Comando</th><th>Status</th><th>Duração</th>
                </tr></thead>
                <tbody class="audit-tbody"></tbody>
              </table>
            </div>
          </div>
        </div>
        <footer data-tab="cadeia">
          <button class="btn-reload">↻ Recarregar</button>
          <button class="btn-revert">↶ Reverter</button>
          <button class="btn-save">Salvar</button>
        </footer>
      </div>
    `;
    document.body.appendChild(modal);

    fab.onclick = () => { modal.classList.add('open'); switchTab('cadeia'); };
    modal.querySelector('.x').onclick = () => { modal.classList.remove('open'); stopAuditAutoRefresh(); };
    modal.onclick = (e) => { if (e.target === modal) { modal.classList.remove('open'); stopAuditAutoRefresh(); } };
    modal.querySelector('.btn-save').onclick = saveCadeia;
    modal.querySelector('.btn-revert').onclick = revertCadeia;
    modal.querySelector('.btn-reload').onclick = loadCadeia;
    modal.querySelectorAll('.tab-btn').forEach(b => b.onclick = () => switchTab(b.dataset.tab));
    modal.querySelector('.audit-dia').onchange = (e) => { auditDiaAtual = e.target.value; loadAuditItens(); };
    modal.querySelector('.audit-status').onchange = (e) => { auditFiltroStatus = e.target.value; loadAuditItens(); };
    modal.querySelector('.audit-reload').onclick = loadAuditAll;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildUI);
  } else {
    buildUI();
  }
})();
