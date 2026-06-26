module.exports = {
  apps: [{
    name: "CloneDeck-CRM",
    script: "./start-crm.sh",
    cwd: "/root/Multizap/apps/clone-deck/apps/crm",
    env: {
      NODE_ENV: "production"
    }
  }]
};
