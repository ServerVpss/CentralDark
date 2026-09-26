// PM2 — @Guardiaonotify_bot (segurança total + OAuth X/Grok no próprio bot)
// Iniciar: pm2 start apps/bot-telegram/guardiao.ecosystem.config.cjs
// Salvar:  pm2 save
module.exports = {
  apps: [{
    name:            'CentralDark-GuardiaoBot',
    script:          './guardiao-security-bot.cjs',
    cwd:             __dirname,
    instances:       1,
    autorestart:     true,
    max_restarts:    10,
    restart_delay:   3000,
    watch:           false,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file:      '/var/log/centraldark-guarda/bot-error.log',
    out_file:        '/var/log/centraldark-guarda/bot-out.log',
    env: {
      GROK_BIN:       '/root/.grok/bin/grok',
      GROK_AUTH_FILE: '/root/.grok/auth.json',
    },
  }],
};
