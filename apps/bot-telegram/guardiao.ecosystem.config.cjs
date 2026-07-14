/** PM2 — @Guardiaonotify_bot (só segurança). Não misturar com HubBot/Hermes. */
module.exports = {
  apps: [
    {
      name: 'CentralDark-GuardiaoBot',
      script: './guardiao-security-bot.cjs',
      cwd: '/root/CentralDark/apps/bot-telegram',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 20,
      min_uptime: '5s',
      time: true,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
