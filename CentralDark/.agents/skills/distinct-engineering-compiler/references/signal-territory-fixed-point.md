# Signal + Territory + Fixed Point — cristal operacional

Este arquivo é referência executável da skill `distinct-engineering-compiler`. Não cria owner, cérebro, autoridade ou Judge novos.

## Ouro generalizado

### Instrumentos → emissor de sinal

```text
USE
→ SIGNAL_SIGNATURE
→ TIMESTAMP
→ SOURCE
→ CONTEXT
→ EXPECTED_EFFECT
→ OBSERVED_EFFECT
```

Um emissor pode ser áudio, evento, visual, log, CI, webhook, notificação, voz, legenda, sensor ou superfície futura.

```text
SIGNAL_ONLY
STATE_CHANGE
ACTION_TRIGGER
DECORATIVE
UNKNOWN_EFFECT
```

`SIGNAL_OBSERVED != CAUSE_PROVEN`.

### Goroma → território degradado + rota de recuperação

```text
SEMANTIC_TERRITORY
→ AVAILABLE_CAPABILITIES
→ ABSENT_CAPABILITIES
→ HAZARDS
→ CURRENT_ROUTES
→ WORLD_CHANGE_OVERLAY
```

Quando uma perturbação remove a rota normal:

```text
INCIDENT
→ STRANDED_STATE
→ CONTAIN
→ IDENTIFY_MINIMUM_RECOVERY_RESOURCE
→ REPAIR_ROUTE
→ REMEASURE_MAP_AND_CAPABILITIES
→ EXIT_OR_CONTINUE
```

Aplicação CentralDark:

```text
RUNNER_OFFLINE
TOOL_UNAVAILABLE
ENDPOINT_DOWN
WRITER_CONFLICT
CI_ROUTE_BROKEN
DEPENDENCY_FAILURE
→ NÃO INVENTAR CAPACIDADE
→ CONTER ESCOPO
→ LOCALIZAR RECURSO/OWNER DE RECUPERAÇÃO
→ REPARO MÍNIMO
→ T0→T1
→ REINDEXAR ROTAS AFETADAS
```

### Mapa mutável

```text
BASE_MAP
+ ACTIVE_WORLD_CHANGE
→ EFFECTIVE_MAP
```

Logo:

```text
DOCUMENTED_TOPOLOGY != EFFECTIVE_TOPOLOGY
HISTORICAL_ROUTE != CURRENT_ROUTE
ACTIVE_OVERLAY_MUST_BE_MEASURED=true
```

## Capability Contract Router

Papel não é identidade. Nome não é capacidade. O roteamento usa contrato mensurável.

```text
REQUEST
+ SEMANTIC_TERRITORY
+ REQUIRED_CAPABILITY
+ CURRENT_CAPABILITY_STATE
→ CANDIDATE_ROUTES
→ FILTER_BY_AUTHORITY
→ FILTER_BY_AVAILABILITY
→ FILTER_BY_SCOPE
→ CANONICAL_OWNER
→ HANDOFF_CONTRACT
```

Contrato mínimo:

```yaml
CAPABILITY_CONTRACT:
  capability: ""
  territory: ""
  provider: ""
  owner: ""
  available: true|false|unknown
  evidence: ""
  input_contract: ""
  output_contract: ""
  side_effect_scope: ""
  rollback: ""
  proof_target: ""
  next_cursor: ""
```

## Grafo semântico

Todo cristal deve poder ser ligado ao Grafo Vivo:

```text
NODE = território|capacidade|emissor|owner|consumer|estado
EDGE = emits|requires|routes_to|blocks|repairs|proves|supersedes
```

Uma mudança material invalida somente as rotas dependentes dela.

## Matriz adversarial 10 × 12

Objetivo: tentar quebrar a transferência antes de promover. Não produzir 120 mudanças artificiais.

### 10 passes

```text
P1  FORWARD
P2  REVERSE
P3  TOP_DOWN
P4  BOTTOM_UP
P5  ROUND_TRIP
P6  TEMPORAL_T0_T1
P7  DEPENDENCY_BLAST_RADIUS
P8  ADVERSARIAL_FALSE_GREEN
P9  MINUS_IS_MORE_COMPRESSION
P10 FIXED_POINT_REMEASUREMENT
```

### 12 lentes

```text
L1  INTENT
L2  AUTHORITY
L3  IDENTITY_ROLE
L4  STATE
L5  CAPABILITY
L6  OWNER_CONSUMER
L7  SIGNAL_CAUSALITY
L8  TERRITORY_ROUTE
L9  MUTATION_WRITER
L10 PROOF_JUDGE
L11 CONTINUITY_RECEIPT
L12 LEARNING_CRYSTAL
```

Execução:

```text
FOR pass IN P1..P10:
  FOR lens IN L1..L12:
    TRY_TO_FALSIFY(current_crystal, pass, lens)
    NEW_INFORMATION?
      YES → APPLY_BELIEF_DELTA → RESTART_AFFECTED_PASSES
      NO  → SKIP_JUSTIFICADO
```

Regra invertida:

```text
DESTINATION → PROOF → EFFECT → EXECUTION → WRITER → GATE
→ MEANING → SIGNAL → OWNER → CAPABILITY → STATE → INTENT
```

O reverse pass deve reconstruir a cadeia até a intenção sem perder proveniência ou inventar causa.

## Fixed point

```text
FIXED_POINT somente quando:
- nenhum pass produz delta material novo;
- reverse reconstrói a mesma intenção/destino;
- T0→T1 está ligado ao mesmo target;
- owner/consumer não conflitam;
- UNKNOWN material não foi promovido;
- mutação continua serializada;
- Judge é separado do Writer quando aplicável;
- o cristal reduz repetição futura.
```

```text
NO_NEW_INFORMATION
→ NO_CHANGE
→ FIXED_POINT_CANDIDATE
→ FINAL_REMEASUREMENT
→ EXTERNAL_JUDGE
```

`SELF_PROOF != PASS` e `FIXED_POINT_CANDIDATE != MERGED_TO_MAIN`.
