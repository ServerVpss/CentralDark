/**
 * Registry — Registro de todas as integrações
 * 
 * Mapeia integração → skills → handlers
 * Usado pelo Hub e pelo Skills Manager para auto-discovery.
 */

module.exports = {
  integrations: [
    {
      name: 'telegram',
      module: './telegram/bot',
      skills: ['telegram-alerts', 'telegram-bot'],
      envVars: ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_ALERTS_CHAT_ID'],
    },
    {
      name: 'whatsapp',
      module: './whatsapp/bot',
      skills: ['whatsapp-wuzapi'],
      envVars: ['WUZAPI_URL', 'WUZAPI_TOKEN'],
    },
    {
      name: 'ai',
      module: './ai/bot',
      skills: ['ai-central', 'ai-assistant'],
      envVars: ['LOVABLE_API_KEY', 'AI_CENTRAL_ENABLED'],
    },
    {
      name: 'monitor',
      module: './monitor/bot',
      skills: ['monitor-heartbeat'],
      envVars: [],
    },
    {
      name: 'payments',
      module: './payments/bot',
      skills: ['pix-payments'],
      envVars: [],
    },
    {
      name: 'github',
      module: './github/bot',
      skills: ['github-deploy'],
      envVars: [],
    },
  ],

  // Verificar quais integrações têm env configurado
  checkEnv() {
    return this.integrations.map(int => ({
      name: int.name,
      configured: int.envVars.every(v => Boolean(process.env[v])),
      missing: int.envVars.filter(v => !process.env[v]),
    }));
  },
};
