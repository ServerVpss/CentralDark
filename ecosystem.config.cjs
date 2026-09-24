module.exports = {
  apps: [
    {
      name: "CentralDark-ScreenPipe",
      script: "/root/CentralDark/apps/modulos/screenpipe-launcher.mjs",
      cwd: "/root",
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
        SCREENPIPE_BIN: "screenpipe",
        LOG_LEVEL: "info"
      },
      error_file: "/root/.pm2/logs/screenpipe-error.log",
      out_file: "/root/.pm2/logs/screenpipe-out.log"
    }
  ]
};
