module.exports = {
  apps: [{
    name: 'CentralDark-ArsenalAdapter',
    script: 'server.mjs',
    cwd: '/root/CentralDark/apps/modulos/arsenal-openai-adapter',
    env: {
      PORT: 8090,
      BIND: '0.0.0.0',
      ARSENAL_ADAPTER_KEY: 'cdk_live_UW_-Ad10vjqkFOcVYtUry2nrwhKAdE9L7lMUEesDktE',
      PROVIDER_BASE: 'https://routellm.abacus.ai/v1',
      PROVIDER_KEY: process.env.ABACUS_API_KEY || 's2_788c5996109b4608b18c472c7dc2ed9c',
      REGRAS_PATH: '/root/CentralDark/docs/CONSCIENCIA/ARSENAL/regras.json',
      // === PR#2 Shadow Bootstrap ===
      AUTH_ENFORCE: 'shadow',            // shadow (loga só) | enforce (bloqueia)
      HUB_SUPABASE_URL: process.env.HUB_SUPABASE_URL,
      HUB_SUPABASE_SERVICE_ROLE_KEY: process.env.HUB_SUPABASE_SERVICE_ROLE_KEY,
      AUDIT_IP_SALT: 'centraldark-hub-2026',
    },
    autorestart: true,
    max_memory_restart: '200M',
    error_file: '/var/log/arsenal-adapter-err.log',
    out_file: '/var/log/arsenal-adapter-out.log',
    time: true,
  }],
};
