// Configuração do Telegram — server-only
// Tokens vêm do .env da VPS, NUNCA hardcoded

export const TELEGRAM_API = 'https://api.telegram.org';

export function getTelegramConfig() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
  const chatId = process.env.TELEGRAM_ALERTS_CHAT_ID || '';
  const enabled = Boolean(botToken && chatId);

  return { botToken, chatId, enabled };
}

// Variáveis de ambiente necessárias:
// TELEGRAM_BOT_TOKEN     — Token do bot (@BotFather)
// TELEGRAM_ALERTS_CHAT_ID — ID do chat/grupo para alertas
