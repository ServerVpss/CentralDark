// Sanitiza objetos antes de logar — nunca expõe tokens/secrets/mídia/JIDs completos.
// Política de logs do Gateway: ver docs/DECISOES_TECNICAS.md.

const SENSITIVE_KEYS = [
  'token', 'secret', 'authorization', 'auth', 'password', 'apikey', 'api_key',
  'wuzapi_admin_token', 'gateway_server_token', 'wuzapi_webhook_secret',
  'atendimento_webhook_secret', 'multizap_webhook_secret',
  'mediakey', 'fileencsha256', 'filesha256', 'directpath',
];

const URL_KEYS = ['url', 'media_url', 'mediaurl', 'thumbnailurl', 'thumbnail_url', 'pictureurl', 'picture_url'];
const JID_KEYS = ['jid', 'from', 'to', 'chat_id', 'chatid', 'sender_id', 'senderid', 'participant', 'remote_jid', 'remotejid'];

const SENSITIVE_QUERY_KEYS = new Set(['secret', 'token', 'authorization', 'apikey', 'api_key', 'auth', 'password']);

function mask(value) {
  if (typeof value !== 'string') return '[REDACTED]';
  if (value.length <= 6) return '***';
  return `${value.slice(0, 3)}…${value.slice(-3)}`;
}

// "d06c...7de6" (3 do começo + 3 do fim).
function maskSecret(value) {
  if (typeof value !== 'string' || value.length < 8) return '***';
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

// Mascara JID preservando DDI + final + domínio. Ex: 5582******1030@s.whatsapp.net
// Aceita sufixo de device (":40", ":12" etc.) usado pelo Whatsmeow.
function maskJid(value) {
  if (typeof value !== 'string') return value;
  const m = value.match(/^([\w-]+)(:\d+)?(@(s\.whatsapp\.net|g\.us|lid|newsletter|broadcast))/i);
  if (!m) return value;
  const id = m[1];
  const device = m[2] || '';
  const domain = m[3];
  if (id.length <= 8) return `${id}${device}${domain}`;
  const head = id.slice(0, 4);
  const tail = id.slice(-4);
  return `${head}${'*'.repeat(Math.max(2, id.length - 8))}${tail}${device}${domain}`;
}

// Esconde URLs de mídia do WhatsApp; mantém URLs curtas e públicas.
function maskUrl(value) {
  if (typeof value !== 'string') return value;
  if (!value) return value;
  if (
    value.length > 120 ||
    /whatsapp\.net/i.test(value) ||
    /mmg\./i.test(value) ||
    /\bmedia\b/i.test(value) ||
    /base64,/i.test(value)
  ) {
    return 'whatsapp_media_url_present';
  }
  return value;
}

// Remove valores sensíveis de uma URL/querystring antes de logar.
function maskQuery(url) {
  if (typeof url !== 'string') return url;
  try {
    // URL relativa? usa base fake.
    const u = url.startsWith('http') ? new URL(url) : new URL(url, 'http://x.local');
    for (const key of [...u.searchParams.keys()]) {
      if (SENSITIVE_QUERY_KEYS.has(key.toLowerCase())) {
        u.searchParams.set(key, maskSecret(u.searchParams.get(key) || ''));
      }
    }
    return url.startsWith('http') ? u.toString() : `${u.pathname}${u.search}`;
  } catch {
    return url.replace(/(secret|token|authorization|apikey|api_key|auth|password)=([^&]+)/gi, (_m, k, v) => `${k}=${maskSecret(v)}`);
  }
}

function previewBody(value, n = 80) {
  if (typeof value !== 'string') return value;
  if (value.length <= n) return value;
  return `${value.slice(0, n)}…`;
}

function isJidLike(v) {
  return typeof v === 'string' && /(:\d+)?@(s\.whatsapp\.net|g\.us|lid|newsletter|broadcast)$/i.test(v);
}

function safeLog(input) {
  if (input == null) return input;
  if (Array.isArray(input)) return input.map(safeLog);
  if (typeof input !== 'object') return input;

  const out = {};
  for (const [k, v] of Object.entries(input)) {
    const lower = k.toLowerCase();
    if (SENSITIVE_KEYS.some((s) => lower.includes(s))) {
      out[k] = mask(typeof v === 'string' ? v : '');
    } else if (typeof v === 'string' && (URL_KEYS.includes(lower) || lower.endsWith('_url'))) {
      out[k] = maskUrl(v);
    } else if (typeof v === 'string' && (JID_KEYS.includes(lower) || isJidLike(v))) {
      out[k] = maskJid(v);
    } else if (v && typeof v === 'object') {
      out[k] = safeLog(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

module.exports = { safeLog, mask, maskSecret, maskJid, maskUrl, maskQuery, previewBody };
