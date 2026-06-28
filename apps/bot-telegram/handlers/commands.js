// Handlers de comandos do Telegram
// Cada handler recebe { type, chatId, text, from, update }
// Retorna { reply, menu, handled }

module.exports = {
  // /start
  startHandler({ type, text, chatId }) {
    if (type !== 'message' || text !== '/start') return null;
    return {
      handled: true,
      menu: {
        text: '🤖 <b>MultiZap Bot</b>\n\nBem-vindo! Escolha uma opção:',
        buttons: [
          [{ text: '📊 Status', callback_data: 'cmd:status' }, { text: '🔌 Integrações', callback_data: 'cmd:integracoes' }],
          [{ text: '⚡ Skills', callback_data: 'cmd:skills' }, { text: '❓ Ajuda', callback_data: 'cmd:help' }],
        ],
      },
    };
  },

  // /status
  statusHandler({ type, text }) {
    if (type !== 'message' || text !== '/status') return null;
    return { handled: true, reply: '📊 <b>Status do Sistema</b>\n\n✅ Bot online\n⏰ ' + new Date().toLocaleString('pt-BR') };
  },

  // /help
  helpHandler({ type, text }) {
    if (type !== 'message' || text !== '/help') return null;
    return {
      handled: true,
      reply: '❓ <b>Comandos disponíveis:</b>\n\n/start — Menu principal\n/status — Status do sistema\n/skills — Listar skills\n/help — Esta ajuda',
    };
  },

  // /skills
  skillsHandler({ type, text }) {
    if (type !== 'message' || text !== '/skills') return null;
    return {
      handled: true,
      menu: {
        text: '⚡ <b>Skills disponíveis</b>\n\nSelecione uma categoria:',
        buttons: [
          [{ text: '💬 Comunicação', callback_data: 'skills:communication' }],
          [{ text: '🤖 IA', callback_data: 'skills:ai' }],
          [{ text: '⚡ Automação', callback_data: 'skills:automation' }],
          [{ text: '💰 Pagamentos', callback_data: 'skills:payments' }],
          [{ text: '📊 Monitoramento', callback_data: 'skills:monitoring' }],
          [{ text: '🔙 Voltar', callback_data: 'cmd:start' }],
        ],
      },
    };
  },
};
