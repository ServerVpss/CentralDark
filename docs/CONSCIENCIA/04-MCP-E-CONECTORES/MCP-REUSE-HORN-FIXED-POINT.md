# MCP CentralDark - REUSE_BEFORE_CREATE por ponto fixo de Horn

## Autoridade e owner

```text
AUTHORITY=SEGREDO/CHEFE
OWNER_EXISTENTE=apps/modulos/mcp
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
UNKNOWN_IS_NOT_PASS=true
ERROR_REQUIRES_LEARNING=true
REALITY_IS_JUDGE=true
```

Este contrato não cria outro cérebro, outro MCP ou outro router. Ele estende o owner MCP existente com uma decisão determinística antes de qualquer nova capability/owner/bridge.

## Fonte matemática

Fonte usada: **Lógica Computacional 23 - Nelma Moreira**.

```text
SOURCE_SHA256=b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1
METHOD=HORN_FORWARD_CHAINING_TO_FIXED_POINT
```

A regra aplicada é a mesma ideia operacional do algoritmo de satisfazibilidade de Horn: fatos iniciais são marcados, regras propagam novos fatos e o ciclo repete até nenhuma marca nova aparecer. Se faltar fato material, o resultado permanece bloqueado/UNKNOWN em vez de receber verde por ausência de evidência.

## Função MCP

```text
resolver_reuse_before_create
```

Entrada mínima medida:

```text
capability
scope
owner_present
capability_present
same_scope
evidence_present
regression_absent
error_observed
learning_present
receipt_present
```

Saídas possíveis:

```text
EXTEND_EXISTING
REUSE_EXISTING
CREATE_MINIMAL
BLOCKED_UNKNOWN
BLOCKED_CONTRADICTION
MEASURE_MORE
```

## Regras de Horn materializadas

```text
OWNER_PRESENT + CAPABILITY_PRESENT -> REUSE_CANDIDATE
REUSE_CANDIDATE + SAME_SCOPE -> REUSE_REQUIRED
REUSE_REQUIRED + EVIDENCE_PRESENT + REGRESSION_ABSENT -> EXTEND_EXISTING
OWNER_GAP + CAPABILITY_GAP + EVIDENCE_PRESENT -> CREATE_MINIMAL
ERROR_OBSERVED -> LEARNING_REQUIRED
LEARNING_REQUIRED + LEARNING_PRESENT + RECEIPT_PRESENT -> LEARNING_REUSABLE
EVIDENCE_GAP -> BLOCKED_UNKNOWN
REGRESSION_UNKNOWN -> BLOCKED_UNKNOWN
ERROR_OBSERVED + LEARNING_GAP -> BLOCKED_UNKNOWN
LEARNING_REQUIRED + RECEIPT_GAP -> BLOCKED_UNKNOWN
```

## Fixed point mensurável

Um resultado só pode ser `pass=true` se TODOS forem verdadeiros:

```text
fixed_point_stable=true
owner_measured=true
capability_measured=true
evidence_present=true
regression_absent=true
learning_closed=true
unknown_is_not_pass=true
no_reuse_create_contradiction=true
```

Logo:

```text
ACTION != PROOF
ERROR != LEARNING
LEARNING != REUSABLE_WITHOUT_RECEIPT
DOCUMENTED != EXECUTED
UNKNOWN != PASS
```

## OAuth / invalid_client observado

O erro `invalid_client` visto em `/authorize` é compatível com o contrato atual do MCP: o servidor aceita cliente previamente registrado por `/register` ou Client ID Metadata Document HTTPS compatível. Um `client_id` opaco desconhecido não é promovido automaticamente porque isso permitiria fabricar confiança sem registro.

A evolução correta permanece no MESMO owner OAuth existente. O motor Horn deve devolver `EXTEND_EXISTING`, nunca `CREATE_MCP_V2`, quando owner/capability já existem e a evidência aponta somente lacuna de compatibilidade de registro.

## Continuidade

Depois de cada erro material:

```text
OBSERVE_ERROR
-> MEASURE_OWNER
-> resolver_reuse_before_create
-> REUSE/EXTEND owner existente
-> registrar_aprendizado quando houver aprendizado reutilizável
-> RECEIPT
-> REMEASURE
-> FIXED_POINT
```

Aprendizado bruto não é automaticamente verdade atual. Ele precisa de proveniência, receipt e remedição da primeira aresta temporal mutável.
