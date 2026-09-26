# COMANDO - hermes-panel.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\WebUI\custom-css\hermes-panel.js
**SHA:** 64105b9fe7cb0a12
**Timestamp:** 2026-08-28T02:56:41.208380
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- ERRO_SPAWN: 'err', DRY_RUN: 'info', EXECUTADO: 'ok', ERRO_CWD: 'err',

### Ouro Bruto (primeiros 5000 chars)
```
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
        <div class="card info"><div class="n">${s.total || 0}</div><div class=
```