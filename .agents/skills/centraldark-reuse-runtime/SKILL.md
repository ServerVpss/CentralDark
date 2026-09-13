---
name: centraldark-reuse-runtime
description: Preflight runtime CentralDark que força descoberta/reuso de decisões e owners existentes antes de criar capability, arquivo, serviço, router ou arquitetura. Deve ser selecionada no início de missões materiais e antes de criação estrutural.
trigger: /centraldark-reuse-runtime
---

# CentralDark Reuse Runtime

## Semântica

```text
AVAILABLE_ALWAYS=true
ACTIVE_ONLY_ON_DEMAND=true
AUTO_ACTIVATE_ON_DEMAND=true
STOP_AFTER_USE=true
NO_MODEL_WAKE_WITHOUT_DELTA=true
```

## Loop

```text
INTENT
→ MEASURE_CURRENT_STATE
→ SEARCH_PROVEN_DECISION
→ SAME_TARGET + SAME_PROOF_KEY + NO_CONTRADICTION ?
     YES → REUSE_DECISION → NEXT_UNPROVEN_DELTA
     NO  → SEARCH_EXISTING_OWNER
→ EXISTING_OWNER ?
     YES → REUSE_OR_EXTEND
     NO  → PROVE_GAP
→ GAP_PROVEN ?
     NO  → BLOCK_CREATE
     YES → CANDIDATE_ONLY
→ SANDBOX
→ TEST
→ NEGATIVE_TEST
→ COUNTERPROOF
→ REALITY_JUDGE
→ ELIGIBLE_PROMOTION
```

## Antes de criar

Perguntas obrigatórias:

1. Já existe capability equivalente?
2. Já existe owner que pode absorver o delta?
3. A decisão anterior ainda tem a mesma proof key?
4. HEAD/runtime/prova mudaram?
5. Existe contradição material nova?
6. O consumidor real foi medido?

Se a busca não foi executada:

```text
CREATE_NOT_AUTHORIZED
```

## Saída mínima

```text
REUSE_DECISION | REUSE_OWNER | EXTEND_OWNER | GAP_PROVEN | BLOCKED_UNKNOWN
OWNER
PROOF_KEY
EVIDENCE
NEXT_CURSOR
```
