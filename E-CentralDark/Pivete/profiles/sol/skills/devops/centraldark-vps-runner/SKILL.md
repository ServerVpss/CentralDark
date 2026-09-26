---
name: centraldark-vps-runner
description: Setup, manutenção e fixed-point de runner self-hosted GitHub Actions na VPS Ubuntu da CentralDark. Trigger todo runner offline/vermelho/queued ou antes de deploy VPS.
trigger:
  - runner offline
  - PRs vermelhos/queued no GitHub
  - antes de deploy VPS
  - github-actions self-hosted
phases: "SSH → DIAGNOSE → INSTALL_OR_RESTART → SYSTEMD → VERIFY_RUNNER → VERIFY_CI → FIXED_POINT"
rules:
  - RUNNER_LABELS="self-hosted,Linux,X64,centraldark,dependabot"
  - RUNNER_DIR=/root/actions-runner
  - SYSTEMD_SERVICE=actions.runner.centraldark.service
  - RUN_AS=root (VPS provado: root@89.117.78.124 chave ~/.ssh/segredo_vps_ed25519)
  - NO_FORCE_PUSH
  - NO_DEPLOY_WITHOUT_RUNNER_UP
runtime_checks:
  - ssh root@VPS "pm2 list"
  - ssh root@VPS "systemctl status actions.runner.centraldark.service"
  - gh api repos/ServerVpss/CentralDark/actions/runners
failure_signature: "runner offline + PRs queued/cancelled"
remediation:
  - reconnect SSH (retry loop, VPS intermitente)
  - systemctl restart actions.runner.centraldark.service
  - se binary ausente: baixar runner tarball + config --url --token --labels
  - se token expirado: gh api rot | reconfigure
provenance:
  sources:
    - "SKILL.md"
    - "massivegrid.com/blog/github-actions-self-hosted-runner-ubuntu-vps (referência, sem crédito web no momento)"
  tests:
    - "gh api runners mostra online"
    - "PR novo roda e passa"
  receipts:
    - "centraldark.vps.runner.receipt"
counterproof: "PR aberto de teste roda no runner self-hosted e conclui green"
fixed_point_contribution: "CI da Casa funciona sem GitHub-hosted; deploy VPS tem runner base"
mantra: "RUNNER_UP > CI_GREEN > DEPLOY; SEM RUNNER = SEM PROVA"
---

# CENTRALDARK VPS RUNNER — Self-Hosted GitHub Actions

## Objetivo
Manter o runner self-hosted da CentralDark operacional na VPS Ubuntu, para que todos os PRs CI rodem e o deploy VPS tenha base.

## Acesso VPS (medido)
- Host: `89.117.78.124`
- User: `root` (não danda/git — chave ed25519 só autoriza root)
- Key: `~/.ssh/segredo_vps_ed25519`
- Comando: `ssh -i ~/.ssh/segredo_vps_ed25519 -o StrictHostKeyChecking=no root@89.117.78.124`

## Setup canônico (Ubuntu self-hosted runner)
```bash
# 1. Conectar
ssh -i ~/.ssh/segredo_vps_ed25519 root@89.117.78.124

# 2. Prereq
apt-get update && apt-get install -y curl jq tar

# 3. Dir do runner
mkdir -p /root/actions-runner && cd /root/actions-runner
LATEST=$(curl -s https://api.github.com/repos/actions/runner/releases/latest | jq -r '.tag_name' | sed 's/v//')
curl -O -L "https://github.com/actions/runner/releases/download/v${LATEST}/actions-runner-linux-x64-${LATEST}.tar.gz"
tar xzf actions-runner-linux-x64-${LATEST}.tar.gz

# 4. Configurar (token vem de: gh api repos/ServerVpss/CentralDark/actions/runners/registration-token)
./config.sh --url https://github.com/ServerVpss/CentralDark --token <TOKEN> --labels self-hosted,Linux,X64,centraldark,dependabot --name vmi3256920-centraldark --unattended --replace

# 5. Systemd (sobrevive reboot, auto-start)
./svc.sh install
./svc.sh start
systemctl status actions.runner.centraldark.service
```

## Diagnóstico rápido
```bash
ssh root@VPS "systemctl status actions.runner.centraldark.service; pm2 list; ps aux | grep runner"
gh api repos/ServerVpss/CentralDark/actions/runners
```

## Fixed Point (proporcional)
- Runner `online` na API ✅
- `gh run` de PR novo conclui (não queued) ✅
- Labels batem `runs-on: [self-hosted, Linux]` ✅
- Sem force-push, sem deploy sem runner ✅

## Notas
- VPS está intermitente (SSH cai). Usar retry loop.
- Se `ROOT_OK` mas `danda`/`git` nega: usar root.
- Token de registro expira em 1h; gerar na hora do config.
