---
name: vps-reboot-forensic
description: Reboot VPS Contabo + forense Cloudflare via API, read-only state collection + reboot autorizado. Trigger VPS offline, runner down, deploy bloqueado.
trigger:
  - VPS offline
  - runner GitHub down
  - deploy bloqueado
  - contabo reboot
phases: "SECRETS_ENV → FORENSE_CONTABO → REBOOT_CONTABO → FORENSE_CLOUDFLARE → VERIFY_RUNNER"
rules:
  - SECRETS em container de execução (CONTABO_*, CLOUDFLARE_API_TOKEN)
  - MUTATION=1 só no reboot Contabo (autorizado PERMITO-SEGREDO)
  - NUNCA expor token em log
  - TARGET=89.117.78.124 ou nome contendo "central"
  - após reboot: aguardar + verificar runner online
runtime_checks:
  - gh api repos/ServerVpss/CentralDark/actions/runners
  - ssh root@89.117.78.124 "systemctl is-active actions.runner.centraldark.service"
failure_signature: "VPS offline + reboot falha + runner down"
remediation:
  - rodar script no container (onde secrets existem)
  - se reboot OK: aguardar 60s, verificar runner
  - se runner não sobe: systemctl restart no VPS
provenance:
  sources:
    - "scripts/vps-reboot-forensic.py"
    - "CHEFE paste: container UI com secrets Contabo/Cloudflare"
  tests:
    - "Contabo reboot retorna 200"
    - "runner GitHub fica online após reboot"
  receipts:
    - "centraldark.vps.reboot.receipt"
counterproof: "gh api runners mostra online + PR roda green"
fixed_point_contribution: "VPS up = runner up = CI verde = deploy possível"
mantra: "FORENSE_FIRST → REBOOT → VERIFY_RUNNER → RERUN_CI"
---

# VPS REBOOT FORENSIC

## Onde roda
O script `vps-reboot-forensic.py` roda **no container de execução de código** (Ubuntu 24.04, /workspace/CentralDark) onde os secrets `CONTABO_*` e `CLOUDFLARE_API_TOKEN` estão configurados na UI. Não roda no terminal local (sem secrets lá).

## O que faz
1. Forense Contabo: auth + lista instâncias (save JSON)
2. Reboot da instância alvo (89.117.78.124 ou "central")
3. Forense Cloudflare: verify token + zona + DNS (save JSON)
4. MUTATION=1 (reboot) — resto read-only

## Como executar (no container)
```bash
cd /workspace/CentralDark
python3 scripts/vps-reboot-forensic.py
```

## Após reboot
```bash
# aguardar subir
sleep 60
ssh -i ~/.ssh/segredo_vps_ed25519 root@89.117.78.124 "systemctl status actions.runner.centraldark.service"
# se não ativo:
ssh root@VPS "systemctl restart actions.runner.centraldark.service"
```

## Fixed Point
- Contabo reboot PASS
- Runner GitHub online (gh api)
- PRs saem de queued → green

## NÃO
- Não rodar local (sem secrets)
- Não expor token
- Não finger verde
