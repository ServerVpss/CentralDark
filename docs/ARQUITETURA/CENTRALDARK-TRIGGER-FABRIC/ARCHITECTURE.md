# CENTRALDARK — Trigger Fabric canônica

A Trigger Fabric **não é um novo orquestrador**. Ela é o contrato que liga os gatilhos da Casa aos owners já existentes, preservando `ONE_SYSTEM_ONLY`, `REUSE_BEFORE_CREATE`, `ONE_OWNER_PER_CAPABILITY` e `ONE_WRITER_PER_SCOPE`.

```text
SEGREDO/CHEFE
      ↓
INTENÇÃO + DESTINO
      ↓
DESTINATION_LOCK
      ↓
BOT / AGENT ENTRY
      ↓
CENTRALDARK_AI_BOOT
      ↓
#ACORDAR
A1 história/SOUL · A2 Git vivo · A3 owners/writers · A4 runtime/tools · A5 continuidade/delta
      ↓
!CALIBRAR
C1 intenção · C2 autoridade · C3 capacidades/reuso · C4 prova/risco · C5 engine/custo/latência
      ↓
!MULTIBUSSOLA
TOP-DOWN ↓ · BOTTOM-UP ↑ · FORWARD → · REVERSE ← · ROUND-TRIP ↔ · TRANSVERSAIS
      ↓
RENDEZVOUS
normalize → dedupe → conflito → teste discriminante
      ↓
META_LUPA ADAPTATIVA
FRIA | MÉDIA | QUENTE
      ↓
ROTEAR PARA OWNER EXISTENTE
      ↓
GraphRAG
Memory Linker
Session Harvester
MetaLupa
Reality Judge
Hermes Core
Knowledge Compiler
Vector Memory quando implementado/provado
      ↓
ONE WRITER PER SCOPE
      ↓
EXECUÇÃO MÍNIMA
      ↓
OUTPUT_GUARD
claim ↔ proof
hora/HEAD/proveniência
fato/inferência/hipótese/UNKNOWN
top-down ↔ bottom-up ↔ round-trip
falso-verde
history ↔ current
spec ↔ implementation
action ↔ proof
      ↓
REALITY JUDGE
  ┌────────┬────────┬────────┬────────┬────────┐
  ↓        ↓        ↓        ↓        ↓
PROVEN   FAILED   UNKNOWN   LOCKED   WORKING
  ↓        ↓        ↓
RECEIPT  REMEDE   MEDIR REALIDADE
CRYSTAL    ↘       ↙
LEARNING    RENDEZVOUS
  ↓
LAST_GOOD_STATE
  ↓
NEXT_CURSOR / NEXT BOOT
```

## Camisa de força de saída

A entrada correta não basta. Antes de qualquer retorno material ao humano, o `OUTPUT_GUARD` verifica o mesmo claim ao contrário:

```text
CLAIM
→ TARGET/SCOPE
→ OBSERVED_AT + SOURCE_TIME
→ HEAD/SHA/PROVENIÊNCIA
→ FACT | INFERENCE | HYPOTHESIS | UNKNOWN
→ OWNER + CONSUMER
→ TOP_DOWN_RESULT
→ BOTTOM_UP_RESULT
→ ROUND_TRIP_RESULT
→ EVIDENCE + COUNTEREVIDENCE
→ PROOF_TARGET_MATCH
→ TEMPORAL_FRESHNESS
→ ARITHMETIC/DENOMINATOR
→ DUPLICATE_CHECK
→ FALSE_GREEN_CHECK
→ HISTORY_CURRENT_CHECK
→ SPEC_IMPLEMENTATION_CHECK
→ ACTION_PROOF_CHECK
→ VERDICT
```

Contradição material no próprio veredito aciona AutoLupa e impede a saída até correção ou preservação explícita de `UNKNOWN`.

## Owners existentes

| Capacidade | Owner observado |
|---|---|
| Boot/governança | `LEIA-ME-IA.md`, `AGENTS.md`, `docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md` |
| `!MULTIBUSSOLA` | `docs/CONSCIENCIA/MULTIBUSSOLA.md` |
| MetaLupa | `.agents/skills/meta-lupa/` |
| Missões/retomada | `apps/modulos/HERMES-CORE/core/orchestrator.mjs` |
| Prompt operacional Hermes | `apps/modulos/HERMES-CORE/prompts/hermes-core.md` |
| GraphRAG | `apps/modulos/HERMES-CORE/agents/GraphRAG-Master/agent.mjs` |
| Memória/delta/dream/padrões | `scripts/memory-linker/` |
| Colheita de sessão | `.agents/skills/session-intelligence-harvester/SKILL.md` |
| Cristalização | `.agents/skills/knowledge-compiler/` |
| Memória vetorial | `.agents/skills/vector-memory/SKILL.md` |
| Gate global de entrada | `.github/workflows/porta-de-entrada.yml` |
| Juiz/promotor autônomo | `.github/workflows/autonomia-promocao.yml` |
| Empacotamento/counterproof | `.github/workflows/trigger-fabric-package.yml` |
| Labels | `docs/CONSCIENCIA/GITHUB-LABELS-OPERACIONAIS.md` |

## Automatismos observados no código

- mission poll: `5s`
- orphan recovery: `45s`
- GraphRAG refresh: `30m`
- GC legado: `6h` — **não promover como seguro automaticamente**; é destrutivo e precisa de reconciliação com a política atual.

## Anti-ruído e continuidade

```text
NO_NEW_INFORMATION → NO_CHANGE → NEXT
BYTE_IDENTICAL → PROCESS_ONCE_KEEP_PROVENANCE
LAST_GOOD_STATE → INPUT_DIFF → REVALIDATE_CHANGED_SURFACE_ONLY → NEXT_CURSOR
MODEL_SWITCH != RESET
SESSION_SWITCH != RESET
```

## Estados sem amarelo diplomático

```text
GREEN  = PROVEN
RED    = FAILED/BLOCKED
BLACK  = UNKNOWN/NOT_PROVEN
LOCKED = QUARANTINE/HUMAN_LOCK
WORKING/FORJA = ação em andamento, nunca PASS
```

Tema visual não é estado operacional.

## UNKNOWNs materiais preservados

```text
SESSION_END_HOOK_PHYSICAL_WIRING = NOT_PROVEN
DREAM_REVIEW_SCHEDULER_LOCAL = NOT_PROVEN
VECTOR_MEMORY_RUNTIME = NOT_PROVEN
WINDOWS_E_CENTRALDARK_SAME_HERMES_CORE_ACTIVE = NOT_PROVEN
BOT_ENTRY_RUNTIME_INHERITANCE_ALL_ENGINES = NOT_PROVEN_UNTIL_RUNTIME_TEST
```

A Casa não transforma esses UNKNOWNs em `PASS`. `UNKNOWN` faz a Casa andar atrás da realidade.

## Regra de interligação

```text
EVENTO
→ CLASSIFICAR
→ LOCALIZAR OWNER EXISTENTE
→ PROVAR CONSUMIDOR
→ NO_NEW_INFORMATION ? STOP : CONTINUE
→ RENDEZVOUS
→ ONE_WRITER
→ EXECUTAR
→ OUTPUT_GUARD
→ PROVAR NO MESMO ALVO
→ APRENDER
```

Nenhum `second brain`, `dispatcher-v2`, `MCP paralelo`, `GraphRAG-v2`, segundo scheduler, segundo promotor ou workflow equivalente nasce desta arquitetura.

## CASCO VIVO — perfil de resiliência adaptativa da Trigger Fabric

`CASCO VIVO` **não é uma segunda arquitetura**. É o perfil de resiliência da mesma Trigger Fabric para cenários de pressão, mudança, falha, conflito de prova ou risco de propagação.

```text
CASCO_VIVO_IS_PROFILE=true
CASCO_VIVO_IS_NEW_ORCHESTRATOR=false
CASCO_VIVO_IS_NEW_BRAIN=false
CASCO_VIVO_IS_NEW_AUTHORITY=false
```

### Dois cascos

O casco interno preserva invariantes que não podem deformar com a pressão:

```text
CHEFE_AUTHORITY
INTENT
BOUNDARY
WRITER
PROOF_STANDARD
REALITY_IS_JUDGE
UNKNOWN_IS_NOT_PASS
```

O casco externo pode se adaptar quando isso não altera autoridade, intenção, prova ou fronteira:

```text
MODEL
TOOL
ROUTE
ORDER
FREQUENCY
WORKER
RETRY_STRATEGY
OBSERVATION_CHANNEL
```

```text
CASCO_EXTERNO=FLEXIVEL_DENTRO_DA_CAPACIDADE_PROVADA
CASCO_INTERNO=INVARIANTE
MODEL_SWITCH_REQUIRES_CAPABILITY_CHECK_WHEN_MATERIAL=true
```

### Fluxo de pressão

```text
PERTURBATION
→ CLASSIFY
→ LOCALIZE
→ BOUNDARY_CHECK
→ CONTAIN_IF_PROPAGATION_RISK
→ ADAPT_MINIMALLY
→ REMEASURE
→ COUNTERPROOF
→ REALITY_JUDGE
→ RECOVER_OR_CONTINUE
```

Classes de perturbação reconhecidas:

```text
LOAD
LATENCY
DEPENDENCY_FAILURE
TOOL_FAILURE
STALE_STATE
MODEL_DISAGREEMENT
WRITER_COLLISION
AUTHORITY_CONFLICT
BOUNDARY_PRESSURE
EVIDENCE_CONFLICT
```

### Resposta por classe

```text
MODEL_UNAVAILABLE
→ MEASURE_ALTERNATIVE_ENGINE_CAPABILITY
→ SWITCH_ONLY_IF_SCOPE_CAPABILITY_IS_PROVEN

DEPENDENCY_FAILURE
→ CLASSIFY_CRITICALITY
→ CRITICAL ? FAIL_CLOSED_OR_CONTAIN : DEGRADE_SAFELY_IF_PROVEN

WRITER_COLLISION
→ READ_ONLY
→ RENDEZVOUS

EVIDENCE_CONFLICT
→ DISCRIMINATING_TEST

AUTHORITY_CONFLICT
→ FAIL_CLOSED_FOR_MUTATION

BOUNDARY_PRESSURE
→ STOP_PROPAGATION
→ PRESERVE_EVIDENCE
→ MEASURE

STALE_STATE
→ #ACORDAR
```

### Trust Firewall

O Trust Firewall é uma composição lógica dos gates existentes; não é serviço novo.

```text
INPUT
→ SOURCE?
→ AUTHORITY?
→ SCOPE?
→ CURRENT?
→ EVIDENCE?
→ OWNER?
→ CONSUMER?
→ EXECUTE|READ_ONLY|BLOCK
```

```text
CONTRIBUTOR != AUTHORITY
WRITER != AUTHORITY
JUDGE != AUTHORITY
MODEL != AUTHORITY
MAJORITY != AUTHORITY
PR != AUTHORITY
MEMORY != AUTHORITY
```

### Chave jogada fora — sem falso claim global

A Casa não declara `HIDDEN_PATHS=ZERO` globalmente sem inventário/denominador. O contrato correto é:

```text
KNOWN_HIDDEN_BYPASS_DISCOVERED
→ BLOCK_OR_REMOVE_WITH_ROLLBACK
→ MAP_CONSUMERS
→ RETEST

NO_NEW_HIDDEN_BYPASS_ALLOWED=true
NO_SHADOW_AUTHORITY_ALLOWED=true
NO_UNDOCUMENTED_OVERRIDE_ALLOWED=true
RECOVERY_PATH_REMAINS_EXPLICIT=true
ROLLBACK_PATH_REMAINS_EXPLICIT=true
```

Ausência global de bypass permanece `NOT_PROVEN` sem cobertura correspondente.

### Fixed point do CASCO VIVO

```text
DESTINATION_REACHED
AND INVARIANTS_PRESERVED
AND BOUNDARY_PRESERVED
AND WRITER_CLEAN
AND CLAIM_PROVEN
AND COUNTERPROOF_SURVIVED
AND ROLLBACK_VALID_WHEN_APPLICABLE
AND NO_MATERIAL_UNKNOWN_FOR_SCOPE
AND NO_NEW_INFORMATION
→ FIXED_POINT
```

`NO_MATERIAL_UNKNOWN_FOR_SCOPE` não exige ausência universal de desconhecidos; exige zero UNKNOWN material capaz de alterar o veredito do escopo atual.
