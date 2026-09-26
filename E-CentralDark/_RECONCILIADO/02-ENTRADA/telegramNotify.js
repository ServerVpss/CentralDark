// [config-guard] Alertas pro Telegram, fire-and-forget, com throttle.
// Reusa o bot existente. Nunca quebra fluxo se Telegram falhar.
// NUNCA envia tokens, secrets, bearer, authorization, service_role.

const https = require('https');

const TELEGRAM_API_HOST = 'api.telegram.org';
const THROTTLE_MS = 10 * 60 * 1000; // 10 minutos por chave (categoria+título)
const lastSentAt = new Map();

const SECRET_KEY_RX = /(authorization|bearer|secret|token|api[_-]?key|service[_-]?role|password|senha|cookie|x-gateway-secret)/i;

function escHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function sanitizeValue(key, value) {
  if (value == null) return '';
  if (SECRET_KEY_RX.test(String(key))) return '***';
  const s = String(value);
  // Mascara qualquer Bearer/token no meio da string.
  return s
    .replace(/Bearer\s+[A-Za-z0-9._\-]+/gi, 'Bearer ***')
    .replace(/("?(authorization|token|secret|api[_-]?key)"?\s*[:=]\s*"?)[^",}\s]+/gi, '$1***');
}

function shouldSend(key) {
  const now = Date.now();
  const prev = lastSentAt.get(key) || 0;
  if (now - prev < THROTTLE_MS) return false;
  lastSentAt.set(key, now);
  return true;
}

function buildMessage(category, title, fields) {
  const parts = [];
  parts.push(`🚨 <b>${escHtml(category)}</b> · ${escHtml(title)}`);
  if (fields && typeof fields === 'object') {
    for (const [k, v] of Object.entries(fields)) {
      if (v == null || v === '') continue;
      parts.push(`<b>${escHtml(k)}:</b> <code>${escHtml(sanitizeValue(k, v))}</code>`);
    }
  }
  parts.push('');
  parts.push(`<i>${escHtml(new Date().toISOString())}</i>`);
  return parts.join('\n');
}

function postTelegram(token, chatId, text) {
  return new Promise((resolve) => {
    const body = JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
    const req = https.request(
      {
        hostname: TELEGRAM_API_HOST,
        path: `/bot${token}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
        timeout: 5000,
      },
      (res) => {
        // descarta body
        res.on('data', () => {});
        res.on('end', () => resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode }));
      },
    );
    req.on('error', () => resolve({ ok: false }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false });
    });
    req.write(body);
    req.end();
  });
}

// notify(category, title, fields) — não joga exceção, não bloqueia.
async function notify(category, title, fields) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_ALERTS_CHAT_ID;
    if (!token || !chatId) return { ok: false, reason: 'telegram_nao_configurado' };

    const key = `${category}:${title}`;
    if (!shouldSend(key)) return { ok: false, reason: 'throttled' };

    const text = buildMessage(category, title, fields);
    return await postTelegram(token, chatId, text);
  } catch {
    return { ok: false, reason: 'erro_interno' };
  }
}

module.exports = { notify };
