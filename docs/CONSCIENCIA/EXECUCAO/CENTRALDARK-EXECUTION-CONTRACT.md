# Contrato obrigatório de execução — CentralDark

Status: MANDATORY
Owner: AGENTS.md + CI + hook local
Authority: SEGREDO/CHEFE
Ledger: PR-mãe #1562 ou PR filho equivalente

## Regra bruta

```ini
CENTRALDARK_EXECUTION_CONTRACT=MANDATORY
EVERY_CHANGE_ON_E_MUST_BE_MEASURED=true
EVERY_CHANGE_REQUIRES_TEST=true
EVERY_CHANGE_REQUIRES_COUNTERPROOF=true
EVERY_CHANGE_REQUIRES_GIT_RECEIPT=true
NO_UNRECORDED_LOCAL_CHANGE=true
NO_CLAIM_WITHOUT_EVIDENCE=true
NO_PUSH_WITHOUT_VALIDATION=true
NO_SECRET_IN_GIT=true
FAILURE_MUST_BE_LOCALIZED=true
```

## Fluxo obrigatório

```text
medir estado
→ executar
→ testar
→ contraprove
→ commit
→ push
→ receipt no #1562 ou PR filho equivalente
→ declarar concluído somente após prova local e prova GitHub
```

## Runtime e Casa local

Se a execução acontecer na VPS, no MCP, no runtime ou em `E:\CentralDark`, a mudança não pode morrer no disco local. Ela precisa virar commit/push e receipt, ou ficar `BLOCKED` com causa localizada.

## Conector caiu

Uma queda de conector não é fechamento. A sequência obrigatória é:

```text
retry
→ relogin/helper
→ sensor/túnel autorizado existente quando aplicável
→ BLOCKED só com host, causa, rotas tentadas e próxima ação
```
