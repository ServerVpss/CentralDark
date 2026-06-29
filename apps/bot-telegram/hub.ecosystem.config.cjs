// PM2 — Hub Central @srver1bot
// Iniciar: pm2 start apps/bot-telegram/hub.ecosystem.config.cjs
// Salvar:  pm2 save
module.exports = {
  apps: [{
    name:           'CentralDark-HubBot',
    script:         './hub-adm.cjs',
    cwd:            __dirname,
    instances:      1,
    autorestart:    true,
    max_restarts:   10,
    restart_delay:  3000,
    watch:          false,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file:     '/var/log/centraldark-hub-error.log',
    out_file:       '/var/log/centraldark-hub-out.log',
  }],
};
