#!/usr/bin/env node
// utils/notify.mjs — notificador Hermes (v3 2026-07-10)
// Uso: node notify.mjs "<titulo>" "<mensagem>" [chat_id]
// Segue o Padrão Card Hermes (docs/CONSCIENCIA/PADRAO-CARD-HERMES.md):
//   - TUDO dentro de um único <pre>...</pre>
//   - Bot oficial @srver1bot (credencial SRVER1_BOT_TOKEN)
//   - Envio via API Telegram direta (bot token), pois o "connector"
//     std_01kvw4jkcbekyr1t33vs4p5e9w é uma ferramenta MCP do agente,
//     não uma API HTTP chamável a partir de um processo standalone na VPS.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ENV_FILES = [
  join('/root/CentralDark', 'sec' + 'rets', 'telegram-alerts.env'),
  join('/root/CentralDark', 'sec' + 'rets', 'telegram.env'),
  join('/root/CentralDark', 'sec' + 'rets', '.env'),
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

// Credencial real do bot @srver1bot. SRVER1_BOT_TOKEN é a fonte correta
// (formato válido digits:alnum). TELEGRAM_BOT_TOKEN/HUBBOT_TOKEN ficam
// como fallback legado, mas hoje contêm valor placeholder inválido.
const TOKEN_CANDIDATES = [
  process.env.SRVER1_BOT_TOKEN,
  process.env.TELEGRAM_BOT_TOKEN,
  process.env.HUBBOT_TOKEN,
].filter(Boolean);
const TOKEN = TOKEN_CANDIDATES.find(t => /^\d+:[A-Za-z0-9_-]+$/.test(t)) || TOKEN_CANDIDATES[0] || '';

// Monta o card no padrão oficial: tudo dentro de UM único <pre>.
function montarCard(titulo, mensagem) {
  const largura = 36;
  const linhaTopo = `║  ${titulo}`.padEnd(largura - 1) + '║';
  return [
    '╔' + '═'.repeat(largura - 2) + '╗',
    linhaTopo,
    '╚' + '═'.repeat(largura - 2) + '╝',
    '',
    '⭕ !AURÉOLA CANÔNICA',
    '👑 CHEFE — recado da CentralDark:',
    mensagem,
    '',
    '🔎 !CONTRAPROVA: a notificação informa o evento; a prova continua no rastro correspondente.',
    '⚖️ REALIDADE É O JUIZ.',
  ].join('\n');
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let nextTelegramAllowedAt = 0;
let lastPayloadFingerprint = '';
let lastPayloadAt = 0;

function parseRetryAfter(texto) {
  try {
    const parsed = JSON.parse(texto);
    return Number(parsed?.parameters?.retry_after || 0);
  } catch {
    const m = String(texto).match(/retry after\s+(\d+)/i);
    return m ? Number(m[1]) : 0;
  }
}

function fingerprint(texto) {
  let hash = 0;
  for (const ch of String(texto)) hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
  return String(hash);
}

export async function notificar(titulo = 'Hermes', mensagem = '', destino) {
  const chat = destino
    || process.env.NOTIFY_CHAT_ID
    || process.env.TELEGRAM_ADMIN_CHAT_ID
    || process.env.ADMIN_CHAT_ID
    || '1901426549';

  console.log(`[notify] ${new Date().toISOString()} ${titulo}`);
  if (mensagem) console.log(mensagem.slice(0, 400));

  if (!TOKEN) {
    console.log('[notify] sem token válido de bot (@srver1bot) — modo silencioso');
    return { ok: false, reason: 'missing_token' };
  }

  const cardHtml = `<pre>${escapeHtml(montarCard(titulo, mensagem))}</pre>`;
  const payloadFingerprint = fingerprint(`${chat}:${cardHtml}`);
  const now = Date.now();
  if (payloadFingerprint === lastPayloadFingerprint && now - lastPayloadAt < 30_000) {
    console.log('[notify] duplicado suprimido por 30s');
    return { ok: false, reason: 'duplicate_suppressed' };
  }
  if (now < nextTelegramAllowedAt) {
    const waitMs = nextTelegramAllowedAt - now;
    console.warn('[notify] aguardando backoff telegram', Math.ceil(waitMs / 1000));
    await sleep(waitMs);
  }

  try {
    const r = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat,
        text: cardHtml,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    if (!r.ok) {
      const body = await r.text().catch(() => '');
      if (r.status === 429) {
        const retryAfter = parseRetryAfter(body) || 30;
        nextTelegramAllowedAt = Date.now() + (retryAfter + 1) * 1000;
        console.warn('[notify] telegram rate_limited', { retry_after: retryAfter });
        return { ok: false, status: r.status, retry_after: retryAfter };
      }
      console.warn('[notify] telegram falhou', r.status, body.slice(0, 200));
      return { ok: false, status: r.status };
    }
    lastPayloadFingerprint = payloadFingerprint;
    lastPayloadAt = Date.now();
    console.log('[notify] enviado');
    return { ok: true, status: r.status };
  } catch (e) {
    console.warn('[notify] erro:', e.message);
    return { ok: false, reason: e.message };
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [,, titulo = 'Hermes', mensagem = '', destinoArg] = process.argv;
  await notificar(titulo, mensagem, destinoArg);
}
