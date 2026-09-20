// ============================================================
// HANDLER: /router status | /router trocar | /router testar
// Fase 4 — Regras Configuráveis do Arsenal Council
// ============================================================
// Lê/edita docs/CONSCIENCIA/ARSENAL/regras.json com hot-reload.
// ============================================================

const fs = require('fs');
const path = require('path');

const REGRAS = '/root/CentralDark/docs/CONSCIENCIA/ARSENAL/regras.json';

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function ler() {
  try { return JSON.parse(fs.readFileSync(REGRAS, 'utf8')); }
  catch (e) { return null; }
}

function salvar(r) {
  r.atualizado_em = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(REGRAS, JSON.stringify(r, null, 2));
}

// -------- status --------
async function status(send, chatId) {
  const r = ler();
  if (!r) return send(chatId, '❌ Não consegui ler <code>regras.json</code>.');
  const m = r.modelos, t = r.timeouts;
  return send(chatId,
    `🧩 <b>Regras do Arsenal Council</b> (v${r.versao})\n` +
    `<i>Atualizado: ${r.atualizado_em}</i>\n\n` +
    `<b>🎯 Router:</b> <code>${esc(m.router)}</code>\n` +
    `<b>🧠 Voz 1 (Pro):</b> <code>${esc(m.voz1_pro)}</code>\n` +
    `<b>💬 Voz 2 (GPT):</b> <code>${esc(m.voz2_gpt)}</code>\n` +
    `<b>⚡ Voz 3 (Flash):</b> <code>${esc(m.voz3_flash)}</code>\n` +
    `<b>⚖️ Juiz:</b> <code>${esc(m.juiz)}</code>\n\n` +
    `<b>⏱️ Timeouts:</b> router ${t.router_s}s · parallel ${t.parallel_s}s · debate ${t.debate_s}s\n\n` +
    `<b>Comandos:</b>\n` +
    `<code>/router trocar &lt;slot&gt; &lt;modelo&gt;</code>\n` +
    `Ex: <code>/router trocar juiz gpt-5</code>\n` +
    `<code>/router testar</code> → dispara sanity check`
  );
}

// -------- trocar <slot> <modelo> --------
async function trocar(send, chatId, args) {
  if (args.length < 2) return send(chatId,
    `❌ Uso: <code>/router trocar &lt;slot&gt; &lt;modelo&gt;</code>\n\n` +
    `Slots: router, voz1_pro, voz2_gpt, voz3_flash, juiz`
  );
  const [slot, ...mdl] = args;
  const modelo = mdl.join(' ').trim();
  const r = ler();
  if (!r) return send(chatId, '❌ Não consegui ler <code>regras.json</code>.');
  if (!(slot in r.modelos)) {
    return send(chatId, `❌ Slot inválido: <code>${esc(slot)}</code>\nUse: ${Object.keys(r.modelos).map(k => `<code>${k}</code>`).join(', ')}`);
  }
  if (!r.modelos_disponiveis.includes(modelo)) {
    return send(chatId,
      `⚠️ Modelo <code>${esc(modelo)}</code> não está na lista conhecida.\n` +
      `Disponíveis: ${r.modelos_disponiveis.map(m => `<code>${m}</code>`).join(', ')}\n\n` +
      `<i>Trocado mesmo assim (assumindo que existe no gateway).</i>`
    );
  }
  const antes = r.modelos[slot];
  r.modelos[slot] = modelo;
  salvar(r);
  return send(chatId,
    `✅ <b>Trocado:</b> <code>${esc(slot)}</code>\n` +
    `<i>de:</i> <code>${esc(antes)}</code>\n` +
    `<i>para:</i> <code>${esc(modelo)}</code>\n\n` +
    `🔄 Hot-reload em ~5s. Próximo <code>/refinar</code> já usa o novo.`
  );
}

// -------- testar --------
async function testar(send, chatId) {
  const r = ler();
  if (!r) return send(chatId, '❌ Não consegui ler <code>regras.json</code>.');
  await send(chatId, '🧪 <b>Sanity check</b> — pingando todos os modelos configurados...');
  const { spawn } = require('child_process');
  const modelos = Object.entries(r.modelos);
  const resultados = [];
  for (const [slot, modelo] of modelos) {
    const t0 = Date.now();
    const ok = await new Promise((res) => {
      const p = spawn('bash', ['-c', `darkai -m "${modelo}" "ping" 2>&1 | head -c 50`], { timeout: 20000 });
      let out = '';
      p.stdout.on('data', d => out += d);
      p.on('close', c => res({ code: c, out: out.trim() }));
      p.on('error', () => res({ code: 1, out: 'erro' }));
    });
    const dt = ((Date.now() - t0) / 1000).toFixed(1);
    const status = ok.code === 0 && ok.out.length > 0 ? '🟢' : '🔴';
    resultados.push(`${status} <b>${slot}</b> <code>${esc(modelo)}</code> — ${dt}s`);
  }
  return send(chatId, `🧪 <b>Resultado do teste:</b>\n\n${resultados.join('\n')}`);
}

// -------- dispatcher --------
async function regrasHandler(deps, args) {
  const { send, chatId } = deps;
  const sub = (args[0] || '').toLowerCase();
  if (sub === 'status') return status(send, chatId);
  if (sub === 'trocar') return trocar(send, chatId, args.slice(1));
  if (sub === 'testar') return testar(send, chatId);
  return null; // não é subcomando de regras
}

module.exports = { regrasHandler };
