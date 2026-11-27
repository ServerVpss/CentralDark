#!/usr/bin/env node
import { readFileSync } from 'node:fs';

function loadEnv(file) {
  try {
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const m = line.trim().match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m && (process.env[m[1]] === undefined || process.env[m[1]] === '')) {
        process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
      }
    }
  } catch {}
}

loadEnv('/root/CentralDark/secrets/telegram-alerts.env');
loadEnv('/root/CentralDark/secrets/.env');

const [titulo = 'Hermes', mensagem = '', destino = 'admin'] = process.argv.slice(2);
const primaryToken = process.env.SRVER1_BOT_TOKEN || '';
const fallbackToken = process.env.TELEGRAM_BOT_TOKEN || process.env.GUARDA_TELEGRAM_BOT_TOKEN || '';
const tokens = [
  ['primary', primaryToken],
  ['fallback', fallbackToken],
].filter(([, value], index, arr) => value && arr.findIndex(([, seen]) => seen === value) === index);
const admin = process.env.ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID || '';

if (!tokens.length) throw new Error('Telegram token ausente');
if (!admin) throw new Error('Telegram admin/chat id ausente');

const text = `<b>${escapeHtml(titulo)}</b>\n\n${mensagem}`;
const body = new URLSearchParams({
  chat_id: admin,
  text,
  parse_mode: 'HTML',
  disable_web_page_preview: 'true',
});

const failures = [];
for (const [role, token] of tokens) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok && data.ok !== false) {
    console.log(`notify_ok=${data.result?.message_id || true} destino=${destino} canal=${role}`);
    process.exit(0);
  }
  failures.push(`${role}:HTTP_${res.status}:${data.description || 'sem_descricao'}`);
}
throw new Error(`Telegram notify falhou: ${failures.join(' | ')}`);

function escapeHtml(s) {
  return String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}
