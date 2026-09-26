# MISSAO - housekeeping.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\.github\workflows\housekeeping.yml
**SHA:** 8d58e46180b91784
**Timestamp:** 2026-08-26T19:31:26.581614
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: Housekeeping (limpeza automática)

# Roda todo dia às 02:00 UTC (23h BRT) e pode ser disparado manualmente.
# Objetivo: manter o repositório sempre organizado sem trabalho manual.
#  - Marca PRs parados há 14 dias como "stale"; fecha após 21 dias.
#  - Apaga branches já mergeados na main.
#  - Apaga branches órfãos (codex/*, lovable-backup-*, edit/edt-*,
#    auto/*, diagnostics/*) sem atividade há 30+ dias.
#  - NUNCA toca em main, tags, releases ou branches com PR aberto recente.

on:
  schedule:
    - cron: '0 2 * * *'
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write
  issues: write

env:
  FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: "true"

jobs:
  stale-prs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/stale@v9
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          days-before-pr-stale: 14
          days-before-pr-close: 7
          days-before-issue-stale: -1
          days-before-issue-close: -1
          stale-pr-label: 'stale'
          stale-pr-message: 'PR sem atividade há 14 dias. Será fechado em 7 dias se ninguém comentar ou enviar commit.'
          close-pr-message: 'Fechado automaticamente por inatividade. Reabra a qualquer momento se ainda for relevante.'
          exempt-pr-labels: 'keep,wip,blocked'

  delete-merged-branches:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0
      - name: Apagar branches já mergeados na main
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          set -e
          git fetch --all --prune
          for b in $(git branch -r --merged origin/main | grep -v 'origin/main$' | grep -v 'HEAD' | sed 's|origin/||'); do
            echo "Apagando branch mergeada: $b"
            git push origin --delete "$b" || true
          done

  delete-stale-orphans:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0
      - name: Apagar branches órfãs antigas (30+ dias sem atividade)
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          set -e
          git fetch --all --prune
          # Branches com PR aberto NÃO podem ser apagadas.
          OPEN_PR_BRANCHES=$(gh pr list --state open --json headRefName -q '.[].headRefName' | sort -u)
          CUTOFF=$(date -u -d '30 days ago' +%s)
          PATTERNS='^(codex/|lovable-backup-|edit/edt-|auto/|diagnostics/|chore/vps-)'
          for b in $(git for-each-ref --format='%(refname:short)' refs/remotes/origin | sed 's|origin/||' | grep -E "$PATTERNS" || true); do
            [ "$b" = "main" ] && continue
            if echo "$OPEN_PR_BRANCHES" | grep -qx "$b"; then
              echo "Preservando $b (tem PR aberto)"
              continue
            fi
            LAST=$(git log -1 --format=%ct "origin/$b" 2>/dev/null || echo 0)
            if [ "$LAST" -lt "$CUTOFF" ]; then
              echo "Apagando órfã antiga: $b (último commit $(date -u -d @$LAST +%F))"
              git push origin --delete "$b" || true
            fi
          done

```

---

# MISSAO - housekeeping.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\.github\workflows\housekeeping.yml
**SHA:** 9cbc1234fa33a8e2
**Timestamp:** 2026-08-26T19:33:13.349442
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: housekeeping.yml manual

on:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  manual_only:
    name: Manual only
    runs-on: ubuntu-latest
    steps:
      - name: Workflow desativado no push
        shell: bash
        run: |
          echo "Workflow tornado manual-only."
          echo "Arquivo: housekeeping.yml"
          echo "Motivo: limpeza dos workflows vermelhos e pausa de automações antigas."
          echo "Este workflow não roda mais em push."

```