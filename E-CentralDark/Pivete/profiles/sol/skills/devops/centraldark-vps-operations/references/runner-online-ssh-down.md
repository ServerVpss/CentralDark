# Runner GitHub online ≠ VPS SSH up

Measured 2026-08-26 (Hermes CLI, Windows).

## Discriminant

| Sinal | Prova | Não prova |
|---|---|---|
| `gh api repos/ServerVpss/CentralDark/actions/runners` → online busy=true | GitHub vê o runner registrado | SSH, PM2, deploy |
| `gh run list --status in_progress` vazio + busy=true | runner zumbi | job vivo |
| `ssh Segredo-VPS` / `root@89.117.78.124` timeout | VPS inalcançável neste host | auth quebrada (key já passou ROOT_OK antes) |
| `CLOUDFLARE_API_TOKEN` no `gh secret list` | token CF no repo | reboot Contabo |

## O que fazer

1. Medir SSH com `ConnectTimeout=12 BatchMode=yes`. 3 timeouts = VPS down, parar o loop.
2. Não dispatchar `vps-exec-selfhosted.yml` esperando milagre: fica `pending` eterno.
3. Reboot: `scripts/vps-reboot-forensic.py` no ambiente que tem `CONTABO_CLIENT_ID/SECRET/API_USER/PASSWORD` (container Codex, UI Secrets). Hermes local = UNSET.
4. Depois do reboot: esperar ~60s, SSH, `systemctl restart actions.runner.centraldark.service`, só então rerun/deploy.

`HEALTH` de runner GitHub sem SSH = UNKNOWN de runtime, não PASS de deploy.
