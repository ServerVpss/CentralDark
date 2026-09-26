# OUTRO - hub.ecosystem.config.cjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\bot-telegram\hub.ecosystem.config.cjs
**SHA:** edfdeb5fc84bab9e
**Timestamp:** 2026-08-28T02:56:06.424248
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- autorestart:    true,

### Ouro Bruto (primeiros 5000 chars)
```
// PM2 — Bot Unificado @srver1bot  (substitui bot.cjs + hub-adm.cjs)
// Iniciar: pm2 start apps/bot-telegram/hub.ecosystem.config.cjs
// Salvar:  pm2 save
module.exports = {
  apps: [{
    name:           'CentralDark-HubBot',
    script:         './unified-bot.cjs',
    cwd:            __dirname,
    instances:      1,
    autorestart:    true,
    max_restarts:   10,
    restart_delay:  3000,
    watch:          false,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file:     '/var/log/centraldark-hub-error.log',
    out_file:       '/var/log/centraldark-hub-out.log',
  }],
};

```