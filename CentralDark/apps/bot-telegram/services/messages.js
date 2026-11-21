// Serviço de mensagens Telegram
const config = require('../config');

const API = () => `${config.API_BASE}/bot${config.BOT_TOKEN}`;

async function apiCall(method, body) {
  const res = await fetch(`${API()}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data.ok ? data.result : null;
}

module.exports = {
  async getMe() {
    return apiCall('getMe', {});
  },

  async sendMessage(chatId, text, parseMode = 'HTML') {
    return apiCall('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: true,
    });
  },

  async sendInlineKeyboard(chatId, text, buttons) {
    return apiCall('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: buttons },
    });
  },

  async answerCallbackQuery(callbackQueryId, text) {
    return apiCall('answerCallbackQuery', {
      callback_query_id: callbackQueryId,
      text,
    });
  },

  async editMessage(chatId, messageId, text, buttons) {
    const body = {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
    };
    if (buttons) body.reply_markup = { inline_keyboard: buttons };
    return apiCall('editMessageText', body);
  },

  async deleteMessage(chatId, messageId) {
    return apiCall('deleteMessage', { chat_id: chatId, message_id: messageId });
  },

  async sendPhoto(chatId, photoUrl, caption) {
    return apiCall('sendPhoto', {
      chat_id: chatId,
      photo: photoUrl,
      caption,
      parse_mode: 'HTML',
    });
  },
};
