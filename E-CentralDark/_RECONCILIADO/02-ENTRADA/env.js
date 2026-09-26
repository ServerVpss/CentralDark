// Carrega e valida variáveis de ambiente do Gateway.
const path = require('path');

function required(name, value) {
  if (!value || String(value).trim() === '') {
    console.warn(`[env] AVISO: variável ${name} está vazia.`);
  }
  return value;
}

const env = {
  PORT: parseInt(process.env.PORT || '3100', 10),
  NODE_ENV: process.env.NODE_ENV || 'production',
  GATEWAY_NAME: process.env.GATEWAY_NAME || 'atendimento-whatsapp-gateway',

  GATEWAY_SERVER_TOKEN: required('GATEWAY_SERVER_TOKEN', process.env.GATEWAY_SERVER_TOKEN),

  ATENDIMENTO_WEBHOOK_URL: process.env.ATENDIMENTO_WEBHOOK_URL || '',
  ATENDIMENTO_WEBHOOK_SECRET: process.env.ATENDIMENTO_WEBHOOK_SECRET || '',

  WUZAPI_BASE_URL: process.env.WUZAPI_BASE_URL || 'http://127.0.0.1:8081',
  WUZAPI_ADMIN_TOKEN: required('WUZAPI_ADMIN_TOKEN', process.env.WUZAPI_ADMIN_TOKEN),
  WUZAPI_WEBHOOK_SECRET: required('WUZAPI_WEBHOOK_SECRET', process.env.WUZAPI_WEBHOOK_SECRET),

  RATE_LIMIT_MIN_DELAY_MS: parseInt(process.env.RATE_LIMIT_MIN_DELAY_MS || '1500', 10),
  RATE_LIMIT_MAX_PER_MINUTE: parseInt(process.env.RATE_LIMIT_MAX_PER_MINUTE || '20', 10),

  CONNECTION_STORE_PATH: process.env.CONNECTION_STORE_PATH
    ? path.resolve(process.cwd(), process.env.CONNECTION_STORE_PATH)
    : path.resolve(process.cwd(), './data/connections.json'),

  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // Supabase — para salvar eventos em tempo real
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || '',
};

module.exports = env;