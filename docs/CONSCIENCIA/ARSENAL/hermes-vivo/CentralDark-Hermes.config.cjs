// Configuração PM2 do daemon Hermes-Vivo
// Segredos (DARKAI_ANON_KEY, ELITE_ANTHROPIC_TOKEN) NÃO ficam aqui — passe via
// env do sistema, arquivo .env fora do repo, ou `pm2 start ... --env production`.
module.exports = {
  apps: [{
    name: 'CentralDark-Hermes',
    script: '/root/CentralDark/docs/CONSCIENCIA/ARSENAL/hermes-vivo/daemon.mjs',
    cwd: '/root/CentralDark',
    interpreter: 'node',
    autorestart: true,
    max_restarts: 20,
    restart_delay: 5000,
    max_memory_restart: '400M',
    error_file: '/root/.pm2/logs/CentralDark-Hermes-err.log',
    out_file:   '/root/.pm2/logs/CentralDark-Hermes-out.log',
    merge_logs: true,
    time: true,
    env: {
      NODE_ENV: 'production',
      DARKAI_URL: 'https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/ai-proxy',
      // DARKAI_ANON_KEY: injete via ambiente (chave pública, mas fora do repo por higiene)
      // ELITE_ANTHROPIC_TOKEN: injete via ambiente (SECRETO — nunca commitar)
      PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
    }
  }]
};
