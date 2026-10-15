// PM2 ecosystem — Setor de Inteligência CentralDark
// Cron a cada 60s. Carrega .env local se existir (opcional).
try { require('dotenv').config({ path: __dirname + '/.env' }); } catch(e){}
module.exports = {
  apps: [{
    name: 'CentralDark-AiDiag',
    script: 'ai-diag-tick.mjs',
    cwd: __dirname,
    interpreter: 'node',
    cron_restart: '* * * * *',
    autorestart: false,
    max_memory_restart: '150M',
    time: true,
    env: {
      LOVABLE_API_KEY: process.env.LOVABLE_API_KEY || '',
      NODE_ENV: 'production',
    },
  }],
};
