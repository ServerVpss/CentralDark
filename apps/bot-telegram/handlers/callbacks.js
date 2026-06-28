// Handlers de callback queries (botões pressionados)
const messages = require('../services/messages');

module.exports = {
  async callbackHandler({ type, data, chatId, messageId }) {
    if (type !== 'callback') return null;

    const [prefix, action] = (data || '').split(':');

    if (prefix === 'cmd') {
      switch (action) {
        case 'status':
          await messages.editMessage(chatId, messageId,
            '📊 <b>Status do Sistema</b>\n\n✅ Bot online\n⏰ ' + new Date().toLocaleString('pt-BR'),
            [[{ text: '🔙 Menu', callback_data: 'cmd:start' }]]
          );
          return { handled: true };

        case 'integracoes':
          await messages.editMessage(chatId, messageId,
            '🔌 <b>Integrações</b>\n\nIntegrações disponíveis no sistema:',
            [
              [{ text: '📨 Telegram', callback_data: 'int:telegram' }, { text: '📱 WhatsApp', callback_data: 'int:whatsapp' }],
              [{ text: '🤖 IA Central', callback_data: 'int:ai' }, { text: '💰 Pagamentos', callback_data: 'int:payments' }],
              [{ text: '📊 Monitor', callback_data: 'int:monitor' }, { text: '🚀 GitHub', callback_data: 'int:github' }],
              [{ text: '🔙 Menu', callback_data: 'cmd:start' }],
            ]
          );
          return { handled: true };

        case 'skills':
          await messages.editMessage(chatId, messageId,
            '⚡ <b>Skills</b>\n\nSelecione uma categoria:',
            [
              [{ text: '💬 Comunicação', callback_data: 'skills:communication' }],
              [{ text: '🤖 IA', callback_data: 'skills:ai' }],
              [{ text: '⚡ Automação', callback_data: 'skills:automation' }],
              [{ text: '💰 Pagamentos', callback_data: 'skills:payments' }],
              [{ text: '📊 Monitoramento', callback_data: 'skills:monitoring' }],
              [{ text: '🔙 Menu', callback_data: 'cmd:start' }],
            ]
          );
          return { handled: true };

        case 'help':
          await messages.editMessage(chatId, messageId,
            '❓ <b>Ajuda</b>\n\n/start — Menu principal\n/status — Status\n/skills — Skills\n/help — Ajuda',
            [[{ text: '🔙 Menu', callback_data: 'cmd:start' }]]
          );
          return { handled: true };

        case 'start':
          await messages.editMessage(chatId, messageId,
            '🤖 <b>MultiZap Bot</b>\n\nEscolha uma opção:',
            [
              [{ text: '📊 Status', callback_data: 'cmd:status' }, { text: '🔌 Integrações', callback_data: 'cmd:integracoes' }],
              [{ text: '⚡ Skills', callback_data: 'cmd:skills' }, { text: '❓ Ajuda', callback_data: 'cmd:help' }],
            ]
          );
          return { handled: true };
      }
    }

    return null;
  },
};
