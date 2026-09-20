module.exports = {
  apps: [
    {
      name: 'CentralDark-PiveteSync',
      script: '/root/CentralDark/apps/modulos/pivete-sync/pivete-sync.mjs',
      interpreter: 'node',
      node_args: ['-r', 'dotenv/config'],
      autorestart: true,
      max_restarts: 20,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PIVETE_SYNC_INTERVALO_MS: '300000',
      },
      out_file: '/root/CentralDark/logs/pivete-sync-out.log',
      error_file: '/root/CentralDark/logs/pivete-sync-err.log',
      merge_logs: true,
      time: true,
    },
  ],
};
