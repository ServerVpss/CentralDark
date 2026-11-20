export default {
  apps: [
    {
      name: "graph-panel",
      script: "server.js",
      cwd: "/root/CentralDark/apps/modulos/graph-panel",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: "3030"
      },
      max_memory_restart: "300M",
      out_file: "logs/pm2-out.log",
      error_file: "logs/pm2-error.log",
      merge_logs: true,
      time: true
    }
  ]
};
