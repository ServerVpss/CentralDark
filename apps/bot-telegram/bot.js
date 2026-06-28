/**
 * Telegram Bot — Módulo principal
 * 
 * Interface padrão: init(), start(), stop(), status(), healthCheck()
 * NÃO inicia automaticamente. NÃO expõe tokens.
 * 
 * Funcionalidades:
 * - Envio de alertas (fire-and-forget)
 * - Bot conversacional (webhook receptor)
 * - Menus interativos dinâmicos
 * - Integração com Skills
 */

const config = require('./config');
const alertService = require('./services/alerts');
const messageService = require('./services/messages');
const webhookService = require('./services/webhook');

let _state = 'stopped'; // stopped | starting | running | error
let _botInfo = null;
let _handlers = [];

const bot = {
  name: 'telegram',
  version: '1.0.0',
  description: 'Bot Telegram completo: alertas, conversacional, menus, skills',

  // Configurar (não inicia)
  init(customConfig = {}) {
    Object.assign(config, customConfig);
    if (!config.isConfigured()) {
      console.warn('[Telegram] TELEGRAM_BOT_TOKEN ou TELEGRAM_ALERTS_CHAT_ID não configurados');
      return { ok: false, error: 'Não configurado' };
    }
    _state = 'stopped';
    return { ok: true };
  },

  // Registrar handler de mensagens
  onMessage(handler) {
    _handlers.push(handler);
  },

  // Iniciar bot
  async start() {
    if (_state === 'running') return { ok: true, message: 'Já rodando' };
    _state = 'starting';

    try {
      _botInfo = await messageService.getMe();
      if (!_botInfo) throw new Error('Não conseguiu conectar ao Telegram');

      // Se tem webhook URL, configurar
      if (config.WEBHOOK_URL) {
        await webhookService.setWebhook(config.WEBHOOK_URL);
      }

      _state = 'running';
      console.log(`[Telegram] Bot iniciado: @${_botInfo.username}`);
      return { ok: true, bot: _botInfo };
    } catch (err) {
      _state = 'error';
      console.error(`[Telegram] Erro ao iniciar: ${err.message}`);
      return { ok: false, error: err.message };
    }
  },

  // Parar bot
  async stop() {
    _state = 'stopped';
    _handlers = [];
    console.log('[Telegram] Bot parado');
    return { ok: true };
  },

  // Status atual
  status() {
    return {
      name: this.name,
      state: _state,
      configured: config.isConfigured(),
      bot: _botInfo,
      handlers: _handlers.length,
    };
  },

  // Health check
  async healthCheck() {
    try {
      const me = await messageService.getMe();
      return { ok: Boolean(me), latency: 0, bot: me };
    } catch {
      return { ok: false, latency: -1 };
    }
  },

  // Processar webhook recebido (chamado pelo Express route)
  async handleWebhook(update) {
    return webhookService.handleUpdate(update, _handlers);
  },

  // Atalhos
  sendAlert: alertService.sendAlert,
  sendMessage: messageService.sendMessage,
  sendMenu: messageService.sendInlineKeyboard,
};

module.exports = bot;
