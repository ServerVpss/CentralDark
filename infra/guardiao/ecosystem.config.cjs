// PM2 config — Guardião (olho) + Analista (cérebro/fila)
// Modo do Guardião travado em 'propor' até 08/07/2026.
module.exports = {
  apps: [
    {
      name: "guardiao-consciencia",
      script: "guardiao.py",
      interpreter: "/root/CentralDark/infra/guardiao/.venv/bin/python",
      cwd: "/root/CentralDark/infra/guardiao",
      env: {
        GUARDIAO_MODO: "propor",
        LOG_LEVEL: "INFO",
        // CENTRALDARK_MCP_TOKEN e NOTIFY_API_KEY vêm de /etc/centraldark/notify.env via run.sh
      },
      max_memory_restart: "150M",
      autorestart: true,
      restart_delay: 5000,
      out_file: "/root/CentralDark/infra/guardiao/logs/pm2-out.log",
      error_file: "/root/CentralDark/infra/guardiao/logs/pm2-error.log",
    },
    {
      name: "guardiao-analista",
      script: "analista/analista.py",
      interpreter: "/root/CentralDark/infra/guardiao/.venv/bin/python",
      cwd: "/root/CentralDark/infra/guardiao",
      env: {
        LOG_LEVEL: "INFO",
        // NOTIFY_API_KEY vem de /etc/centraldark/notify.env via run.sh
      },
      max_memory_restart: "120M",
      autorestart: true,
      restart_delay: 5000,
      out_file: "/root/CentralDark/infra/guardiao/logs/analista-out.log",
      error_file: "/root/CentralDark/infra/guardiao/logs/analista-error.log",
    },
  ],
};
