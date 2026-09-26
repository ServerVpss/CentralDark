# Housekeeping dispatch — passo a passo

## Pré-requisito
Branch com o job `vps-housekeeping` no `vps-exec-selfhosted.yml` + o script
`scripts/vps/vps-housekeeping-scan.mjs` no repo.

(Nesta sessão: branch `feat/vps-housekeeping`, commit `947bbf64f`.)

## Dispatch
```bash
gh workflow run "VPS Deploy canônico (self-hosted)" --ref feat/vps-housekeeping
```
- NÃO passar `--field workflow_dispatch=1` → HTTP 422 (input inválido).
- O `workflow_dispatch:` do yml é vazio; o gatilho já é o dispatch em si.

## Observar
```bash
gh run view <RUN_ID> --json status,conclusion,jobs
gh run list --workflow "vps-exec-selfhosted.yml" --limit 5
```

## Ler o resultado
O step "Varredura lixo/ouro (report-only, sem destruir)" imprime JSON
`{wrote, lixo, ouro, total, disk_used_pct}`. O JSONL completo fica em
`/root/CentralDark/logs/housekeeping/<timestamp>.jsonl` na VPS.

## Agir (só após CHEFE confirmar)
Cada item `lixo` é candidato a remoção/promoção. NÃO remover automaticamente.
Confirmar item a item, step by step, zero regressão.

## Bloqueio conhecido
Runner self-hosted pode estar OFFLINE → run fica `pending` indefinido
(visto: run #62, #32916847718). Sem shell livre na VPS, não há "shot em tempo
real" nesse caso — declarar o bloqueio, não fabricar screenshot.
