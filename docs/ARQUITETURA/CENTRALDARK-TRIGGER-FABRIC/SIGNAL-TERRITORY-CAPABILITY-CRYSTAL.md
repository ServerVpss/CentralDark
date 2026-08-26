# SIGNAL → TERRITORY → CAPABILITY → CRYSTAL

Status: extensão composicional da Trigger Fabric; não cria sistema paralelo.

## Intenção

Generalizar matéria externa, sinais, ambientes mutáveis e falhas de capacidade em rotas mensuráveis, handoffs auditáveis e cristais reutilizáveis.

```text
👑 SEGREDO/CHEFE
→ ☼ #ACORDAR
→ ⚙ !CALIBRAR
→ 🧭 !MULTIBÚSSOLA
→ ☀️ SOL
→ SIGNAL INSTRUMENTS
→ SEMANTIC TERRITORY
→ CAPABILITY CONTRACT ROUTER
→ ⊛ META LUPA
→ 🛡 BOUNDARY/GATE
→ ✎ WRITER ÚNICO
→ ☿ HERMES
→ ∞ EXECUTE→MEASURE
→ EFEITO OBSERVÁVEL
→ ⚖ REALITY JUDGE
→ RECEIPT + NEXT_CURSOR
→ ✶ GRAFO T1
→ PRÓXIMO #ACORDAR
```

## Princípios

```text
ROLE != IDENTITY
NAME != CAPABILITY
SIGNAL != CAUSE
MAP_DOCUMENTED != MAP_EFFECTIVE
HISTORY != CURRENT_STATE
ACTION != PROOF
SELF_PROOF != PASS
UNKNOWN != PASS
MERGED != DEPLOYED
```

## Instrumentos semânticos

Qualquer canal pode ser tratado como emissor/adaptador quando produz assinatura observável:

```text
AUDIO|EVENT|VISUAL|TEXT|LOG|CI|WEBHOOK|RUNTIME|NOTIFICATION|SENSOR
→ SIGNATURE + SOURCE + TIMESTAMP + CONTEXT
→ EXPECTED_EFFECT vs OBSERVED_EFFECT
```

O canal é substituível. A semântica vem da correlação e da prova.

## Território semântico

```text
TERRITORY
= contexto operacional
+ capacidades disponíveis/ausentes
+ riscos
+ rotas
+ overlays/mudanças ativas
```

```text
BASE_MAP + ACTIVE_OVERLAY → EFFECTIVE_MAP
```

Mudança material reindexa somente dependências afetadas.

## Rota de recuperação

```text
CAPABILITY_ABSENT|ROUTE_BROKEN
→ CONTAIN
→ INVENTORY_SURVIVORS
→ RECOVERY_OWNER
→ MINIMUM_RECOVERY_RESOURCE
→ REPAIR_ROUTE
→ REMEASURE_CAPABILITY_AND_MAP
→ REOPEN_PROVEN_ROUTE
```

Dependência crítica não degrada silenciosamente.

## Capability contract

```text
INTENT
+ TARGET
+ TERRITORY
+ REQUIRED_CAPABILITY
+ AUTHORITY_SCOPE
+ CURRENT_AVAILABILITY
+ PROOF_TARGET
→ CANONICAL_OWNER
→ PROVIDER
→ HANDOFF
→ WRITER_IF_MUTATION
→ EXECUTION
→ SAME_TARGET_PROOF
```

## 10 × 12 e inversão

A cristalização é submetida a 10 passes × 12 lentes. O percurso invertido parte do destino/prova e deve reconstruir a intenção sem perder causalidade, escopo ou proveniência.

A matriz completa e o critério de fixed point estão em:

`.agents/skills/distinct-engineering-compiler/references/signal-territory-fixed-point.md`

Ferramenta determinística:

`scripts/trigger-fabric/semantic_crystal_tool.py`

Modos:

```text
route <json>       → resolve somente rotas comprovadas por fatos fornecidos
fixed-point <json> → exige 120 células + remeasurement + external judge + zero UNKNOWN/FAIL
--self-test        → contraprova positiva/negativa do contrato da ferramenta
```

A ferramenta não inventa owner, autorização, runtime, causalidade ou prova.

## Owners compostos

```text
BOOT/STATE        = LEIA-ME-IA.md + AGENTS.md
GAP/TRANSFER      = distinct-engineering-compiler
CAPABILITY_ROUTE  = capability-contract-router
SIGNAL/TERRITORY  = signal-territory-crystallizer
COUNTERPROOF      = meta-lupa
EXECUTION         = HERMES / centraldark-operational-method
TRIGGERING        = CENTRALDARK-TRIGGER-FABRIC
JUDGE             = REALITY
```

## Fixed point

```text
NEW_INFORMATION=FALSE
+ MATRIX_120_COMPLETE
+ ZERO_FAIL
+ ZERO_UNKNOWN
+ FINAL_REMEASUREMENT
+ EXTERNAL_JUDGE_REF
→ FIXED_POINT
```

`FIXED_POINT != MAIN`; PR/CI/Judge continuam obrigatórios para canonicidade no repositório.
