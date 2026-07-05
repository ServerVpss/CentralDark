require('dotenv').config({ path: __dirname + '/.env' });
module.exports = {
  apps: [{
    name: 'CentralDark-LovableProxy',
    script: 'index.mjs',
    cwd: __dirname,
    autorestart: true, max_restarts: 20, time: true,
    env: {
      LOVABLE_API_KEY: process.env.LOVABLE_API_KEY || '',
      PORT: process.env.PORT || '3102',
    }
  }]
};
