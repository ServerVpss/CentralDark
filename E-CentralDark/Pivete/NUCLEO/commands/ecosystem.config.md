# COMANDO - ecosystem.config.cjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\multizap-gateway-deploy\gateway\ecosystem.config.cjs
**SHA:** 68a0e1adfe83d0a7
**Timestamp:** 2026-08-26T19:31:32.003874
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- autorestart: true,
- max_memory_restart: '500M',

### Ouro Bruto (primeiros 5000 chars)
```
// Configuração PM2 — processo isolado, NÃO interfere no whatsapp-server (Recargas Brasil).
module.exports = {
  apps: [
    {
      name: 'MultiZap-Gateway',
      script: './server.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        TZ: 'America/Sao_Paulo',
      },
      out_file: './logs/out.log',
      error_file: './logs/err.log',
      merge_logs: true,
      // PM2 não prepende timestamp — o logger já imprime o horário local (TZ).
      // Antes (time:true) dava timestamp duplicado e em UTC.
      time: false,
    },
  ],
};

```

---

# COMANDO - ecosystem.config.cjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\apps\crm\atendimento-whatsapp-gateway-deploy\gateway\ecosystem.config.cjs
**SHA:** 5685624b4c88dfe1
**Timestamp:** 2026-08-26T19:33:35.805417
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- autorestart: true,
- max_memory_restart: '500M',

### Ouro Bruto (primeiros 5000 chars)
```
// Configuração PM2 — processo isolado, NÃO interfere no whatsapp-server (Recargas Brasil).
module.exports = {
  apps: [
    {
      name: 'atendimento-whatsapp-gateway',
      script: './server.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
      out_file: './logs/out.log',
      error_file: './logs/err.log',
      merge_logs: true,
      time: true,
    },
  ],
};

```