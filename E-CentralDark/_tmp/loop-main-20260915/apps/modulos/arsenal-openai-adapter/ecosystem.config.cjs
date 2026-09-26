const fs = require('node:fs');
const path = require('node:path');

const cwd = '/root/CentralDark/apps/modulos/arsenal-openai-adapter';

function loadLocalEnv(file) {
  const envPath = path.join(cwd, file);
  if (!fs.existsSync(envPath)) return {};
  const out = {};
  for (const rawLine of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const [key, ...rest] = line.split('=');
    out[key.trim()] = rest.join('=').trim();
  }
  return out;
}

const localEnv = loadLocalEnv('.env.local');
const env = key => process.env[key] || localEnv[key];

module.exports = {
  apps: [{
    name: 'CentralDark-ArsenalAdapter',
    script: 'server.mjs',
    cwd,
    env: {
      PORT: 8090,
      BIND: '0.0.0.0',
      ARSENAL_ADAPTER_KEY: env('ARSENAL_ADAPTER_KEY'),
      PROVIDER_BASE: env('PROVIDER_BASE') || 'https://routellm.abacus.ai/v1',
      PROVIDER_KEY: env('ABACUS_API_KEY') || env('PROVIDER_KEY'),
      REGRAS_PATH: '/root/CentralDark/docs/CONSCIENCIA/ARSENAL/regras.json',
      // === PR#2 Shadow Bootstrap ===
      AUTH_ENFORCE: process.env.AUTH_ENFORCE || 'shadow', // shadow (loga só) | enforce (bloqueia)
      HUB_SUPABASE_URL: process.env.HUB_SUPABASE_URL,
      HUB_SUPABASE_SERVICE_ROLE_KEY: process.env.HUB_SUPABASE_SERVICE_ROLE_KEY,
      AUDIT_IP_SALT: env('AUDIT_IP_SALT'),
    },
    autorestart: true,
    max_memory_restart: '200M',
    error_file: '/var/log/arsenal-adapter-err.log',
    out_file: '/var/log/arsenal-adapter-out.log',
    time: true,
  }],
};
