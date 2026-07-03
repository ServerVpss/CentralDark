// Renderer do Conselho Vivo — consome conselho-vivo.json gerado pelo cron.
(async function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const when = (iso) => { try { return new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }); } catch { return iso; } };

  async function load() {
    try {
      const r = await fetch('./conselho-vivo.json?t=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    } catch (e) { return { erro: e.message }; }
  }
  function renderKV(target, obj) {
    const entries = Object.entries(obj || {});
    if (!entries.length) { target.innerHTML = '<div class="kv" style="color:var(--muted)">— vazio —</div>'; return; }
    target.innerHTML = entries.map(([k, v]) => `<div class="kv"><span>${esc(k)}</span><b>${esc(typeof v === 'object' ? JSON.stringify(v) : v)}</b></div>`).join('');
  }
  function renderList(target, items) {
    if (!items || !items.length) { target.innerHTML = '<div style="color:var(--muted);padding:8px 0">— nada por aqui ainda —</div>'; return; }
    target.innerHTML = items.map((it) => `<div class="list-item"><div class="when">${esc(when(it.quando))}</div><div class="file">${esc(it.arquivo)}</div><div class="prev">${esc(it.preview || '')}</div></div>`).join('');
  }

  const data = await load();
  if (data.erro) { $('debates').innerHTML = `<div style="color:var(--danger)">erro carregando: ${esc(data.erro)}</div>`; return; }
  renderKV($('slots'), data.slots);
  renderKV($('timeouts'), data.timeouts);
  renderKV($('stats'), data.stats);
  $('updated').textContent = 'atualizado em ' + when(data.atualizadoEm);
  renderList($('debates'), data.ultimosDebates);
  renderList($('evolucoes'), data.ultimasEvolucoes);

  // Destaque Hermes — última proposta autônoma em card grande no topo
  const h = (data.ultimasEvolucoes || [])[0];
  const hEl = $('hermes-destaque');
  if (hEl) {
    if (h) {
      hEl.innerHTML = `<div class="list-item" style="border:none;padding:0">
        <div class="when">${esc(when(h.quando))}</div>
        <div class="file">${esc(h.arquivo)}</div>
        <div class="prev" style="font-size:14px;margin-top:8px;line-height:1.6">${esc(h.preview || '')}</div>
      </div>`;
    } else {
      hEl.innerHTML = '<div style="color:var(--muted)">Hermes ainda não fez proposta autônoma — próxima rodada às 06:00 UTC.</div>';
    }
  }
})();
