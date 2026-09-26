// PM2 config para o Telegram Bot
// Rodar: pm2 start integracoes/telegram/ecosystem.config.cjs
// NÃO usar pm2 restart all
module.exports = {
  apps: [{
    name: 'MultiZap-TelegramBot',
    script: './bot.cjs',
    cwd: __dirname,
    instances: 1,
    autorestart: true,
    max_restarts: 10,
    watch: false,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: '/var/log/multizap-telegram-bot-error.log',
    out_file: '/var/log/multizap-telegram-bot-out.log',
  }]
};
