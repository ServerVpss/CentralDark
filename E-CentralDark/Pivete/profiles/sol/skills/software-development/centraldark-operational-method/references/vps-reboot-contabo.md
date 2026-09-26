# VPS REBOOT CONTABO — VPS offline, runner down

## Sintoma
- `gh api runners` → status=offline (ou busy+offline inconsistente)
- PRs em `queued` eternamente (sem runner p/ rodar)
- SSH na VPS timeout (intermitente)

## Causa
VPS Contabo (`89.117.78.124`) caiu ou rede instável. Runner self-hosted morreu.

## Reboot via API Contabo (script no container de execução)
O script `vps-reboot-forensic.py` faz:
1. Auth Contabo (secrets `CONTABO_*`)
2. Lista instâncias → acha alvo (IP 89.117.78.124 ou nome "central")
3. POST `/v1/compute/instances/{id}/actions/reboot` (MUTATION=1)
4. Forense Cloudflare (token verify + zona + DNS) — read-only

**ONDE RODA:** container de execução de código (Ubuntu 24.04, /workspace/CentralDark) onde os secrets `CONTABO_*` e `CLOUDFLARE_API_TOKEN` estão na UI. NÃO roda no terminal local (sem secrets).

Local do script: `scripts/vps-reboot-forensic.py` (repo CentralDark).

## Após reboot
```bash
sleep 60
ssh -i ~/.ssh/segredo_vps_ed25519 root@89.117.78.124 "systemctl restart actions.runner.centraldark.service"
gh api repos/ServerVpss/CentralDark/actions/runners  # deve mostrar online
```

## Fixed Point
- Contabo reboot PASS
- Runner GitHub online (gh api)
- PRs saem de queued → green

## Notas
- VPS user = root (chave ed25519 não autoriza danda/git)
- SSH intermitente → retry loop até estabilizar
- Skill irmã: `vps-reboot-forensic` (devops/)
