// PM2 config do Guardião da Consciência
// Modo travado em 'propor' até 08/07/2026 (10 dias)
module.exports = {
  apps: [{
    name: "guardiao-consciencia",
    script: "guardiao.py",
    interpreter: "/root/CentralDark/infra/guardiao/.venv/bin/python",
    cwd: "/root/CentralDark/infra/guardiao",
    env: {
      GUARDIAO_MODO: "propor",
      LOG_LEVEL: "INFO",
      // CENTRALDARK_MCP_TOKEN e NOTIFY_API_KEY vêm de /etc/centraldark/notify.env via run.sh
    },
    max_memory_restart: "120M",
    autorestart: true,
    restart_delay: 5000,
    out_file: "/root/CentralDark/infra/guardiao/logs/pm2-out.log",
    error_file: "/root/CentralDark/infra/guardiao/logs/pm2-error.log",
  }]
};
