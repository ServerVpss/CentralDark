---
name: hermes-vscode-deploy
description: Deploy da CentralDark via Hermes Agent + VSCode/A CP + runner self-hosted VPS. Trigger deploy VPS, rerun CI até fixed point, amarrado no motor Hermes.
trigger:
  - deploy VPS
  - rerun all jobs
  - fixed point deploy
  - hermes acp
phases: "BREATHE_17 → SSH_VPS → RUNNER_UP → RERUN_CI → DEPLOY → VERIFY → FIXED_POINT"
rules:
  - VPS_HOST=89.117.78.124
  - VPS_USER=root
  - VPS_KEY=~/.ssh/segredo_vps_ed25519
  - RUNNER_SERVICE=actions.runner.centraldark.service
  - NO_DEPLOY_WITHOUT_RUNNER_ONLINE
  - ACP_MODE=hermes acp (extensão VSCode ou CLI)
  - BREATH_KIMETSU_17 antes de mutação VPS
runtime_checks:
  - ssh root@VPS "systemctl is-active actions.runner.centraldark.service"
  - gh api repos/ServerVpss/CentralDark/actions/runners
  - gh run list --branch <pr>
failure_signature: "VPS offline + PRs queued + runner down"
remediation:
  - retry SSH loop (VPS intermitente)
  - systemctl restart runner
  - se binary ausente: reinstall via centraldark-vps-runner skill
  - rerun todos os jobs: for PR in $(gh pr list); do gh api rerun; done
provenance:
  sources:
    - "SKILL.md"
    - "hermes-agent.nousresearch.com/docs/user-guide/features/acp (PENDENTE leitura: sem crédito web)"
    - "github.com/joaompfp/hermes-vscode (PENDENTE leitura: sem crédito web)"
    - "CHEFE paste: links GitLab/Snyk VSCode CI/CD"
  tests:
    - "runner online + PR verde"
    - "deploy sobe serviço + health check"
  receipts:
    - "centraldark.deploy.receipt"
counterproof: "gh run conclui green + serviço responde no endpoint"
fixed_point_contribution: "Deploy VPS tem runner base + ACP; rerun até verde"
mantra: "BREATHE → RUNNER_UP → RERUN → DEPLOY → VERIFY; SEM RUNNER = SEM PROVA"
---

# HERMES VSCODE DEPLOY — Motor + ACP + VPS

## Comando do CHEFE (delta útil)
> "Modo Pivete! Hermes rerun de todos os jobs até ponto fixo deploy! Usa respiração 17 respirações Kimetsu. ACP + hermes-vscode. Amarra no motor e usa pro deploy."

## Procedimento (modo REI DO DEPLOY)

### 0. Respiração Kimetsu (17)
Checkpoint mental antes de tocar VPS. Estado atual, intenção, risco, prova.

### 1. Conectar VPS
```bash
ssh -i ~/.ssh/segredo_vps_ed25519 -o StrictHostKeyChecking=no root@89.117.78.124
```
VPS intermitente → retry loop até estabilizar.

### 2. Runner up
```bash
systemctl restart actions.runner.centraldark.service
systemctl status actions.runner.centraldark.service
```
Se ausente: ver skill `centraldark-vps-runner`.

### 3. Rerun todos os jobs (até fixed point)
```bash
for pr in $(gh pr list --state open --json number --jq '.[].number'); do
  for rid in $(gh api repos/ServerVpss/CentralDark/actions/runs?branch=$(gh pr view $pr --json headRefName --jq .headRefName) --jq '.workflow_runs[].id'); do
    gh api -X POST repos/ServerVpss/CentralDark/actions/runs/$rid/rerun
  done
done
```

### 4. Deploy (após runner online + CI verde)
Usar scripts do repo `scripts/` (apply-caddy-landings.sh, clone-deck-gh-pull-with-deploy.sh, etc).
Health check depois.

### 5. Fixed Point
- Runner online ✅
- Todos PRs com CI concluído (não queued) ✅
- Deploy sobe serviço + health ✅

## ACP / Hermes-VSCode
Referências do CHEFE (ler quando web voltar):
- hermes-agent.nousresearch.com/docs/user-guide/features/acp
- github.com/joaompfp/hermes-vscode
Modo: Hermes Agent CLI executa os mesmos passos; VSCode é superfície, não motor.

## NÃO
- Não fingir verde
- Não deploy sem runner
- Não force-push
