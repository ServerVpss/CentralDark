// Sanitiza objetos antes de logar — nunca expõe tokens/secrets completos.
const SENSITIVE_KEYS = [
  'token', 'secret', 'authorization', 'auth', 'password', 'apikey', 'api_key',
  'wuzapi_admin_token', 'gateway_server_token', 'wuzapi_webhook_secret',
  'atendimento_webhook_secret',
];

function mask(value) {
  if (typeof value !== 'string') return '[REDACTED]';
  if (value.length <= 6) return '***';
  return `${value.slice(0, 3)}…${value.slice(-3)}`;
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
    } else if (v && typeof v === 'object') {
      out[k] = safeLog(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

module.exports = { safeLog, mask };
