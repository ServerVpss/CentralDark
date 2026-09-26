# COMANDO - lovable-rescue-edit-branch.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\.github\workflows\lovable-rescue-edit-branch.yml
**SHA:** 6115d9c2b1741cd6
**Timestamp:** 2026-08-26T19:31:26.651160
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run: |
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: "#FASE 04/05 — Lovable Rescue Edit Branch"
run-name: "#FASE 04/05 — Resgate Lovable — branch edit presa"

on:
  workflow_dispatch:
  schedule:
    - cron: "*/10 * * * *"

permissions:
  contents: write
  pull-requests: write

env:
  FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: "true"

jobs:
  rescue:
    name: "#FASE 04/05 — Detectar branch/commit Lovable não integrado"
    runs-on: ubuntu-latest
    steps:
      - name: "#FASE 01/05 — Checkout main"
        uses: actions/checkout@v5
        with:
          fetch-depth: 0
          ref: main

      - name: "#FASE 02/05 — Procurar branch edit/edt presa"
        id: find_branch
        run: |
          set -euo pipefail
          git fetch origin '+refs/heads/*:refs/remotes/origin/*'

          BRANCH="$(git branch -r | sed 's#origin/##' | grep '^edit/edt-' | sort | tail -1 || true)"

          if [ -z "$BRANCH" ]; then
            echo "found=false" >> "$GITHUB_OUTPUT"
            echo "Nenhuma branch edit/edt-* encontrada."
            {
              echo "## #FASE 02/05 — Nenhuma branch edit/edt presa"
              echo "Nada a resgatar neste momento."
              echo "Observação: este workflow só enxerga branches/commits que chegaram ao GitHub remoto."
            } >> "$GITHUB_STEP_SUMMARY"
            exit 0
          fi

          echo "found=true" >> "$GITHUB_OUTPUT"
          echo "branch=$BRANCH" >> "$GITHUB_OUTPUT"
          echo "Branch encontrada: $BRANCH"

      - name: "#FASE 03/05 — Verificar diferença, ahead e behind contra main"
        if: steps.find_branch.outputs.found == 'true'
        id: diff_check
        run: |
          set -euo pipefail
          BRANCH="${{ steps.find_branch.outputs.branch }}"

          COUNTS="$(git rev-list --left-right --count main..."origin/$BRANCH")"
          BEHIND="$(printf '%s' "$COUNTS" | awk '{print $1}')"
          AHEAD="$(printf '%s' "$COUNTS" | awk '{print $2}')"

          if git diff --quiet main "origin/$BRANCH"; then
            HAS_TREE_DIFF="false"
          else
            HAS_TREE_DIFF="true"
          fi

          echo "behind=$BEHIND" >> "$GITHUB_OUTPUT"
          echo "ahead=$AHEAD" >> "$GITHUB_OUTPUT"
          echo "has_tree_diff=$HAS_TREE_DIFF" >> "$GITHUB_OUTPUT"

          if [ "$AHEAD" != "0" ] || [ "$HAS_TREE_DIFF" = "true" ]; then
            echo "has_diff=true" >> "$GITHUB_OUTPUT"
            echo "Branch $BRANCH tem algo para revisar: ahead=$AHEAD, behind=$BEHIND, tree_diff=$HAS_TREE_DIFF"
          else
            echo "has_diff=false" >> "$GITHUB_OUTPUT"
            echo "Branch $BRANCH não tem diferença nem commits ahead contra main."
          fi

          {
            echo "## #FASE 03/05 — Diagnóstico Lovable"
            echo "- Branch: \`$BRANCH\`"
            echo "- Commits ahead de main: \`$AHEAD\`"
            echo "- Commits behind de main: \`$BEHIND\`"
            echo "- Diferença de arquivos contra main: \`$HAS_TREE_DIFF\`"
            echo ""
            echo "Explicação leiga: árvore limpa não basta; também checamos se a branch tem commits que ainda não entraram na main."
          } >> "$GITHUB_STEP_SUMMARY"

      - name: "#FASE 04/05 — Criar Pull Request para main"
        if: steps.find_branch.outputs.found == 'true' && steps.diff_check.outputs.has_diff == 'true'
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          set -euo pipefail
          BRANCH="${{ steps.find_branch.outputs.branch }}"

          EXISTENTE="$(gh pr list --head "$BRANCH" --state open --json number --jq '.[0].number' || true)"
          if [ -n "$EXISTENTE" ]; then
            echo "Já existe PR aberto #$EXISTENTE pra branch $BRANCH — nada a fazer."
            echo "PR existente: #$EXISTENTE" >> "$GITHUB_STEP_SUMMARY"
            exit 0
          fi

          gh pr create \
            --base main \
            --head "$BRANCH" \
            --title "#FASE 04/05 — Resgate Lovable: $BRANCH → main" \
            --body "PR automático para resgatar mudanças presas na branch temporária da Lovable.

          Branch detectada:
          \`$BRANCH\`

          Checagens feitas:
          - diferença de arquivos contra main;
          - commits ahead/behind contra main.

          Objetivo:
          - revisar;
          - mergear se estiver correto.

          Limite importante:
          - este workflow só enxerga o que já chegou ao GitHub remoto;
          - commit preso somente dentro do sandbox local da Lovable precisa ser tratado no fallback interno da Lovable.

          Este workflow não mexe em VPS, Caddy, PM2, Docker, WuzAPI, WhatsApp ou secrets."

      - name: "#FASE 05/05 — Resumo final"
        if: always()
        run: |
          {
            echo "## #FASE 05/05 — Resultado"
            echo "Workflow concluído."
            echo "Se nada foi criado, não havia branch edit/edt-* remota com diferença/ahead visível para resgatar."
          } >> "$GITHUB_STEP_SUMMARY"

```