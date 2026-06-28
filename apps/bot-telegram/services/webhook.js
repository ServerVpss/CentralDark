// Serviço de webhook Telegram (receptor de updates)
const config = require('../config');
const messages = require('./messages');

module.exports = {
  async setWebhook(url) {
    const res = await fetch(`${config.API_BASE}/bot${config.BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    return res.json();
  },

  async deleteWebhook() {
    const res = await fetch(`${config.API_BASE}/bot${config.BOT_TOKEN}/deleteWebhook`);
    return res.json();
  },

  async handleUpdate(update, handlers = []) {
    const chatId = update.message?.chat?.id || update.callback_query?.message?.chat?.id;
    if (!chatId) return { ok: true };

    // Callback query (botão pressionado)
    if (update.callback_query) {
      await messages.answerCallbackQuery(update.callback_query.id);
      for (const handler of handlers) {
        try {
          const result = await handler({
            type: 'callback',
            chatId,
            data: update.callback_query.data,
            messageId: update.callback_query.message?.message_id,
            from: update.callback_query.from,
            update,
          });
          if (result?.reply) {
            await messages.sendMessage(chatId, result.reply);
          }
          if (result?.handled) break;
        } catch (err) {
          console.error(`[Telegram] Handler erro: ${err.message}`);
        }
      }
      return { ok: true };
    }

    // Mensagem de texto
    if (update.message?.text) {
      for (const handler of handlers) {
        try {
          const result = await handler({
            type: 'message',
            chatId,
            text: update.message.text,
            from: update.message.from,
            update,
          });
          if (result?.reply) {
            await messages.sendMessage(chatId, result.reply);
          }
          if (result?.menu) {
            await messages.sendInlineKeyboard(chatId, result.menu.text, result.menu.buttons);
          }
          if (result?.handled) break;
        } catch (err) {
          console.error(`[Telegram] Handler erro: ${err.message}`);
        }
      }
      return { ok: true };
    }

    return { ok: true };
  },
};
