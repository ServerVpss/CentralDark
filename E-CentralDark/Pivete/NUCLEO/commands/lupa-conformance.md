# COMANDO - lupa-conformance.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\.github\workflows\lupa-conformance.yml
**SHA:** e0bf47f312aca61c
**Timestamp:** 2026-08-28T02:56:03.419741
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run: pip install pytest
- run: python scripts/lupa/validar_autolupa_hash.py
- run: pytest .agents/skills/meta-lupa/testes/test_autolupa_conformance.py -v
- run: python testes/test_lupa.py
- run: |
- run: |
- run: python scripts/percentual_evidencial.py self-test
- run: pytest .agents/skills/meta-lupa/testes/test_operation_receipt_validator.py -v

### Contratos
- echo "KNOWLEDGE_COMPILER_GATE=1"

### Ouro Bruto (primeiros 5000 chars)
```
name: lupa-conformance

on:
  push:
    branches: [main]
  pull_request:
    branches: [main, program/centraldark-convergencia-omniroute-722]
    types: [opened, reopened, synchronize, ready_for_review, labeled, unlabeled]
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: lupa-conformance-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true

jobs:
  guard:
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

      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          ref: ${{ github.event.pull_request.head.sha || github.sha }}
          fetch-depth: 0
          persist-credentials: false

      - name: Vincular branch esperada ao SHA exato
        shell: bash
        env:
          EXPECTED_BRANCH: ${{ github.event.pull_request.head.ref || github.ref_name }}
          EXPECTED_SHA: ${{ github.event.pull_request.head.sha || github.sha }}
        run: |
          set -euo pipefail
          if [ -z "${EXPECTED_BRANCH}" ]; then
            echo "OPERATION_RECEIPT_EXPECTED_BRANCH_MISSING"
            exit 1
          fi
          git check-ref-format --branch "${EXPECTED_BRANCH}" >/dev/null
          BEFORE_SHA="$(git rev-parse HEAD)"
          if [ "${BEFORE_SHA}" != "${EXPECTED_SHA}" ]; then
            echo "OPERATION_RECEIPT_HEAD_MISMATCH expected=${EXPECTED_SHA} actual=${BEFORE_SHA}"
            exit 1
          fi
          if git show-ref --verify --quiet "refs/heads/${EXPECTED_BRANCH}"; then
            git branch -f "${EXPECTED_BRANCH}" "${EXPECTED_SHA}"
          else
            git branch "${EXPECTED_BRANCH}" "${EXPECTED_SHA}"
          fi
          git switch "${EXPECTED_BRANCH}" >/dev/null
          AFTER_SHA="$(git rev-parse HEAD)"
          ACTUAL_BRANCH="$(git branch --show-current)"
          if [ "${AFTER_SHA}" != "${EXPECTED_SHA}" ] || [ "${ACTUAL_BRANCH}" != "${EXPECTED_BRANCH}" ]; then
            echo "OPERATION_RECEIPT_BRANCH_BINDING_FAILED expected_branch=${EXPECTED_BRANCH} actual_branch=${ACTUAL_BRANCH:-empty} expected_sha=${EXPECTED_SHA} actual_sha=${AFTER_SHA}"
            exit 1
          fi
          echo "OPERATION_RECEIPT_BRANCH_BINDING=PASS"
          echo "EXPECTED_BRANCH=${EXPECTED_BRANCH}"
          echo "HEAD_SHA=${AFTER_SHA}"

      - uses: actions/setup-python@5fda3b95a4ea91299a34e894583c3862153e4b97 # v7.0.0
        with:
          python-version: '3.11'
      - name: Instalar pytest
        run: pip install pytest
      - name: Validar hash canônico da Lupa
        run: python scripts/lupa/validar_autolupa_hash.py
      - name: Rodar testes de conformidade
        env:
          AUTOLUPA_REPORT: .agents/skills/meta-lupa/testes/fixtures/exemplo_ok.md
        run: pytest .agents/skills/meta-lupa/testes/test_autolupa_conformance.py -v
      - name: Motor determinístico
        working-directory: .agents/skills/meta-lupa
        run: python testes/test_lupa.py
      - name: Evolução verificável — fail closed
        working-directory: .agents/skills/meta-lupa
        run: |
          python scripts/evolution_gate.py --self-test
          python scripts/evolution_series_gate.py --self-test
          python scripts/agi_claim_gate.py --self-test
          python scripts/evolution_series_gate.py --scan references --repo-root ../../..
          pytest testes/test_evolution_gate.py -v
      - name: Knowledge Compiler — FORJA rigorosa, runtime FLASH
        shell: bash
        run: |
          set -euo pipefail
          node --check .agents/skills/knowledge-compiler/scripts/compiler.mjs
          node .agents/skills/knowledge-compiler/scripts/compiler.mjs --self-test
          node --test \
            .agents/skills/knowledge-compiler/tests/compiler.test.mjs \
            .agents/skills/knowledge-compiler/tests/contract.test.mjs
      - name: Percentual evidencial — denominador fechado + dogfood
        working-directory: .agents/skills/meta-lupa
        run: python scripts/percentual_evidencial.py self-test
      - name: Validador e promotor do OPERATION_RECEIPT
        run: pytest .agents/skills/meta-lupa/testes/test_operation_receipt_validator.py -v
      - name: Guardrail do selo de ponto fixo
        working-directory: .agents/
```