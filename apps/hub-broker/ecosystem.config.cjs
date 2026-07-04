// PM2 config do hub-broker
module.exports = {
  apps: [
    {
      name: "CentralDark-HubBroker",
      script: "server.mjs",
      cwd: "/root/CentralDark/apps/hub-broker",
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "256M",
      env: {
        NODE_ENV: "production",
        HUB_BROKER_PORT: "8790",
      },
    },
  ],
};
