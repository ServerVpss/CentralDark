module.exports = {
  apps: [
    {
      name: "CentralDark-ScreenPipe",
      script: "/root/CentralDark/apps/modulos/screenpipe-launcher.mjs",
      cwd: "/root/CentralDark",
      instances: 1,
      watch: false,
      max_memory_restart: "1024M",
      min_uptime: "10s",
      max_restarts: 10,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: "3030",
        SCREENPIPE_DATA_DIR: "/root/.screenpipe",
        SCREENPIPE_BIN: "/root/CentralDark/node_modules/.bin/screenpipe",
        SCREENPIPE_HEALTH_URL: "http://127.0.0.1:3030/health",
        LOG_LEVEL: "info"
      },
      error_file: "/root/.pm2/logs/screenpipe-error.log",
      out_file: "/root/.pm2/logs/screenpipe-out.log"
    }
  ]
};
