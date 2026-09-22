import fs from 'fs';
import { execFile } from 'child_process';
import { promisify } from 'util';

const pexec = promisify(execFile);

// Carrega TELEGRAM_BOT_TOKEN / TELEGRAM_CHANNEL_ID de secrets/telegram-alerts.env
// sem expor valores. Cache em memória após primeira leitura.
let _cfg = null;
function loadCfg() {
  if (_cfg) return _cfg;
  const paths = [
    '/root/CentralDark/secrets/telegram-alerts.env',
    '/root/CentralDark/secrets/.env',
  ];
  const env = {};
  for (const p of paths) {
    try {
      const txt = fs.readFileSync(p, 'utf-8');
      for (const line of txt.split('\n')) {
        const m = line.trim().match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
        if (m && env[m[1]] === undefined) {
          env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
        }
      }
    } catch { /* arquivo ausente, segue */ }
  }
  _cfg = {
    token: env.TELEGRAM_BOT_TOKEN || env.SRVER1_BOT_TOKEN || env.GUARDA_TELEGRAM_BOT_TOKEN || '',
    chat: env.TELEGRAM_CHANNEL_ID || env.TELEGRAM_ALERTS_CHAT_ID || '',
  };
  return _cfg;
}

// Commits automáticos não devem gerar notificação (evita spam do painel-auto-update,
// pipeline e sentinela, que fazem push constante).
const AUTO_PREFIXES = [
  'chore(painel)',
  'chore(pipeline)',
  'chore(sentinela)',
  'IA atualiza painel',
];

export function isAutoCommit(msg) {
  if (!msg) return false;
  return AUTO_PREFIXES.some((p) => msg.includes(p));
}

export async function getHeadInfo(repoPath) {
  try {
    const { stdout: sha } = await pexec('git', ['-C', repoPath, 'rev-parse', 'HEAD']);
    const { stdout: msg } = await pexec('git', ['-C', repoPath, 'log', '-1', '--pretty=%s']);
    return { sha: sha.trim(), msg: msg.trim() };
  } catch {
    return { sha: '', msg: '' };
  }
}

async function sendTelegramHtml(text, chatOverride = '') {
  const { token, chat } = loadCfg();
  const target = chatOverride || chat;
  if (!token || !target) return { ok: false, reason: 'token/chat ausente' };

  const body = JSON.stringify({
    chat_id: target,
    parse_mode: 'HTML',
    text,
    disable_web_page_preview: true,
  });

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    const data = await res.json().catch(() => ({ ok: false }));
    return { ok: !!data.ok, reason: data.description };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

export async function notifyVpsUpdated({ sha, msg }) {
  const shortSha = (sha || '').slice(0, 7);
  const text =
    `⭕ <b>!AURÉOLA CANÔNICA</b>\n` +
    `🟢 <b>CHEFE, a VPS recebeu a atualização.</b>\n` +
    `👉 O que aconteceu: ${escapeHtml(msg)}\n` +
    `🧾 HEAD/SHA: <code>${shortSha}</code>\n` +
    `⚙️ O que foi feito: deploy automático concluído via webhook.\n` +
    `🔎 <b>!CONTRAPROVA</b>: este recibo prova o deploy observado; não amplia o escopo.\n` +
    `⚖️ <i>REALIDADE É O JUIZ.</i>`;
  return sendTelegramHtml(text);
}

// Cartão gamificado do mesmo padrão epistemológico da Casa.
// Visual NÃO muda o significado: CANDIDATE continua sem prova, UNKNOWN nunca vira PASS.
export async function notifyCentralDarkSignal({ state = 'UNKNOWN', title = 'Signal Watch', card = '', source = '' } = {}) {
  const normalized = String(state || 'UNKNOWN').toUpperCase();
  const icon = normalized === 'PROVEN' ? '🟢'
    : normalized === 'FAIL' ? '🔴'
      : normalized === 'BLOCKED' ? '🟠'
        : normalized === 'CANDIDATE' ? '🟣'
          : '⚪';
  const safeCard = String(card || '').slice(0, 3200);
  const text = [
    `⭕ <b>!AURÉOLA CANÔNICA</b> · 🧿 <b>!CENTRALDARK</b>`,
    `${icon} <b>CHEFE, ${humanState(normalized)}</b>`,
    `⚖️ Estado técnico: <b>${escapeHtml(normalized)}</b> · ${escapeHtml(title)}`,
    source ? `🎯 SOURCE=<code>${escapeHtml(source)}</code>` : '',
    safeCard ? `<pre>${escapeHtml(safeCard)}</pre>` : '',
    '🔎 <b>!CONTRAPROVA</b>: CANDIDATE != PROVEN · UNKNOWN != PASS · DOCUMENTED != EXECUTED',
    '<i>⚖️ REALIDADE É O JUIZ.</i>',
  ].filter(Boolean).join('\n');
  return sendTelegramHtml(text, process.env.NOTIFY_CHAT_ID || '');
}

function humanState(state) {
  if (state === 'PROVEN') return 'funcionou no escopo medido e temos prova.';
  if (state === 'FAIL') return 'deu problema; o rastro abaixo mostra a falha medida.';
  if (state === 'BLOCKED') return 'a passagem está bloqueada; ainda não dá pra chamar de resolvida.';
  if (state === 'CANDIDATE') return 'achamos um candidato, mas ele ainda precisa de prova.';
  return 'ainda não sabemos o bastante — UNKNOWN continua UNKNOWN.';
}

function escapeHtml(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
