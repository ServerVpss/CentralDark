# microdeploy-20260925T041849Z — CentralDark Micro Deploy de rotas determinísticas

- observed_at_utc: 2026-09-25T04:18:49Z
- branch: main
- head: 7f432be35aaff9ecc50f31a4d50512e645b629f7
- verdict: PASS_SCOPE_MICRO_DEPLOYED

## Regra aplicada

QUALQUER_PASS_COMPROVADO → MICRO_DEPLOY_DO_ESCOPO_AFETADO → HEALTH/PROVA_RUNTIME → RECEIPT → NEXT_TIK_TAK.

## Rotas provadas neste ciclo

| Rota | Evidência | Estado |
| --- | --- | --- |
| MCP :9100 /health | HTTP 200 + LISTEN | PASS |
| Hermes Core :8899 /health | HTTP 200 + LISTEN | PASS |
| Hermes Serve :33733 | socket LISTEN | PASS |
| Desktop Commander conta1 | systemd enabled|active|0|409480 | PASS |
| Desktop Commander conta2 | systemd enabled|active|0|1628931 | PASS |
| tunnel-client centraldark-mcp | process_count 1 | PASS |
| Omni Router :8099 | HTTP 000 + CLOSED | UNKNOWN_OR_FAIL_SEPARATE_DEBT |

## Cadeados

- UNKNOWN != PASS
- ACTION_REQUIRED != PASS
- PASS_VISUAL_BADGE_ONLY = false
- SECRET_EXPOSED = false
- :8099 não bloqueia micro-deploy das rotas independentes já provadas.

## NEXT_CURSOR

Expandir para próxima rota determinística; reparar :8099 em escopo separado; registrar receipt no PR-mãe.
