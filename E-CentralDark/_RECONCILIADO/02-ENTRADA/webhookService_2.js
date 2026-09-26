const env = require('../config/env');
const logger = require('../utils/logger');

module.exports = {
  forwardToAtendimento: async (payload) => {
    const targetUrl = env.ATENDIMENTO_WEBHOOK_URL || env.MULTIZAP_WEBHOOK_URL;
    if (!targetUrl) {
      logger.warn('webhook_forward_skipped', { reason: 'No target URL configured' });
      return;
    }
    // Lógica do Axios iria aqui
  }
};
