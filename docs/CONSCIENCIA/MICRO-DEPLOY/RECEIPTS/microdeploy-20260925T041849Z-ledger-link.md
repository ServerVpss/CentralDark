# Ledger link — microdeploy-20260925T041849Z

PR_MOTHER=#1562
RECEIPT=docs/CONSCIENCIA/MICRO-DEPLOY/RECEIPTS/microdeploy-20260925T041849Z.md

## Estado

PASS_SCOPE_MICRO_DEPLOYED=true

## Rotas PASS

- MCP :9100 /health
- Hermes Core :8899 /health
- Hermes Serve :33733 socket
- Desktop Commander conta1 systemd
- Desktop Commander conta2 systemd
- tunnel-client centraldark-mcp

## Dívida separada

- Omni Router :8099 = UNKNOWN_OR_FAIL_SEPARATE_DEBT

## Regra

Qualquer PASS comprovado vira micro-deploy do escopo afetado. UNKNOWN não bloqueia escopo independente, mas também não vira PASS.
