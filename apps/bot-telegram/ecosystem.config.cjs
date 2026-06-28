// PM2 config para o Telegram Bot do CentralDark
// Rodar: pm2 start apps/bot-telegram/ecosystem.config.cjs
module.exports = {
  apps: [{
    name: 'CentralDark-TelegramBot',
    script: './bot.cjs',
    cwd: __dirname,
    instances: 1,
    autorestart: true,
    max_restarts: 10,
    watch: false,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: '/var/log/centraldark-telegram-bot-error.log',
    out_file: '/var/log/centraldark-telegram-bot-out.log',
  }]
};
