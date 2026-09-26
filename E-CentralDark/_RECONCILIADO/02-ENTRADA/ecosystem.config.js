// PM2 config para o Supabase Sync Bridge
// Carrega envs de /root/Multizap/secrets/wabot.env automaticamente
// NÃO usar pm2 restart all
module.exports = {
  apps: [{
    name: 'CloneDeck-Supabase-Sync',
    script: './supabase-sync.js',
    cwd: __dirname,
    instances: 1,
    autorestart: true,
    max_restarts: 10,
    watch: false,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: '/var/log/clone-deck-supabase-sync-error.log',
    out_file: '/var/log/clone-deck-supabase-sync-out.log',
  }]
};
