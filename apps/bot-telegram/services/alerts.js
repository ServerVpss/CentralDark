// Serviço de alertas Telegram (fire-and-forget com throttle)
const config = require('../config');
const messages = require('./messages');
const { formatBrasilia } = require('../../../central-horario/node.cjs');

const THROTTLE_MS = 10 * 60 * 1000;
const lastSent = new Map();

const LEVEL_ICONS = Object.freeze({
  critical: '🔴',
  warning: '🟡',
  info: '',
  deploy: '🚀',
  maintenance: '🛠️',
  git: '🔄',
  success: '✅',
  pending: '⏳',
  blocked: '⛔',
  unknown: '❓',
});

function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

module.exports = {
  async sendAlert({ title, message, level = 'info', fields = {} }) {
    if (!config.isConfigured()) return { ok: false, error: 'Não configurado' };

    const key = `${level}:${title}`;
    const now = Date.now();
    if (now - (lastSent.get(key) || 0) < THROTTLE_MS) return { ok: false, error: 'throttled' };
    lastSent.set(key, now);

    const emoji = LEVEL_ICONS[level] ?? LEVEL_ICONS.info;
    const heading = emoji ? `${emoji} <b>${esc(title)}</b>` : `<b>${esc(title)}</b>`;
    const parts = [heading, '', esc(message)];

    for (const [k, v] of Object.entries(fields)) {
      if (v) parts.push(`<b>${esc(k)}:</b> <code>${esc(v)}</code>`);
    }
    parts.push('', `🧾 <i>${formatBrasilia()}</i>`);

    try {
      await messages.sendMessage(config.ALERTS_CHAT_ID, parts.join('\n'));
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  },
};
