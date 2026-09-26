// PM2 do listener MultiZap — escuta webhook do GitHub na porta 9002.
// ISOLADO do github-webhook do Recargas (porta 9001).
module.exports = {
  apps: [
    {
      name: 'MultiZap-GitHub-Webhook',
      script: '/root/multizap-github-webhook-listener.js',
      autorestart: true,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        MULTIZAP_WEBHOOK_PORT: '9002',
        // MULTIZAP_GITHUB_WEBHOOK_SECRET deve ser definido fora (/etc/environment ou pm2 set).
      },
      out_file: '/var/log/multizap-webhook.out.log',
      error_file: '/var/log/multizap-webhook.err.log',
      time: true,
    },
  ],
};
