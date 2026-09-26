# COMANDO - linear-pendencias-sync.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\.github\workflows\linear-pendencias-sync.yml
**SHA:** 0228019f221a14de
**Timestamp:** 2026-08-26T19:33:14.408151
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: linear-pendencias-sync

# Sync bidirecional Linear ↔ docs/PENDENCIAS.md
#
# - Roda a cada 30 min e em push que toque PENDENCIAS.md.
# - DRY-RUN no PR (comenta diferenças sem aplicar).
# - APPLY na main (commit + fecha issues sincronizadas no Linear).
# - Requer secret `LINEAR_API_KEY` (Personal API Key com escopo write).

on:
  schedule:
    - cron: "*/30 * * * *"
  push:
    branches: [main]
    paths:
      - "docs/PENDENCIAS.md"
      - "scripts/sync/linear-pendencias.mjs"
      - ".github/workflows/linear-pendencias-sync.yml"
  workflow_dispatch:
    inputs:
      apply:
        description: "Aplicar mudanças (true) ou só relatar (false)"
        required: false
        default: "false"

permissions:
  contents: write

concurrency:
  group: linear-pendencias-sync
  cancel-in-progress: false

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Validar secret
        id: gate
        run: |
          if [ -z "${{ secrets.LINEAR_API_KEY }}" ]; then
            echo "::warning::Secret LINEAR_API_KEY ausente — pulando sync (não é erro)."
            {
              echo "# Linear sync"
              echo ""
              echo "Mode: SKIP"
              echo "Reason: LINEAR_API_KEY ausente."
              echo ""
              echo "Nenhum token foi exposto."
            } > /tmp/linear-sync-report.md
            echo "skip=true" >> "$GITHUB_OUTPUT"
            exit 0
          fi
          echo "skip=false" >> "$GITHUB_OUTPUT"

      - name: Rodar sync (apply em main/dispatch, dry-run no resto)
        if: steps.gate.outputs.skip != 'true'
        id: run
        env:
          LINEAR_API_KEY: ${{ secrets.LINEAR_API_KEY }}
        run: |
          MODE=""
          if [ "${{ github.event_name }}" = "schedule" ] || [ "${{ github.event_name }}" = "push" ]; then
            MODE="--apply"
          elif [ "${{ github.event_name }}" = "workflow_dispatch" ] && [ "${{ inputs.apply }}" = "true" ]; then
            MODE="--apply"
          fi
          if [ -n "$MODE" ]; then
            node scripts/sync/linear-pendencias.mjs "$MODE" | tee /tmp/sync.out
          else
            node scripts/sync/linear-pendencias.mjs | tee /tmp/sync.out
          fi

      - name: Commit + push se PENDENCIAS.md mudou
        if: github.ref == 'refs/heads/main' && steps.gate.outputs.skip != 'true'
        run: |
          if git diff --quiet docs/PENDENCIAS.md; then
            echo "Sem diff — nada a commitar."
            exit 0
          fi
          git config user.name  "centraldark-bot"
          git config user.email "bot@centralldark.com"
          git add docs/PENDENCIAS.md
          git commit \
            -m "chore(pendencias): sync Linear → MD [skip ci]" \
            -m "Co-authored-by: SegredoiDev <segredounlock@users.noreply.github.com>"
          git push

      - name: Upload relatório
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: linear-sync-report
          path: /tmp/linear-sync-report.md
          retention-days: 14

```

---

# COMANDO - linear-pendencias-sync.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\.github\workflows\linear-pendencias-sync.yml
**SHA:** b0ee48b25e8c76b0
**Timestamp:** 2026-08-28T02:56:03.427085
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: linear-pendencias-sync

# Sync bidirecional Linear ↔ docs/PENDENCIAS.md
# - Roda a cada 30 min e em push que toque PENDENCIAS.md.
# - DRY-RUN no dispatch por padrão.
# - APPLY em main/schedule.
# - Requer secret LINEAR_API_KEY.

on:
  schedule:
    - cron: "*/30 * * * *"
  push:
    branches: [main]
    paths:
      - "docs/PENDENCIAS.md"
      - "scripts/sync/linear-pendencias.mjs"
      - ".github/workflows/linear-pendencias-sync.yml"
  workflow_dispatch:
    inputs:
      apply:
        description: "Aplicar mudanças (true) ou só relatar (false)"
        required: false
        default: "false"

permissions:
  contents: write

concurrency:
  group: linear-pendencias-sync
  cancel-in-progress: false

jobs:
  sync:
    runs-on: [self-hosted, Linux]
    steps:
      - uses: actions/checkout@v7
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - uses: actions/setup-node@v7
        with:
          node-version: "24"

      - name: Validar secret
        id: gate
        run: |
          if [ -z "${{ secrets.LINEAR_API_KEY }}" ]; then
            echo "::warning::Secret LINEAR_API_KEY ausente — sync indisponível nesta execução."
            {
              echo "# Linear sync"
              echo ""
              echo "Mode: BLOCKED_EXTERNAL"
              echo "Reason: LINEAR_API_KEY ausente."
              echo ""
              echo "Nenhum token foi exposto."
            } > /tmp/linear-sync-report.md
            echo "skip=true" >> "$GITHUB_OUTPUT"
            exit 0
          fi
          echo "skip=false" >> "$GITHUB_OUTPUT"

      - name: Rodar sync + publicar com writer-safe-push
        if: github.ref == 'refs/heads/main' && steps.gate.outputs.skip != 'true'
        shell: bash
        env:
          LINEAR_API_KEY: ${{ secrets.LINEAR_API_KEY }}
          WRITER_TAG: LINEAR_SYNC
          PATHS: docs/PENDENCIAS.md
          GIT_AUTHOR_NAME: centraldark-bot
          GIT_AUTHOR_EMAIL: bot@centralldark.com
          MAX_TRIES: "3"
          EVENT_NAME: ${{ github.event_name }}
          APPLY_INPUT: ${{ inputs.apply }}
        run: |
          set -euo pipefail
          MODE=""
          if [ "$EVENT_NAME" = "schedule" ] || [ "$EVENT_NAME" = "push" ]; then
            MODE="--apply"
          elif [ "$EVENT_NAME" = "workflow_dispatch" ] && [ "$APPLY_INPUT" = "true" ]; then
            MODE="--apply"
          fi
          if [ -n "$MODE" ]; then
            export REGENERATE_CMD="node scripts/sync/linear-pendencias.mjs $MODE"
          else
            export REGENERATE_CMD="node scripts/sync/linear-pendencias.mjs"
          fi
          export COMMIT_MESSAGE=$'chore(pendencias): sync Linear → MD [skip ci]\n\nCo-authored-by: SegredoiDev <segredounlock@users.noreply.github.com>'
          bash scripts/lupa/writer-safe-push-main.sh

      - name: Upload relatório
        if: always()
        uses: actions/upload-artifact@v7
        with:
          name: linear-sync-report
          path: /tmp/linear-sync-report.md
          retention-days: 14

```