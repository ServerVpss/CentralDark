# MICRO-HANDOFF — Casa / nova sessão de device

Data: 2026-09-20
PR-mãe: #1562

## Sinal recebido durante a trajetória

Foi recebido um recibo de autenticação/presença de um novo device da Casa com nome `SEGREDO`.

## Contraprova imediata

No instante seguinte, o conector de Remote Desktop disponível nesta sessão ainda não listou o novo device entre os devices visíveis. Portanto:

```text
AUTH_RECEIPT_SEEN=TRUE
USER_REPORTED_DEVICE_ONLINE=TRUE
CONNECTOR_CURRENT_VISIBILITY=UNKNOWN
HOUSE_RUNTIME_CURRENT=UNKNOWN
UNKNOWN_IS_NOT_PASS=true
```

## Regra de trajetória

A partir deste ponto, avanço material gera micro-commit/handoff no PR-mãe #1562 durante a execução, sem esperar o encerramento da missão.

```text
MATERIAL_DELTA
→ MICRO_COMMIT
→ HANDOFF_RECEIPT
→ PR_MOTHER_1562
→ CONTINUE
```

Este recibo não transforma presença declarada em acesso comprovado. Acesso à Casa só vira PASS quando o device estiver visível e executável pelo conector atual.
