# COMANDO - codex-validate.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\.github\workflows\codex-validate.yml
**SHA:** 7f81cc8285186551
**Timestamp:** 2026-08-26T19:33:13.638759
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run: |
- run: |
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: codex-validate

on:
  pull_request:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read

jobs:
  validate:
    name: Validate Codex operational kit
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Validate required Codex files
        shell: bash
        run: |
          set -euo pipefail

          required=(
            "AGENTS.md"
            "CODEX.md"
            ".github/codex/prompts/centraldark-system.md"
            ".github/pull_request_template.md"
          )

          for file in "${required[@]}"; do
            test -f "$file" || {
              echo "Missing required file: $file"
              exit 1
            }
          done

      - name: Check official repository references
        shell: bash
        run: |
          set -euo pipefail

          grep -q "ServerVpss/CentralDark" AGENTS.md
          grep -q "ServerVpss/CentralDark" CODEX.md
          grep -q "ServerVpss/CentralDark" .github/codex/prompts/centraldark-system.md
          grep -q "ServerVpss/CentralDark" .github/pull_request_template.md

      - name: Check sensitive-file guardrails are explicit
        shell: bash
        run: |
          set -euo pipefail

          docs=(
            "AGENTS.md"
            "CODEX.md"
            ".github/codex/prompts/centraldark-system.md"
            ".github/pull_request_template.md"
          )

          for file in "${docs[@]}"; do
            grep -q "arquivos sensíveis\|Arquivos sensíveis" "$file" || {
              echo "Missing sensitive-file guardrail wording in $file"
              exit 1
            }
          done

          grep -q "Não li, abri, copiei, editei ou usei como contexto arquivos sensíveis" .github/pull_request_template.md
          grep -q "Verifiquei comentários de agentes no PR antes do merge" .github/pull_request_template.md
          grep -q "\.env" AGENTS.md
          grep -q "secrets/" AGENTS.md
          grep -q "sessions/" CODEX.md
          grep -q "\.ssh/" .github/codex/prompts/centraldark-system.md

      - name: Check docs do not contain real secret values
        shell: bash
        run: |
          set -euo pipefail

          python3 - <<'PY'
          from pathlib import Path
          import re
          import sys

          files = [
              Path("AGENTS.md"),
              Path("CODEX.md"),
              Path(".github/codex/prompts/centraldark-system.md"),
              Path(".github/pull_request_template.md"),
          ]

          patterns = [
              re.compile(r"-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----", re.I),
              re.compile(r"(?i)\b(?:token|password|passwd|secret|cookie|session|connection_string|database_url|api_key|apikey)\b\s*[:=]\s*['\"]?([^'\"\s<>`]{12,})"),
          ]

          allowed_placeholders = {
              "***OCULTO***",
              "REDACTED",
              "CHANGEME",
              "EXAMPLE",
              "PLACEHOLDER",
          }

          findings = []

          for file in files:
              text = file.read_text(encoding="utf-8")
              for pattern in patterns:
                  for match in pattern.finditer(text):
                      value = match.group(1) if match.groups() else match.group(0)
                      normalized = value.strip().strip('"\'')
                      if normalized in allowed_placeholders:
                          continue
                      findings.append(f"{file}: possible real secret value near: {match.group(0)[:40]}")

          if findings:
              print("Potential real secret-like values found in Codex docs:")
              for item in findings:
                  print("-", item)
              sys.exit(1)

          print("OK: no real secret-like values found in Codex docs")
          PY

      - name: Validate Markdown presence
        shell: bash
        run: |
          set -euo pipefail
          grep -q "Repositório oficial" AGENTS.md
          grep -q "Alvo obrigatório" CODEX.md
          grep -q "Autoajuste consciente" .github/codex/prompts/centraldark-system.md
          grep -q "Ações sensíveis" .github/pull_request_template.md

```

---

# COMANDO - codex-validate.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\.github\workflows\codex-validate.yml
**SHA:** e0aedaab7261d9c1
**Timestamp:** 2026-08-28T02:56:03.169405
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run: node --test scripts/lupa/authority-approval.test.mjs
- run: node scripts/lupa/authority-approval.mjs
- run: |
- run: |
- run: |
- run: |
- run: |
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: codex-validate

on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review, edited, labeled, unlabeled]
    branches:
      - main
      - program/centraldark-convergencia-omniroute-722
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: codex-validate-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true

jobs:
  validate-canonical-map:
    name: Validate canonical map and consolidated areas
    runs-on: [self-hosted, Linux]
    timeout-minutes: 20
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

      - name: Checkout exact PR HEAD
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          persist-credentials: false
          ref: ${{ github.event.pull_request.head.sha || github.sha }}
          fetch-depth: 0
          submodules: false

      - name: Prove checkout identity
        env:
          HEAD_SHA: ${{ github.event.pull_request.head.sha || github.sha }}
        run: |
          set -euo pipefail
          test "$(git rev-parse HEAD)" = "$HEAD_SHA"

      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: 24

      - name: Test authenticated authority source
        run: node --test scripts/lupa/authority-approval.test.mjs

      - name: Resolve authenticated authority
        id: authority
        run: node scripts/lupa/authority-approval.mjs

      - name: Test deterministic map and provider guards
        run: |
          set -euo pipefail
          node --test apps/modulos/mapeamento/tests/validar-mapa.test.mjs
          node --test apps/modulos/HERMES-CORE/agents/Log-Verificador/provider-health.test.mjs
          bash -n scripts/vps/deploy-operational-guards.sh

      - name: Enforce unique map and consolidated locks
        env:
          BASE_SHA: ${{ github.event.pull_request.base.sha || '' }}
          HEAD_SHA: ${{ github.event.pull_request.head.sha || github.sha }}
          AUTHORITY_APPROVED: ${{ steps.authority.outputs.approved }}
        run: |
          set -euo pipefail
          node apps/modulos/mapeamento/core/validar-mapa.mjs \
            --repo-root "$GITHUB_WORKSPACE" \
            --base-sha "$BASE_SHA" \
            --head-sha "$HEAD_SHA" \
            --approved "$AUTHORITY_APPROVED"

      - name: Receipt determinístico (sempre)
        if: always()
        shell: bash
        env:
          JOB_STATUS: ${{ job.status }}
          HEAD_SHA: ${{ github.event.pull_request.head.sha || github.sha }}
          EVENT_NAME: ${{ github.event_name }}
          FORK_BLOCKED: ${{ steps.fork_guard.outputs.blocked }}
          FORK_CAUSE: ${{ steps.fork_guard.outputs.cause }}
        run: |
          set -euo pipefail
          echo "HEAD_SHA=${HEAD_SHA}"
          echo "EVENT_NAME=${EVENT_NAME}"
          echo "EXECUTOR=self-hosted"
          echo "ROTA_PRIMARIA=self-hosted-linux"
          echo "ROTA_FALLBACK=BLOCKED_NO_HOSTED"
          echo "JOB_STATUS=${JOB_STATUS}"
          if [ "${FORK_BLOCKED:-}" = "true" ]; then
            echo "RESULTADO=BLOCKED"
            echo "CAUSE=${FORK_CAUSE:-FORK_HEAD}"
          elif [ "${JOB_STATUS}" = "cancelled" ]; then
            echo "RESULTADO=BLOCKED"
            echo "CAUSE=CANCELLED_OR_RUNNER_UNAVAILABLE"
          elif [ "${JOB_STATUS}" = "failure" ]; then
            echo "RESULTADO=FAIL"
          elif [ "${JOB_STATUS}" = "success" ]; then
            echo "RESULTADO=PASS"
          else
            echo "RESULTADO=BLOCKED"
            echo "CAUSE=UNKNOWN_STATUS_${JOB_STATUS}"
          fi

  validate:
    name: Validate Codex operational kit
    runs-on: [self-hosted, Linux]
    timeout-minutes: 20
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
            echo "cause=FORK_HEAD" >> "$GITHUB
```