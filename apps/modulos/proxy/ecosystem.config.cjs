module.exports = {
  apps: [{
    name: "CentralDark-ArsenalProxy",
    script: "/root/CentralDark/apps/modulos/proxy/start.sh",
    cwd: "/root/CentralDark/apps/modulos/proxy",
    autorestart: true,
    max_restarts: 20,
    out_file: "/root/CentralDark/apps/modulos/proxy/logs/out.log",
    error_file: "/root/CentralDark/apps/modulos/proxy/logs/err.log",
    time: true
  }]
};
