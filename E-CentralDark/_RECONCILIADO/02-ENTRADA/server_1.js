// Ponto de entrada do Atendimento WhatsApp Gateway.
// Porta padrão: 3100 (NUNCA usar 3000, que é do Baileys antigo de Recargas Brasil).
require('dotenv').config();
const app = require('./src/app');
const env = require('./src/config/env');
const logger = require('./src/utils/logger');

const port = env.PORT;

app.listen(port, '0.0.0.0', () => {
  logger.info(`[${env.GATEWAY_NAME}] rodando na porta ${port} (env=${env.NODE_ENV})`);
  logger.info(`WuzAPI alvo: ${env.WUZAPI_BASE_URL}`);
});

process.on('unhandledRejection', (err) => {
  logger.error('unhandledRejection', { message: err && err.message });
});
process.on('uncaughtException', (err) => {
  logger.error('uncaughtException', { message: err && err.message });
});
