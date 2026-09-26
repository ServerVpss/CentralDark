# VPS Runner Deploy When SSH Is Offline

## Sintoma
- `ssh root@VPS` retorna timeout/intermitente (30 tentativas falham).
- Mas `gh api repos/.../actions/runners` mostra runner self-hosted ONLINE.
- CI roda normalmente (runner processa fila).

## Causa típica
O runner GitHub Actions é um processo separado do SSH daemon. O runner está de pé (sobreviveu), mas o acesso SSH direto está bloqueado por rede/intermédio/firewall.

## Padrão (não force SSH se o runner responde)
1. Usar `gh workflow run <deploy_workflow> --ref main` para disparar deploy canônico.
2. O workflow roda no runner self-hosted (VPS) e executa o deploy localmente.
3. Medir com `gh run view <run_id>` (não `gh pr checks` que fica PENDING com fila grande).

## Workflows canônicos (CentralDark)
- `vps-exec-selfhosted.yml`: deploy atômico MCP + operational guards (runs-on: [self-hosted, Linux]).
- `vps-ssh-exec.yml`, `vps-healthcheck.yml`: exec remoto via runner.

## Armadilhas
- VPS SSH key (`~/.ssh/segredo_vps_ed25519`) funciona para `root@89.117.78.124` mas pode cair por intermitência. Não gastar 30 timeouts; após 3, assumir runner online e usar workflow.
- Deploy via workflow exige que o runner tenha o repo em `/root/CentralDark` e PM2 configurado (verificado pelo próprio workflow).
- Não declarar "VPS down" só porque SSH falhou — medir runner via API primeiro.
