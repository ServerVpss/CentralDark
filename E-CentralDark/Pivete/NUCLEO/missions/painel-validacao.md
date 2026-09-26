# MISSAO - painel-validacao.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\.github\workflows\painel-validacao.yml
**SHA:** 141a0d32ba286baf
**Timestamp:** 2026-08-26T19:30:49.935416
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: node scripts/validar-painel-vivo.mjs
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: painel-validacao

# Valida painel-data.json e cada endpoint declarado em liveStatus.
# Gera relatório verde/amarelo/vermelho. Roda daily e sob demanda.

on:
  schedule:
    - cron: '15 8 * * *'  # 05:15 BRT
  workflow_dispatch:
  push:
    paths:
      - 'CentralDark/apps/projeto-dashboard/painel-data.json'
      - 'scripts/validar-painel-vivo.mjs'

permissions:
  contents: write

jobs:
  validar:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: '20'
      - name: Validar
        run: node scripts/validar-painel-vivo.mjs
      - name: Commit relatório
        run: |
          git config user.name 'CentralDark Painel'
          git config user.email 'actions@github.com'
          git add -- docs/RELATORIOS/painel-vivo-validacao 2>/dev/null || true
          git commit -m "chore(painel): validação ${{ github.run_id }}

          Co-authored-by: SegredoiDev <segredounlock@users.noreply.github.com>" || exit 0
          git push || true

```

---

# MISSAO - painel-validacao.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\.github\workflows\painel-validacao.yml
**SHA:** 617fcdb8603f55fa
**Timestamp:** 2026-08-28T02:56:03.670305
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: bash scripts/lupa/writer-safe-push-main.sh

### Ouro Bruto (primeiros 5000 chars)
```
name: painel-validacao

# Valida painel-data.json e cada endpoint declarado em liveStatus.
# Gera relatório verde/amarelo/vermelho. Roda daily e sob demanda.

on:
  schedule:
    - cron: '15 8 * * *'  # 05:15 BRT
  workflow_dispatch:
  push:
    paths:
      - 'apps/modulos/status/painel-data.json'
      - 'scripts/validar-painel-vivo.mjs'
      - '.github/workflows/painel-validacao.yml'

permissions:
  contents: write

concurrency:
  group: painel-validacao
  cancel-in-progress: false

jobs:
  validar:
    runs-on: [self-hosted, Linux]
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v7
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v7
        with:
          node-version: '24'
      - name: Publicar validação com writer-safe-push
        shell: bash
        env:
          WRITER_TAG: PAINEL_VALIDACAO
          PATHS: docs/RELATORIOS/painel-vivo-validacao
          REGENERATE_CMD: node scripts/validar-painel-vivo.mjs
          COMMIT_MESSAGE: |
            chore(painel): validação ${{ github.run_id }}

            Co-authored-by: SegredoiDev <segredounlock@users.noreply.github.com>
          GIT_AUTHOR_NAME: CentralDark Painel
          GIT_AUTHOR_EMAIL: actions@github.com
          MAX_TRIES: "3"
        run: bash scripts/lupa/writer-safe-push-main.sh

```