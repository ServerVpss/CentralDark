// Configuração PM2 — processo isolado, NÃO interfere no whatsapp-server (Recargas Brasil).
module.exports = {
  apps: [
    {
      name: 'atendimento-whatsapp-gateway',
      script: './server.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
      out_file: './logs/out.log',
      error_file: './logs/err.log',
      merge_logs: true,
      time: true,
    },
  ],
};
