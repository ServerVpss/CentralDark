// ecosystem.config.example.js — Ecosystem PM2 canônico da CentralDark
// Copie este arquivo para ecosystem.config.js na VPS e preencha os caminhos
// e variáveis de ambiente reais. NUNCA commite ecosystem.config.js no git,
// pois ele contém paths absolutos e pode conter segredos.
//
// Padrão de nomenclatura: CentralDark-<PascalCase>
// Documentação: .claude/prompts/pm2-ecosystem-canonico.md

module.exports = {
  apps: [
    {
      name: "CentralDark-Zentinel",
      script: "./scripts/sentinela/run.mjs",
      cwd: "/root/CentralDark",
      interpreter: "node",
      exec_mode: "fork_mode",
      instances: 1,
      env: { NODE_ENV: "production" },
    },
    {
      name: "CentralDark-MultiZap",
      // TODO: preencher após localizar o entrypoint real do MultiZap
      script: "./PREENCHER/multizap/index.js",
      cwd: "/root/CentralDark",
      interpreter: "node",
      exec_mode: "fork_mode",
    },
    {
      name: "CentralDark-BotServer",
      script: "./apps/bot-server/start.sh",
      cwd: "/root/CentralDark/apps/bot-server",
      interpreter: "bash",
      exec_mode: "fork_mode",
    },
    {
      name: "CentralDark-WebhookDeploy",
      script: "./scripts/webhook/github-webhook-deploy.mjs",
      cwd: "/root/CentralDark",
      interpreter: "node",
      exec_mode: "fork_mode",
    },
    {
      name: "CentralDark-CloneDeck",
      // TODO: preencher após localizar o entrypoint real do CloneDeck/CRM
      script: "./PREENCHER/clonedeck/index.js",
      cwd: "/root/CentralDark",
      interpreter: "bash",
      exec_mode: "fork_mode",
    },
    {
      name: "CentralDark-EliteWS",
      // TODO: preencher após localizar o entrypoint real do Elite WS Gateway
      script: "./PREENCHER/elite-ws/index.js",
      cwd: "/root/CentralDark",
      interpreter: "node",
      exec_mode: "fork_mode",
      instances: 1,
    },
    {
      name: "CentralDark-EliteHTTP",
      // TODO: preencher após localizar o entrypoint real do Elite HTTP Gateway
      script: "./PREENCHER/elite-http/index.js",
      cwd: "/root/CentralDark",
      exec_mode: "fork_mode",
      instances: 1,
    },
    {
      name: "CentralDark-HubBot",
      script: "./apps/bot-telegram/unified-bot.cjs",
      cwd: "/root/CentralDark/apps/bot-telegram",
      interpreter: "/usr/bin/node",
      exec_mode: "cluster_mode",
      instances: 1,
    },
    {
      name: "CentralDark-GuardiaoConsciencia",
      script: "./infra/guardiao/guardiao.py",
      cwd: "/root/CentralDark/infra/guardiao",
      interpreter: "python3",
      exec_mode: "fork_mode",
      instances: 1,
    },
    {
      name: "CentralDark-GuardiaoAnalista",
      script: "./infra/guardiao/analista/analista.py",
      cwd: "/root/CentralDark/infra/guardiao",
      interpreter: "python3",
      exec_mode: "fork_mode",
      instances: 1,
    },
    {
      name: "CentralDark-ContasAdmin",
      script: "./scripts/contas-admin/venv/bin/uvicorn",
      cwd: "/root/CentralDark/scripts/contas-admin",
      interpreter: "none",
      exec_mode: "fork_mode",
      instances: 1,
    },
    {
      name: "CentralDark-Respiracao",
      script: "./scripts/vps-reporter.js",
      cwd: "/root/CentralDark",
      interpreter: "node",
      exec_mode: "fork_mode",
      instances: 1,
    },
    {
      name: "CentralDark-MCP",
      script: "./apps/modulos/mcp/dist/index.js",
      cwd: "/root/CentralDark/apps/modulos/mcp",
      interpreter: "node",
      exec_mode: "fork_mode",
      instances: 1,
    },
    {
      name: "CentralDark-TelePainelDeploy",
      script: "./scripts/webhook/telepainel-deploy.mjs",
      cwd: "/root/CentralDark/scripts/webhook",
      interpreter: "/usr/bin/node",
      exec_mode: "fork_mode",
      instances: 1,
    },
    {
      name: "CentralDark-EvolucaoIAs",
      script: "./apps/bot-telegram/evolucao-ias.cjs",
      cwd: "/root/CentralDark",
      interpreter: "/usr/bin/node",
      exec_mode: "fork_mode",
      instances: 1,
    },
    {
      name: "CentralDark-SyncDrive",
      script: "./scripts/sync-loop.sh",
      cwd: "/root/CentralDark",
      interpreter: "bash",
      exec_mode: "fork_mode",
      instances: 1,
    },
    {
      name: "CentralDark-EliteAnthropic",
      script: "./apps/modulos/elite-anthropic-proxy/start.sh",
      cwd: "/root/CentralDark/apps/modulos/elite-anthropic-proxy",
      interpreter: "bash",
      exec_mode: "fork_mode",
      instances: 1,
    },
    {
      name: "CentralDark-GraphPanel",
      script: "./apps/modulos/graph-panel/server.js",
      cwd: "/root/CentralDark/apps/modulos/graph-panel",
      interpreter: "node",
      exec_mode: "fork_mode",
      instances: 1,
    },
  ],
};
