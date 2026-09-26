# COMANDO - porta-de-entrada.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\.github\workflows\porta-de-entrada.yml
**SHA:** 71cb27b799e51d95
**Timestamp:** 2026-08-28T02:56:03.698176
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run: |
- run: node scripts/lupa/validar-continuidade-global.mjs
- run: node --test scripts/lupa/label-gate.test.mjs
- run: |
- run: |
- run: node --test scripts/lupa/authority-approval.test.mjs
- run: node scripts/lupa/authority-approval.mjs
- run: node --test scripts/lupa/validar-identidade-operacional.test.mjs

### Contratos
- grep -q '^SELF_HEALING_CONTRACT=PASS$' "$RUNNER_TEMP/centraldark-contract.txt"
- echo "GLOBAL_CONTINUITY_HARD_GATE=1"
- echo "UNREGISTERED_INVARIANT=UNPROVEN_NOT_OWNED"
- echo "GIT_STATE_SAFETY_GATE=1"

### Principios
- echo "UNREGISTERED_INVARIANT=UNPROVEN_NOT_OWNED"

### Ouro Bruto (primeiros 5000 chars)
```
name: porta-de-entrada

# Gate canônico: atualiza o mecanismo existente em vez de criar workflows
# paralelos. Valida identidade, reconciliação, raiz única da CentralDark,
# labels operacionais, fronteira única da API e política global de executor.

on:
  pull_request:
    branches: [main, program/centraldark-convergencia-omniroute-722]
    types: [opened, reopened, synchronize, ready_for_review, edited, labeled, unlabeled]
  push:
    branches: ['**']
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: porta-de-entrada-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true

jobs:
  validar:
    name: Porta, identidade e governança canônica estão íntegras?
    runs-on: [self-hosted, Linux]
    timeout-minutes: 8
    steps:
      - name: Bloquear HEAD de fork no runner persistente
        id: fork_guard
        if: github.event_name == 'pull_request' || github.event_name == 'pull_request_target'
        shell: bash
        env:
          HEAD_REPO: ${{ github.event.pull_request.head.repo.full_name }}
          BASE_REPO: ${{ github.repository }}
        run: |
          set -euo pipefail
          if [ -z "${HEAD_REPO}" ] || [ "${HEAD_REPO}" != "${BASE_REPO}" ]; then
            echo "blocked=true" >> "$GITHUB_OUTPUT"
            echo "cause=FORK_HEAD" >> "$GITHUB_OUTPUT"
            echo "BLOCKED_FORK_HEAD repo=${HEAD_REPO:-empty}"
            exit 1
          fi
          echo "blocked=false" >> "$GITHUB_OUTPUT"
          echo "FORK_GUARD_OK ${HEAD_REPO}"

      - name: Checkout preso ao HEAD validado
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          ref: ${{ github.event.pull_request.head.sha || github.sha }}
          persist-credentials: false
          fetch-depth: 0
          submodules: false

      - name: Provar checkout no mesmo HEAD do gate
        env:
          HEAD_SHA: ${{ github.event.pull_request.head.sha || github.sha }}
        run: |
          set -euo pipefail
          actual="$(git rev-parse HEAD)"
          test "$actual" = "$HEAD_SHA" || {
            echo "CHECKOUT_HEAD_MISMATCH expected=$HEAD_SHA actual=$actual"
            exit 1
          }

      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: 24

      - name: Gate global — Trigger Fabric + runner policy + self-healing contract
        shell: bash
        run: |
          set -euo pipefail
          python scripts/trigger-fabric/verify_repo_contract.py . | tee "$RUNNER_TEMP/centraldark-contract.txt"
          grep -q '^REPO_CONTRACT_VERIFY=PASS$' "$RUNNER_TEMP/centraldark-contract.txt"
          grep -q '^CANONICAL_RUNNER_POLICY=PASS$' "$RUNNER_TEMP/centraldark-contract.txt"
          grep -q '^SELF_HEALING_CONTRACT=PASS$' "$RUNNER_TEMP/centraldark-contract.txt"

      - name: Validar continuidade global e fronteira de autoridade da entrada
        run: node scripts/lupa/validar-continuidade-global.mjs

      - name: Testar decisão determinística do gate de labels
        if: github.event_name == 'pull_request'
        run: node --test scripts/lupa/label-gate.test.mjs

      - name: Exigir labels operacionais canônicas
        if: github.event_name == 'pull_request'
        shell: bash
        env:
          BASE_SHA: ${{ github.event.pull_request.base.sha }}
          GITHUB_TOKEN: ${{ github.token }}
        run: |
          set -euo pipefail
          node scripts/lupa/label-gate-run.mjs

      - name: Bloquear novo bypass direto de provider fora do Gateway
        if: github.event_name == 'pull_request'
        shell: bash
        env:
          BASE_SHA: ${{ github.event.pull_request.base.sha }}
          HEAD_SHA: ${{ github.event.pull_request.head.sha }}
        run: |
          set -euo pipefail
          test "$BASE_SHA" != "" && test "$HEAD_SHA" != ""
          forbidden='(api\.openai\.com|api\.anthropic\.com|openrouter\.ai|api\.groq\.com|generativelanguage\.googleapis\.com|api\.x\.ai)'
          failed=0
          while IFS= read -r file; do
            case "$file" in
              *.js|*.mjs|*.cjs|*.ts|*.tsx|*.py|*.sh|*.yml|*.yaml|*.json) ;;
              *) continue ;;
            esac
            case "$file" in
              apps/modulos/arsenal-openai-adapter/*|apps/modulos/elite-anthropic-proxy/*|apps/modulos/elite-gateway/*|apps/modulos/proxy/*|apps/modulos/lovable-proxy/*|apps/modulos/oauth-broker/*)
                continue
                ;;
            esac
            if git diff -U0 "$BASE_SHA" "$HEAD_SHA" -- "$file" \
              | grep '^+' \
              | grep -v '^+++' \
              | grep -Eiq "$forbidden"; then
              echo "API_SINGLE_ENTRY_BLOCKED path=$file reason=NEW_DIRECT_PROVIDER_BYPASS"
              failed=1
            fi
          done < <(git diff --name-only "$BASE_SHA" "$HEAD_SHA")
          test "$failed" -eq 0
          echo "CENTRALDARK_API_SINGLE_ENTRY=PASS"

      - name: Testar fonte autenticada d
```