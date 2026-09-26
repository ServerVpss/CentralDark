// Camada fina para registrar eventos importantes (futuro: enviar para Postgres do CRM).
const logger = require('../utils/logger');

function event(name, meta) {
  logger.info(`event:${name}`, meta);
}

module.exports = { event };
