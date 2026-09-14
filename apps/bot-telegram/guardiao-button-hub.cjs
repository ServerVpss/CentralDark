/**
 * Mini-hub de log + reflexo por botão do @Guardiaonotify_bot.
 * Não é segundo bot. Owner: guardiao-security-bot.cjs
 * Tokens nunca entram no log.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const LOG_JSONL = process.env.GUARDIAO_BTN_LOG || '/var/log/centraldark-guarda/buttons.jsonl';
const LATEST = process.env.GUARDIAO_BTN_LATEST || '/var/log/centraldark-guarda/buttons-latest.json';
const CRYSTAL = process.env.GUARDIAO_CRYSTAL_LOCK || '/root/CentralDark/runtime/guardiao-crystal-lock.json';
const MAX_JSONL_BYTES = 2 * 1024 * 1024;

const HUBS = [
  { id: 'menu', re: /^sec:menu$/, label: '🏠 Menu', crystal: true, hub: 'raiz' },
  { id: 'talk', re: /^sec:talk:/, label: 'Conversa ON/OFF', crystal: true, hub: 'canal' },
  { id: 'brain', re: /^sec:brain:/, label: 'Cérebro', crystal: true, hub: 'canal' },
  { id: 'claudemenu', re: /^sec:claudemenu$/, label: 'Claude Code', crystal: true, hub: 'canal' },
  { id: 'central', re: /^sec:central$/, label: 'Central Segurança', crystal: true, hub: 'escudo' },
  { id: 'escudo', re: /^sec:escudo$/, label: 'Escudo raio-x', crystal: true, hub: 'escudo' },
  { id: 'tentativas', re: /^sec:tentativas$/, label: 'Tentativas', crystal: true, hub: 'escudo' },
  { id: 'ssh', re: /^sec:ssh$/, label: 'Blindagem SSH', crystal: true, hub: 'escudo' },
  { id: 'f2b', re: /^sec:f2b$/, label: 'Fail2ban', crystal: true, hub: 'escudo' },
  { id: 'bans', re: /^sec:bans$/, label: 'Lista bans', crystal: true, hub: 'escudo' },
  { id: 'liberar', re: /^sec:liberar$/, label: 'Liberar acesso', crystal: true, hub: 'acesso' },
  { id: 'await', re: /^sec:await:/, label: 'Aguardar dado', crystal: true, hub: 'acesso' },
  { id: 'lista', re: /^sec:lista$/, label: 'Liberados', crystal: true, hub: 'acesso' },
  { id: 'auth', re: /^sec:auth:/, label: 'Sessão IA', crystal: true, hub: 'acesso' },
  { id: 'xmenu', re: /^sec:xmenu$/, label: 'X/Grok pool', crystal: true, hub: 'xai-oauth' },
  { id: 'xadd', re: /^sec:x(add|login)$/, label: '➕ Conta Grok', crystal: true, hub: 'xai-oauth' },
  { id: 'xuse', re: /^sec:xuse:/, label: '↪️ Usar conta', crystal: true, hub: 'xai-oauth' },
  { id: 'xrm', re: /^sec:xrm:/, label: '🚪 Remover conta', crystal: true, hub: 'xai-oauth' },
  { id: 'skills', re: /^sec:skills$/, label: 'Skills', crystal: false, hub: 'skills' },
  { id: 'audio', re: /^sec:audio:/, label: 'Áudio', crystal: false, hub: 'audio' },
  { id: 'logs', re: /^sec:logs$/, label: '📊 Logs', crystal: false, hub: 'observabilidade' },
  { id: 'logone', re: /^sec:log:/, label: '🔎 Reflexo', crystal: false, hub: 'observabilidade' },
  { id: 'crystal', re: /^sec:crystal$/, label: '🔒 Cristal', crystal: true, hub: 'cadeado' },
  { id: 'clear', re: /^sec:clear$/, label: 'Limpar hist', crystal: false, hub: 'canal' },
];

function sanitize(s) {
  return String(s || '')
    .replace(/bot\d{8,}:[A-Za-z0-9_-]+/g, '[BOT_TOKEN]')
    .replace(/\beyJ[A-Za-z0-9._-]{20,}\b/g, '[JWT]')
    .replace(/\b(sk-|gsk_|xai-|cdk_live_)[A-Za-z0-9._-]{8,}/gi, '[KEY]')
    .replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]')
    .slice(0, 240);
}

function resolveHub(data) {
  const raw = String(data || '');
  const hit = HUBS.find((h) => h.re.test(raw));
  return hit
    ? { id: hit.id, label: hit.label, crystal: hit.crystal, hub: hit.hub, data: raw }
    : { id: 'unknown', label: raw.slice(0, 32) || 'desconhecido', crystal: false, hub: 'orphao', data: raw };
}

function reflectReason(err, extra = {}) {
  const msg = sanitize(err && err.message ? err.message : err);
  const blob = `${msg} ${sanitize(extra.detail || '')}`.toLowerCase();
  if (/timeout|etimedout|aborted/i.test(blob)) return { code: 'TIMEOUT', why: 'demorou demais / caiu no meio' };
  if (/econnrefused|enotfound|fetch failed|socket/i.test(blob)) return { code: 'REDE', why: 'serviço não respondeu' };
  if (/logged out|pool_vazio|sem_token|nao encontrada/i.test(blob)) return { code: 'AUTH', why: 'conta ou token ausente' };
  if (/enoent|arquivo dono/i.test(blob)) return { code: 'ARQUIVO', why: 'arquivo dono sumiu' };
  if (/eacces|permission/i.test(blob)) return { code: 'PERMISSAO', why: 'sem permissão no host' };
  if (/telegram|query is too old|message is not modified/i.test(blob)) return { code: 'TELEGRAM', why: 'Telegram recusou o edit/send' };
  if (/unhandled|sem handler/i.test(blob)) return { code: 'ORPHAO', why: 'botão sem handler' };
  if (!msg) return { code: 'UNKNOWN', why: 'falhou sem mensagem' };
  return { code: 'ERRO', why: msg.slice(0, 120) };
}

function ensureLogDir() {
  fs.mkdirSync(path.dirname(LOG_JSONL), { recursive: true });
}

function rotateIfHuge() {
  try {
    const st = fs.statSync(LOG_JSONL);
    if (st.size < MAX_JSONL_BYTES) return;
    fs.renameSync(LOG_JSONL, `${LOG_JSONL}.${Date.now()}.old`);
  } catch { /* ok */ }
}

function loadLatest() {
  try { return JSON.parse(fs.readFileSync(LATEST, 'utf8')); } catch { return { buttons: {} }; }
}

function writeLatest(state) {
  ensureLogDir();
  fs.writeFileSync(LATEST, JSON.stringify(state, null, 2) + '\n', { mode: 0o600 });
}

function logEvent({ data, kind, reason, ms, fromId }) {
  const hub = resolveHub(data);
  const rec = {
    ts: new Date().toISOString(),
    kind, // tap | ok | fail
    id: hub.id,
    label: hub.label,
    hub: hub.hub,
    crystal: hub.crystal,
    data: sanitize(hub.data).slice(0, 64),
    reason: reason ? { code: reason.code, why: sanitize(reason.why) } : null,
    ms: Number.isFinite(ms) ? ms : null,
    from: fromId || null,
  };
  try {
    ensureLogDir();
    rotateIfHuge();
    fs.appendFileSync(LOG_JSONL, `${JSON.stringify(rec)}\n`);
    const state = loadLatest();
    state.buttons = state.buttons || {};
    const prev = state.buttons[hub.id] || { taps: 0, oks: 0, fails: 0 };
    if (kind === 'tap') prev.taps = (prev.taps || 0) + 1;
    if (kind === 'ok') prev.oks = (prev.oks || 0) + 1;
    if (kind === 'fail') prev.fails = (prev.fails || 0) + 1;
    prev.label = hub.label;
    prev.hub = hub.hub;
    prev.crystal = hub.crystal;
    prev.last_kind = kind;
    prev.last_ts = rec.ts;
    if (reason) prev.last_reason = rec.reason;
    if (kind === 'ok') prev.last_ok_ms = rec.ms;
    state.buttons[hub.id] = prev;
    state.updated_at = rec.ts;
    writeLatest(state);
  } catch { /* never crash the bot for log */ }
  return rec;
}

function crystalDefaults() {
  return {
    locked: true,
    updated_at: new Date().toISOString(),
    policy: 'CRYSTAL_LOCK — usar pode; redesenhar/apagar owner não',
    items: HUBS.filter((h) => h.crystal).map((h) => ({
      id: h.id, label: h.label, hub: h.hub, lock: 'LOCKED',
    })),
  };
}

function loadCrystal() {
  try {
    const raw = JSON.parse(fs.readFileSync(CRYSTAL, 'utf8'));
    if (raw && raw.locked) return raw;
  } catch { /* seed */ }
  const seeded = crystalDefaults();
  try {
    fs.mkdirSync(path.dirname(CRYSTAL), { recursive: true });
    fs.writeFileSync(CRYSTAL, JSON.stringify(seeded, null, 2) + '\n', { mode: 0o600 });
  } catch { /* ok */ }
  return seeded;
}

function snapshot() {
  const latest = loadLatest();
  const crystal = loadCrystal();
  const rows = HUBS.map((h) => {
    const st = (latest.buttons || {})[h.id] || { taps: 0, oks: 0, fails: 0 };
    return {
      id: h.id,
      label: h.label,
      hub: h.hub,
      crystal: h.crystal,
      taps: st.taps || 0,
      oks: st.oks || 0,
      fails: st.fails || 0,
      last_kind: st.last_kind || 'none',
      last_reason: st.last_reason || null,
      last_ts: st.last_ts || null,
    };
  });
  return { latest, crystal, rows };
}

function one(id) {
  return snapshot().rows.find((r) => r.id === id) || null;
}

module.exports = {
  HUBS,
  resolveHub,
  reflectReason,
  sanitize,
  logEvent,
  loadCrystal,
  snapshot,
  one,
  LOG_JSONL,
  LATEST,
  CRYSTAL,
};
