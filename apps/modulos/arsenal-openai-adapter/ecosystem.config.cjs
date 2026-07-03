module.exports = {
  apps: [{
    name: 'CentralDark-ArsenalAdapter',
    script: 'server.mjs',
    cwd: '/root/CentralDark/apps/modulos/arsenal-openai-adapter',
    env: {
      PORT: 8090,
      ARSENAL_ADAPTER_KEY: 'arsenal-key-local-2026',
      PROVIDER_BASE: 'https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/arsenal-proxy',
      PROVIDER_KEY: 'arsenal-key-local-2026',
      REGRAS_PATH: '/root/CentralDark/docs/CONSCIENCIA/ARSENAL/regras.json',
    },
    autorestart: true,
    max_memory_restart: '200M',
    error_file: '/var/log/arsenal-adapter-err.log',
    out_file: '/var/log/arsenal-adapter-out.log',
    time: true,
  }],
};
