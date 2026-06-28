// Configuração do Telegram — carrega do .env da VPS
// NUNCA hardcoded, NUNCA no frontend

const path = require('path');
try { require('dotenv').config({ path: '/root/CentralDark/secrets/telegram-alerts.env', override: false }); } catch(e) {}
try { require('dotenv').config({ path: path.join(__dirname, '.env'), override: false }); } catch(e) {}

module.exports = {
  BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  ALERTS_CHAT_ID: process.env.TELEGRAM_ALERTS_CHAT_ID || '',
  WEBHOOK_URL: process.env.TELEGRAM_WEBHOOK_URL || '',
  API_BASE: 'https://api.telegram.org',

  isConfigured() {
    return Boolean(this.BOT_TOKEN && this.ALERTS_CHAT_ID);
  },

  // Variáveis necessárias no .env:
  // TELEGRAM_BOT_TOKEN        — Token do @BotFather
  // TELEGRAM_ALERTS_CHAT_ID   — ID do chat/grupo para alertas
  // TELEGRAM_WEBHOOK_URL      — URL pública para receber webhooks (opcional)
};
