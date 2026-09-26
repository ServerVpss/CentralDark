# COMANDO - autonomia-promocao.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\.github\workflows\autonomia-promocao.yml
**SHA:** 1be99110af6ed517
**Timestamp:** 2026-08-28T02:56:03.126494
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- workflow_run:
- run: |
- run: |
- run: |
- run: node scripts/github-autonomia-varredura.mjs judge
- run: |
- run: |
- run: node scripts/github-autonomia-green-guard.mjs
- run: node scripts/github-autonomia-varredura.mjs promote
- run: node scripts/github-pr-confirmado-label.mjs reconcile

### Contratos
- grep -q '^BOT_ENTRY_CONTRACT=PASS$' "$RUNNER_TEMP/trigger-fabric-contract.txt"
- grep -q '^OUTPUT_GUARD_CONTRACT=PASS$' "$RUNNER_TEMP/trigger-fabric-contract.txt"
- grep -q '^WORKFLOW_REUSE_CONTRACT=PASS$' "$RUNNER_TEMP/trigger-fabric-contract.txt"

### Ouro Bruto (primeiros 5000 chars)
```
name: Autonomia — promoção segura

on:
  workflow_dispatch:
  pull_request_target:
    types: [opened, reopened, ready_for_review, synchronize, edited, labeled, unlabeled]
    branches: [main]
  workflow_run:
    workflows:
      - porta-de-entrada
      - codex-validate
      - lupa-conformance
      - Lupa Drift Guard
      - PR auto-review (Codex + checklist)
      - Pipeline — Telegram + Painel
    types: [completed]
  repository_dispatch:
    types: [centraldark_autonomia_recheck, centraldark_post_merge]
  schedule:
    - cron: "*/5 * * * *"

permissions: {}

concurrency:
  group: autonomia-promocao-${{ github.event.pull_request.number || github.event.workflow_run.head_sha || github.event.client_payload.pr_number || github.event.client_payload.merge_sha || github.ref }}
  cancel-in-progress: false

env:
  BOT_TRUSTED_AUTHORS: segredounlock
  BOT_REQUIRED_WORKFLOWS: porta-de-entrada,codex-validate,lupa-conformance,Lupa Drift Guard,PR auto-review (Codex + checklist),Pipeline — Telegram + Painel
  BOT_WAIT_TIMEOUT_MINUTES: "45"

jobs:
  judge:
    name: Juiz determinístico — intenção + estado + segurança
    runs-on: [self-hosted, Linux]
    timeout-minutes: 10
    permissions:
      contents: read
      pull-requests: read
      issues: read
      actions: read
      checks: read

    steps:
      - name: Checkout exclusivo da main confiável
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          ref: ${{ github.event.pull_request.base.sha || github.sha }}
          fetch-depth: 1
          persist-credentials: false

      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: 24

      - name: Provar presença de canais opcionais sem mostrar valor
        shell: bash
        run: |
          set -euo pipefail
          echo "PROMOTION_TOKEN=${{ secrets.PROMOTION_TOKEN != '' && 'present' || 'absent_active_agent_can_still_promote' }}"
          echo "TELEGRAM=${{ secrets.TELEGRAM_BOT_TOKEN != '' && secrets.TELEGRAM_CHAT_ID != '' && 'present' || 'absent' }}"
          echo "WEBHOOK=${{ secrets.NOTIFY_WEBHOOK_URL != '' && 'present' || 'absent' }}"

      - name: Testar motor canônico e fronteira de autoridade delegada
        run: |
          set -euo pipefail
          node --test scripts/lupa/authority-approval.test.mjs
          node --test scripts/github-autonomia-promocao.test.mjs
          node --test scripts/github-autonomia-varredura.test.mjs
          node --test scripts/github-autonomia-green-guard.test.mjs
          node --test scripts/github-pr-confirmado-label.test.mjs

      - name: Verificar Trigger Fabric canônica antes de qualquer promoção
        shell: bash
        run: |
          set -euo pipefail
          python scripts/trigger-fabric/verify_repo_contract.py . | tee "$RUNNER_TEMP/trigger-fabric-contract.txt"
          grep -q '^REPO_CONTRACT_VERIFY=PASS$' "$RUNNER_TEMP/trigger-fabric-contract.txt"
          grep -q '^BOT_ENTRY_CONTRACT=PASS$' "$RUNNER_TEMP/trigger-fabric-contract.txt"
          grep -q '^OUTPUT_GUARD_CONTRACT=PASS$' "$RUNNER_TEMP/trigger-fabric-contract.txt"
          grep -q '^WORKFLOW_REUSE_CONTRACT=PASS$' "$RUNNER_TEMP/trigger-fabric-contract.txt"

      - name: Avaliar PRs autorizados em read-only
        env:
          BOT_SWEEP_DIR: ${{ runner.temp }}/centraldark-autonomia
          JUDGE_TOKEN: ${{ github.token }}
          GITHUB_TOKEN: ${{ github.token }}
          TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          TELEGRAM_CHAT_ID: ${{ secrets.TELEGRAM_CHAT_ID }}
          NOTIFY_WEBHOOK_URL: ${{ secrets.NOTIFY_WEBHOOK_URL }}
        run: node scripts/github-autonomia-varredura.mjs judge

      - name: Garantir artifact mesmo sem candidatos elegíveis
        if: always()
        shell: bash
        run: |
          set -euo pipefail
          mkdir -p "${{ runner.temp }}/centraldark-autonomia"
          touch "${{ runner.temp }}/centraldark-autonomia/EMPTY"

      - name: Publicar recibos do juiz
        if: always()
        uses: actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a # v7.0.1
        with:
          name: autonomia-judge-${{ github.run_id }}
          path: ${{ runner.temp }}/centraldark-autonomia
          if-no-files-found: error
          retention-days: 14

      - name: Receipt determinístico
        if: always()
        shell: bash
        env:
          JOB_STATUS: ${{ job.status }}
          HEAD_SHA: ${{ github.event.pull_request.head.sha || github.event.workflow_run.head_sha || github.sha }}
          EVENT_NAME: ${{ github.event_name }}
        run: |
          set -euo pipefail
          echo "HEAD_SHA=${HEAD_SHA}"
          echo "EVENT_NAME=${EVENT_NAME}"
          echo "EXECUTOR=self-hosted-linux"
          echo "TRIGGER_FABRIC_CONTRACT_REQUIRED=1"
          echo "BOT_ENTRY_CONTRACT_REQUIRED=1"
          echo "OUTPUT_GUARD_CONTRACT_REQUIRED=1"
          echo "WORKFLOW_REUSE_REQUIRED=1"
          e
```