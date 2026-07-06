#!/usr/bin/env node
// utils/notify.mjs — notificador do Hermes (recriado 2026-07-06)
// Uso: node notify.mjs "<titulo>" "<mensagem_html>" [chat_id]
// Nunca falha: se não achar token, só loga no stdout (exit 0).

const [,, titulo = 'Hermes', mensagem = '', destinoArg] = process.argv;

const TOKEN =
  process.env.TELEGRAM_BOT_TOKEN ||
  process.env.HUBBOT_TOKEN ||
  process.env.BOT_TOKEN ||
  '';
const CHAT =
  destinoArg ||
  process.env.NOTIFY_CHAT_ID ||
  process.env.TELEGRAM_ADMIN_CHAT_ID ||
  process.env.ADMIN_CHAT_ID ||
  '1901426549';

const linha = `[notify] ${new Date().toISOString()} ${titulo}`;
console.log(linha);
if (mensagem) console.log(mensagem.slice(0, 400));

if (!TOKEN) {
  // Sem token = modo silencioso, sucesso.
  process.exit(0);
}

const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
const body = {
  chat_id: CHAT,
  text: `<b>${titulo}</b>\n${mensagem}`,
  parse_mode: 'HTML',
  disable_web_page_preview: true,
};

try {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    console.warn('[notify] telegram falhou', r.status, (await r.text()).slice(0, 200));
  }
} catch (e) {
  console.warn('[notify] erro:', e.message);
}
process.exit(0);
