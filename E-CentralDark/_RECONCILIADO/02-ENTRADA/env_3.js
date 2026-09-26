// Carrega e valida variáveis de ambiente do Gateway.
const path = require('path');

function required(name, value) {
  if (!value || String(value).trim() === '') {
    // Não derruba o processo em dev; apenas avisa.
    console.warn(`[env] AVISO: variável ${name} está vazia.`);
  }
  return value;
}

const env = {
  PORT: parseInt(process.env.PORT || '3100', 10),
  NODE_ENV: process.env.NODE_ENV || 'production',
  GATEWAY_NAME: process.env.GATEWAY_NAME || 'MultiZap-Gateway',

  MULTIZAP_GATEWAY_TOKEN: required('MULTIZAP_GATEWAY_TOKEN', process.env.MULTIZAP_GATEWAY_TOKEN),

  MULTIZAP_WEBHOOK_URL: process.env.MULTIZAP_WEBHOOK_URL || '',
  MULTIZAP_WEBHOOK_SECRET: process.env.MULTIZAP_WEBHOOK_SECRET || '',

  // URL pública onde este Gateway atende — usada pra montar a callback que a
  // WuzAPI vai chamar quando receber mensagens. Ex.: https://proxy.multizap.dev
  // Em dev/local, pode ficar vazio e a gente usa http://127.0.0.1:PORT.
  GATEWAY_PUBLIC_URL: process.env.GATEWAY_PUBLIC_URL || '',

  WUZAPI_BASE_URL: process.env.WUZAPI_BASE_URL || 'http://127.0.0.1:8081',
  WUZAPI_ADMIN_TOKEN: required('WUZAPI_ADMIN_TOKEN', process.env.WUZAPI_ADMIN_TOKEN),
  WUZAPI_WEBHOOK_SECRET: required('WUZAPI_WEBHOOK_SECRET', process.env.WUZAPI_WEBHOOK_SECRET),

  // Fallback SQL opcional: se setado, o reapplyWebhook pode atualizar a
  // coluna `events` direto na tabela `users` da WuzAPI quando o reset HTTP
  // não conseguir popular os eventos. Formato: postgres://user:pass@host/db
  // Mantém vazio em produção até o operador habilitar explicitamente.
  WUZAPI_DB_URL: process.env.WUZAPI_DB_URL || '',

  RATE_LIMIT_MIN_DELAY_MS: parseInt(process.env.RATE_LIMIT_MIN_DELAY_MS || '1500', 10),
  RATE_LIMIT_MAX_PER_MINUTE: parseInt(process.env.RATE_LIMIT_MAX_PER_MINUTE || '20', 10),

  CONNECTION_STORE_PATH: process.env.CONNECTION_STORE_PATH
    ? path.resolve(process.cwd(), process.env.CONNECTION_STORE_PATH)
    : path.resolve(process.cwd(), './data/connections.json'),

  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

module.exports = env;
