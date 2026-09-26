# MISSAO - painel-vivo.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\.github\workflows\painel-vivo.yml
**SHA:** 9cb4e7a7ebbff805
**Timestamp:** 2026-08-26T19:30:49.923874
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: node CentralDark/apps/projeto-dashboard/atualizar-painel-vivo.mjs
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: painel-vivo

on:
  workflow_dispatch:
    inputs:
      evento:
        description: 'Título do acontecimento'
        required: true
      detalhe:
        description: 'Detalhe em linguagem simples'
        required: false
        default: ''
      area:
        description: 'Área do projeto'
        required: false
        default: 'Projeto'
      geral:
        description: 'Progresso geral 0-100'
        required: false
        default: ''
      marco:
        description: 'Marco para atualizar/criar'
        required: false
        default: ''
      marco_pct:
        description: 'Progresso do marco 0-100'
        required: false
        default: ''
      marco_status:
        description: 'done, doing, next ou later'
        required: false
        default: ''

permissions:
  contents: write

jobs:
  atualizar-painel:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6

      - name: Atualizar painel vivo
        env:
          PAINEL_EVENTO: ${{ inputs.evento }}
          PAINEL_EVENTO_DETALHE: ${{ inputs.detalhe }}
          PAINEL_EVENTO_AREA: ${{ inputs.area }}
          PAINEL_GERAL: ${{ inputs.geral }}
          PAINEL_MARCO: ${{ inputs.marco }}
          PAINEL_MARCO_PCT: ${{ inputs.marco_pct }}
          PAINEL_MARCO_STATUS: ${{ inputs.marco_status }}
        run: node CentralDark/apps/projeto-dashboard/atualizar-painel-vivo.mjs

      - name: Commit painel vivo
        run: |
          git config user.name 'CentralDark Bot'
          git config user.email 'actions@github.com'
          git add -- CentralDark/apps/projeto-dashboard/painel-data.json
          git commit -m "chore(painel): atualizar mapa vivo" || exit 0
          git push

```

---

# MISSAO - painel-vivo.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\.github\workflows\painel-vivo.yml
**SHA:** 781af56058d20108
**Timestamp:** 2026-08-28T02:56:03.674388
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: bash scripts/lupa/writer-safe-push-main.sh

### Ouro Bruto (primeiros 5000 chars)
```
name: painel-vivo

on:
  workflow_dispatch:
    inputs:
      evento:
        description: 'Título do acontecimento'
        required: true
      detalhe:
        description: 'Detalhe em linguagem simples'
        required: false
        default: ''
      area:
        description: 'Área do projeto'
        required: false
        default: 'Projeto'
      geral:
        description: 'Progresso geral 0-100'
        required: false
        default: ''
      marco:
        description: 'Marco para atualizar/criar'
        required: false
        default: ''
      marco_pct:
        description: 'Progresso do marco 0-100'
        required: false
        default: ''
      marco_status:
        description: 'done, doing, next ou later'
        required: false
        default: ''

permissions:
  contents: write

concurrency:
  group: painel-vivo
  cancel-in-progress: false

jobs:
  atualizar-painel:
    runs-on: [self-hosted, Linux]
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v7
        with:
          fetch-depth: 0

      - name: Publicar painel vivo com writer-safe-push
        shell: bash
        env:
          PAINEL_EVENTO: ${{ inputs.evento }}
          PAINEL_EVENTO_DETALHE: ${{ inputs.detalhe }}
          PAINEL_EVENTO_AREA: ${{ inputs.area }}
          PAINEL_GERAL: ${{ inputs.geral }}
          PAINEL_MARCO: ${{ inputs.marco }}
          PAINEL_MARCO_PCT: ${{ inputs.marco_pct }}
          PAINEL_MARCO_STATUS: ${{ inputs.marco_status }}
          ACTOR: ${{ github.actor }}
          SHA: ${{ github.sha }}
          WRITER_TAG: PAINEL_VIVO
          PATHS: apps/modulos/status/painel-data.json
          REGENERATE_CMD: node apps/modulos/status/atualizar-painel-vivo.mjs
          COMMIT_MESSAGE: |
            chore(painel): atualizar mapa vivo

            Co-authored-by: SegredoiDev <segredounlock@users.noreply.github.com>
          GIT_AUTHOR_NAME: CentralDark Bot
          GIT_AUTHOR_EMAIL: actions@github.com
          MAX_TRIES: "3"
        run: bash scripts/lupa/writer-safe-push-main.sh

```