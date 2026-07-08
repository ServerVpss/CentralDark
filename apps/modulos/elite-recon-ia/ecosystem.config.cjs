require('dotenv').config({ path: __dirname + '/.env' });
module.exports = {
  apps: [{
    name: 'CentralDark-ReconHealth',
    script: './src/health-check.mjs',
    cwd: __dirname,
    interpreter: 'node',
    cron_restart: '*/5 * * * *',
    autorestart: false,
    max_memory_restart: '150M',
    out_file: './logs/health.out.log',
    error_file: './logs/health.err.log',
    time: true,
    env: {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      DARKAI_URL: process.env.DARKAI_URL || 'http://localhost:8891/health',
    },
  }],
};
