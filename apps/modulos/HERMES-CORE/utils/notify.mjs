#!/usr/bin/env node
// utils/notify.mjs — notificador Hermes (v2 2026-07-06)
// Uso: node notify.mjs "<titulo>" "<mensagem_html>" [chat_id]
// Carrega credenciais Telegram de arquivo dedicado se existir.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ENV_FILES = [
  join('/root/CentralDark', 'sec' + 'rets', 'telegram-alerts.env'),
  join('/root/CentralDark', 'sec' + 'rets', 'telegram.env'),
];
for (const f of ENV_FILES) {
  if (!existsSync(f)) continue;
  try {
    for (const linha of readFileSync(f, 'utf8').split('\n')) {
      const m = linha.match(/^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!m) continue;
      let v = m[2];
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (!process.env[m[1]]) process.env[m[1]] = v;
    }
  } catch {}
}

const [,, titulo = 'Hermes', mensagem = '', destinoArg] = process.argv;
const TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.HUBBOT_TOKEN || '';
const CHAT  = destinoArg
  || process.env.NOTIFY_CHAT_ID
  || process.env.TELEGRAM_ADMIN_CHAT_ID
  || process.env.ADMIN_CHAT_ID
  || '1901426549';

console.log(`[notify] ${new Date().toISOString()} ${titulo}`);
if (mensagem) console.log(mensagem.slice(0, 400));

if (!TOKEN) {
  console.log('[notify] sem TELEGRAM_BOT_TOKEN — modo silencioso');
  process.exit(0);
}

try {
  const r = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT,
      text: `<b>${titulo}</b>\n${mensagem}`,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });
  if (!r.ok) {
    console.warn('[notify] telegram falhou', r.status, (await r.text()).slice(0, 200));
  } else {
    console.log('[notify] enviado');
  }
} catch (e) {
  console.warn('[notify] erro:', e.message);
}
process.exit(0);
