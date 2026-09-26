# OUTRO - ecosystem.config.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\bot\server\src\bridge\ecosystem.config.js
**SHA:** 4cf01d326853d7ad
**Timestamp:** 2026-08-26T19:30:53.597356
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- autorestart: true,

### Ouro Bruto (primeiros 5000 chars)
```
// PM2 config para o Supabase Sync Bridge
// Carrega envs de /root/Multizap/secrets/wabot.env automaticamente
// NÃO usar pm2 restart all
module.exports = {
  apps: [{
    name: 'CloneDeck-Supabase-Sync',
    script: './supabase-sync.js',
    cwd: __dirname,
    instances: 1,
    autorestart: true,
    max_restarts: 10,
    watch: false,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: '/var/log/clone-deck-supabase-sync-error.log',
    out_file: '/var/log/clone-deck-supabase-sync-out.log',
  }]
};

```

---

# OUTRO - ecosystem.config.cjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\bot-telegram\ecosystem.config.cjs
**SHA:** 02d52ab9c6000979
**Timestamp:** 2026-08-26T19:31:07.922572
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- autorestart: true,

### Ouro Bruto (primeiros 5000 chars)
```
// PM2 config para o Telegram Bot
// Rodar: pm2 start integracoes/telegram/ecosystem.config.cjs
// NÃO usar pm2 restart all
module.exports = {
  apps: [{
    name: 'MultiZap-TelegramBot',
    script: './bot.cjs',
    cwd: __dirname,
    instances: 1,
    autorestart: true,
    max_restarts: 10,
    watch: false,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: '/var/log/multizap-telegram-bot-error.log',
    out_file: '/var/log/multizap-telegram-bot-out.log',
  }]
};

```

---

# OUTRO - ecosystem.config.cjs
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\multizap-gateway-deploy\deploy-hooks\ecosystem.config.cjs
**SHA:** 2470431519fce57f
**Timestamp:** 2026-08-26T19:39:40.705441
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- autorestart: true,
- max_memory_restart: '200M',

### Ouro Bruto (primeiros 5000 chars)
```
// PM2 do listener MultiZap — escuta webhook do GitHub na porta 9002.
// ISOLADO do github-webhook do Recargas (porta 9001).
module.exports = {
  apps: [
    {
      name: 'MultiZap-GitHub-Webhook',
      script: '/root/multizap-github-webhook-listener.js',
      autorestart: true,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        MULTIZAP_WEBHOOK_PORT: '9002',
        // MULTIZAP_GITHUB_WEBHOOK_SECRET deve ser definido fora (/etc/environment ou pm2 set).
      },
      out_file: '/var/log/multizap-webhook.out.log',
      error_file: '/var/log/multizap-webhook.err.log',
      time: true,
    },
  ],
};

```

---

# OUTRO - ecosystem.config.cjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\lovable-proxy\ecosystem.config.cjs
**SHA:** 9c7127736538b40f
**Timestamp:** 2026-08-28T02:54:38.598600
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- autorestart: true, max_restarts: 20, time: true,

### Ouro Bruto (primeiros 5000 chars)
```
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

```

---

# OUTRO - ecosystem.config.cjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\arsenal-openai-adapter\ecosystem.config.cjs
**SHA:** c38fa8593f48f096
**Timestamp:** 2026-08-28T02:56:07.234419
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- autorestart: true,
- max_memory_restart: '200M',

### Ouro Bruto (primeiros 5000 chars)
```
module.exports = {
  apps: [{
    name: 'CentralDark-ArsenalAdapter',
    script: 'server.mjs',
    cwd: '/root/CentralDark/apps/modulos/arsenal-openai-adapter',
    env: {
      PORT: 8090,
      BIND: '0.0.0.0',
      ARSENAL_ADAPTER_KEY: 'cdk_live_UW_-Ad10vjqkFOcVYtUry2nrwhKAdE9L7lMUEesDktE',
      PROVIDER_BASE: 'https://routellm.abacus.ai/v1',
      PROVIDER_KEY: process.env.ABACUS_API_KEY || 's2_788c5996109b4608b18c472c7dc2ed9c',
      REGRAS_PATH: '/root/CentralDark/docs/CONSCIENCIA/ARSENAL/regras.json',
      // === PR#2 Shadow Bootstrap ===
      AUTH_ENFORCE: 'shadow',            // shadow (loga só) | enforce (bloqueia)
      HUB_SUPABASE_URL: process.env.HUB_SUPABASE_URL,
      HUB_SUPABASE_SERVICE_ROLE_KEY: process.env.HUB_SUPABASE_SERVICE_ROLE_KEY,
      AUDIT_IP_SALT: 'centraldark-hub-2026',
    },
    autorestart: true,
    max_memory_restart: '200M',
    error_file: '/var/log/arsenal-adapter-err.log',
    out_file: '/var/log/arsenal-adapter-out.log',
    time: true,
  }],
};

```

---

# OUTRO - ecosystem.config.cjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\graph-panel\ecosystem.config.cjs
**SHA:** f38cd67308eed76a
**Timestamp:** 2026-08-28T02:56:24.537272
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- max_memory_restart: "300M",

### Ouro Bruto (primeiros 5000 chars)
```
module.exports = {
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

```

---

# OUTRO - ecosystem.config.cjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\pivete-sync\ecosystem.config.cjs
**SHA:** 3fdd303ddeca8545
**Timestamp:** 2026-08-28T02:56:39.584913
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- autorestart: true,

### Ouro Bruto (primeiros 5000 chars)
```
module.exports = {
  apps: [
    {
      name: 'CentralDark-PiveteSync',
      script: '/root/CentralDark/apps/modulos/pivete-sync/pivete-sync.mjs',
      interpreter: 'node',
      node_args: ['-r', 'dotenv/config'],
      autorestart: true,
      max_restarts: 20,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PIVETE_SYNC_INTERVALO_MS: '300000',
      },
      out_file: '/root/CentralDark/logs/pivete-sync-out.log',
      error_file: '/root/CentralDark/logs/pivete-sync-err.log',
      merge_logs: true,
      time: true,
    },
  ],
};

```

---

# OUTRO - ecosystem.config.cjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\proxy\ecosystem.config.cjs
**SHA:** 278f1f61d8ff3976
**Timestamp:** 2026-08-28T02:56:39.696679
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- autorestart: true,

### Ouro Bruto (primeiros 5000 chars)
```
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

```

---

# OUTRO - ecosystem.config.cjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\status\ecosystem.config.cjs
**SHA:** c769ff5ad940fe6b
**Timestamp:** 2026-08-28T02:56:40.327204
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- cron_restart: '* * * * *',
- autorestart: false,
- max_memory_restart: '150M',

### Ouro Bruto (primeiros 5000 chars)
```
// PM2 ecosystem — Setor de Inteligência CentralDark
// Cron a cada 60s. Carrega .env local se existir (opcional).
try { require('dotenv').config({ path: __dirname + '/.env' }); } catch(e){}
module.exports = {
  apps: [{
    name: 'CentralDark-AiDiag',
    script: 'ai-diag-tick.mjs',
    cwd: __dirname,
    interpreter: 'node',
    cron_restart: '* * * * *',
    autorestart: false,
    max_memory_restart: '150M',
    time: true,
    env: {
      LOVABLE_API_KEY: process.env.LOVABLE_API_KEY || '',
      NODE_ENV: 'production',
    },
  }],
};

```

---

# OUTRO - ecosystem.config.cjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\infra\guardiao\ecosystem.config.cjs
**SHA:** 8582d4ca13047bf7
**Timestamp:** 2026-08-28T02:57:25.728710
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- max_memory_restart: "150M",
- autorestart: true,
- max_memory_restart: "120M",
- autorestart: true,

### Ouro Bruto (primeiros 5000 chars)
```
// PM2 config — Guardião (olho) + Analista (cérebro/fila)
// Modo do Guardião travado em 'propor' até 08/07/2026.
module.exports = {
  apps: [
    {
      name: "CentralDark-GuardiaoConsciencia",
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
      name: "CentralDark-GuardiaoAnalista",
      script: "analista/analista.py",
      interpreter: "/root/CentralDark/infra/guardiao/.venv/bin/python",
      cwd: "/root/CentralDark/infra/guardiao",
      env: {
        LOG_LEVEL: "INFO",
        DECISOR_ENABLED: "true", // false reverte ao comportamento antigo (sem filtro)
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

```

---

# OUTRO - ecosystem.config.cjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\contas-admin\ecosystem.config.cjs
**SHA:** 289621874de68197
**Timestamp:** 2026-08-28T02:57:34.812563
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- autorestart: true, max_memory_restart: '400M',

### Ouro Bruto (primeiros 5000 chars)
```
module.exports = { apps: [{
  name: 'CentralDark-ContasAdmin',
  cwd: '/root/CentralDark/scripts/contas-admin',
  script: 'venv/bin/uvicorn',
  args: 'main:app --host 127.0.0.1 --port 9400',
  interpreter: 'none',
  env_file: '/root/CentralDark/scripts/contas-admin/.env',
  autorestart: true, max_memory_restart: '400M',
  out_file: '/var/log/contas-admin.out.log',
  error_file: '/var/log/contas-admin.err.log'
}]};

```