// Helper: posta no grupo "Central Dark - Grupo da Evolução" (-5365750004)
// pelos bots individuais (Gemini/Groq/Claude/Hermes) usando tokens do agent.env.
// Reaproveita o mesmo esquema do apps/bot-telegram/evolucao-ias.cjs.

import { readFileSync, existsSync } from 'node:fs';

const CHAT_ID = process.env.EVOLUCAO_CHAT_ID || '-5365750004';
const ENV_PATH = '/root/CentralDark/secrets/agent.env';

let TOKENS = null;
function carregarTokens() {
  if (TOKENS) return TOKENS;
  TOKENS = {};
  try {
    if (existsSync(ENV_PATH)) {
      const linhas = readFileSync(ENV_PATH, 'utf8').split('\n');
      for (const l of linhas) {
        const t = l.trim();
        if (!t || t.startsWith('#') || t.startsWith('---')) continue;
        const i = t.indexOf('=');
        if (i > 0) TOKENS[t.slice(0, i).trim()] = t.slice(i + 1).trim();
      }
    }
  } catch (e) { console.error('[tg-grupo] agent.env:', e.message); }
  for (const k of ['BOT_TOKEN_GEMINI','BOT_TOKEN_GROQ','BOT_TOKEN_CLAUDE','BOT_TOKEN_HERMES','TELEGRAM_ADMIN_TOKEN']) {
    if (!TOKENS[k] && process.env[k]) TOKENS[k] = process.env[k];
  }
  return TOKENS;
}

const MAPA_BOT = {
  gemini: 'BOT_TOKEN_GEMINI',
  groq:   'BOT_TOKEN_GROQ',
  claude: 'BOT_TOKEN_CLAUDE',
  hermes: 'BOT_TOKEN_HERMES',
  juiz:   'BOT_TOKEN_CLAUDE',
};

const EMOJI = {
  gemini: '✨', groq: '⚡', claude: '🧠',
  hermes: '🤖', juiz: '⚖️', user: '👤',
};

function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function fatiar(texto, tam = 3900) {
  const partes = [];
  let s = texto;
  while (s.length > tam) {
    let corte = s.lastIndexOf('\n\n', tam);
    if (corte < tam * 0.5) corte = s.lastIndexOf('\n', tam);
    if (corte < tam * 0.5) corte = tam;
    partes.push(s.slice(0, corte));
    s = s.slice(corte).trimStart();
  }
  if (s) partes.push(s);
  return partes;
}

export async function postarComoBot(botKey, texto, opts = {}) {
  const tokens = carregarTokens();
  let token = tokens[MAPA_BOT[botKey] || 'BOT_TOKEN_CLAUDE'];
  if (!token && botKey === 'hermes') token = tokens.BOT_TOKEN_CLAUDE;
  if (!token) { console.error(`[tg-grupo] sem token pra ${botKey}`); return false; }

  const chatId = opts.chatId || CHAT_ID;
  const emoji = EMOJI[botKey] || '💬';
  const nome = opts.nome || botKey.toUpperCase();
  const partes = fatiar(texto);

  for (let i = 0; i < partes.length; i++) {
    const cabecalho = i === 0 ? `${emoji} <b>${esc(nome)}</b>\n\n` : '';
    const body = cabecalho + esc(partes[i]);
    try {
      const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: body,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });
      if (!r.ok) console.error(`[tg-grupo] ${botKey} HTTP ${r.status}: ${(await r.text()).slice(0,200)}`);
    } catch (e) { console.error(`[tg-grupo] ${botKey}:`, e.message); }
    if (partes.length > 1) await new Promise(x => setTimeout(x, 400));
  }
  return true;
}

export async function postarPergunta(pergunta, modo) {
  const tokens = carregarTokens();
  const token = tokens.BOT_TOKEN_CLAUDE || tokens.BOT_TOKEN_GEMINI || tokens.BOT_TOKEN_GROQ;
  if (!token) return false;
  const texto = `👤 <b>Pivete (via WebUI)</b> — <i>modo ${esc(modo)}</i>\n\n${esc(pergunta)}`;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: texto, parse_mode: 'HTML' }),
    });
  } catch (e) { console.error('[tg-grupo] pergunta:', e.message); }
  return true;
}
