/* ═══════════════════════════════════════════════════════════════
   Cadeia Hermes — Painel embutido no Open WebUI
   Cole no admin: Settings → Interface → Custom JS
   Requer: hermes-panel.css carregado no Custom CSS.
   API: https://api.centralldark.com/hermes/*
   ═══════════════════════════════════════════════════════════════ */
(function () {
  if (window.__hermesPainelBoot) return;
  window.__hermesPainelBoot = true;

  const API   = 'https://api.centralldark.com';
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

  let cadeia = [];

  function render() {
    const body = document.querySelector('#hermes-modal .body');
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
      row.querySelector('.toggle').onclick = () => { m.ativo = !m.ativo; render(); };
      row.querySelector('[data-up]').onclick = () => { if (i > 0) { [cadeia[i-1], cadeia[i]] = [cadeia[i], cadeia[i-1]]; render(); } };
      row.querySelector('[data-dn]').onclick = () => { if (i < cadeia.length - 1) { [cadeia[i+1], cadeia[i]] = [cadeia[i], cadeia[i+1]]; render(); } };
      body.appendChild(row);
    });
  }

  async function load() {
    try {
      const j = await api('/hermes/cadeia');
      cadeia = (j.cadeia || []).map((m, i) => ({ ...m, posicao: i + 1 }));
      render();
    } catch (e) { toast('Erro ao carregar: ' + e.message, true); }
  }

  async function save() {
    try {
      cadeia.forEach((m, i) => (m.posicao = i + 1));
      await api('/hermes/cadeia', { method: 'PUT', body: JSON.stringify({ cadeia }) });
      toast('Cadeia salva ✓');
    } catch (e) { toast('Erro ao salvar: ' + e.message, true); }
  }

  async function revert() {
    if (!confirm('Reverter para o backup anterior?')) return;
    try {
      await api('/hermes/cadeia/reverter', { method: 'POST' });
      toast('Revertido ✓');
      load();
    } catch (e) { toast('Erro: ' + e.message, true); }
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
          <span class="x">×</span>
        </header>
        <div class="body"></div>
        <footer>
          <button class="btn-reload">↻ Recarregar</button>
          <button class="btn-revert">↶ Reverter</button>
          <button class="btn-save">Salvar</button>
        </footer>
      </div>
    `;
    document.body.appendChild(modal);

    fab.onclick = () => { modal.classList.add('open'); load(); };
    modal.querySelector('.x').onclick = () => modal.classList.remove('open');
    modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('open'); };
    modal.querySelector('.btn-save').onclick = save;
    modal.querySelector('.btn-revert').onclick = revert;
    modal.querySelector('.btn-reload').onclick = load;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildUI);
  } else {
    buildUI();
  }
})();
