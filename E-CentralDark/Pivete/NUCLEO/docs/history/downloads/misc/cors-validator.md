# OUTRO - cors-validator.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\.github\workflows\cors-validator.yml
**SHA:** f5572cb5c7568684
**Timestamp:** 2026-08-26T19:33:21.149096
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: node scripts/checker/cors-validator.mjs

### Ouro Bruto (primeiros 5000 chars)
```
name: CORS Validator

on:
  workflow_dispatch:
  schedule:
    - cron: "17 */6 * * *" # a cada 6h
  push:
    paths:
      - "CentralDark/infra/caddy/**"
      - "CentralDark/apps/bot-server/**"
      - "scripts/checker/cors-validator.mjs"
      - ".github/workflows/cors-validator.yml"

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - name: Rodar validador de CORS
        env:
          API_BASE: https://api.centralldark.com
          ORIGIN: https://bot.centralldark.com
        run: node scripts/checker/cors-validator.mjs

```

---

# OUTRO - cors-validator.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\.github\workflows\cors-validator.yml
**SHA:** 6c8871ad4516a0cc
**Timestamp:** 2026-08-28T02:56:03.173030
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: node scripts/checker/cors-validator.mjs

### Ouro Bruto (primeiros 5000 chars)
```
name: CORS Validator

on:
  workflow_dispatch:
  schedule:
    - cron: "17 6 * * *" # 1x/dia (era a cada 6h — reduzido pra economizar Actions)
  push:
    paths:
      - "CentralDark/infra/caddy/**"
      - "CentralDark/apps/bot-server/**"
      - "scripts/checker/cors-validator.mjs"
      - ".github/workflows/cors-validator.yml"

jobs:
  validate:
    runs-on: [self-hosted, Linux]
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: "24"
      - name: Rodar validador de CORS
        env:
          API_BASE: https://api.centralldark.com
          ORIGIN: https://bot.centralldark.com
        run: node scripts/checker/cors-validator.mjs

```