#!/usr/bin/env node
// Notifica admin + canal Status sobre um ciclo do Hermes.
// Uso: node hermes-notify.mjs "<pendencia>" "<caminho-do-arquivo>"
import { readFileSync, readdirSync } from 'node:fs';
import { basename } from 'node:path';
import { execSync } from 'node:child_process';

const [,, pendencia = '(sem)', arquivo = '(sem)'] = process.argv;

// 1. Descobre PID do bot @srver1bot via pm2
let TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
if (!TOKEN) {
  try {
    const jlist = JSON.parse(execSync('pm2 jlist', { encoding: 'utf8' }));
    const bot = jlist.find(p => p.pm_id === 27);
    if (bot?.pid) {
      const env = readFileSync(`/proc/${bot.pid}/environ`, 'utf8').split('\0');
      const line = env.find(l => l.startsWith('TELEGRAM_BOT_TOKEN='));
      if (line) TOKEN = line.slice('TELEGRAM_BOT_TOKEN='.length);
    }
  } catch (e) { console.error('erro lendo env do bot:', e.message); }
}

if (!TOKEN) { console.error('sem token disponivel'); process.exit(1); }

const API = `https://api.telegram.org/bot${TOKEN}`;
const ADMIN = 1901426549;
const CANAL = -1003669176367;

const esc = s => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
let veredicto = '(sem veredicto)';
try {
  const md = readFileSync(arquivo, 'utf8');
  const idx = md.indexOf('## ⚖️ Veredicto do Conselho');
  veredicto = idx >= 0 ? md.slice(idx + 30).trim().slice(0, 800) : md.slice(0, 800);
} catch (e) {}

const msgAdmin =
  `🤖 <b>HERMES rodou</b> — ${new Date().toISOString().slice(0,16).replace('T',' ')}\n\n` +
  `<b>Pendência:</b>\n<i>${esc(pendencia)}</i>\n\n` +
  `<b>⚖️ Veredicto (recorte):</b>\n${esc(veredicto)}\n\n` +
  `📁 <code>${esc(basename(arquivo))}</code>`;
const msgCanal = `🤖 Hermes analisou 1 pendência sozinho · veredicto em <code>EVOLUCAO/${new Date().toISOString().slice(0,10)}/</code>`;

async function tg(chat_id, text) {
  const r = await fetch(`${API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id, text, parse_mode: 'HTML' })
  });
  const j = await r.json();
  console.log(`tg ${chat_id}:`, j.ok ? 'OK id='+j.result.message_id : JSON.stringify(j));
}

await tg(ADMIN, msgAdmin);
await tg(CANAL, msgCanal);
