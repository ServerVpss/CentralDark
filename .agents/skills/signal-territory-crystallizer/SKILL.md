---
name: signal-territory-crystallizer
description: Transforma sinais e mudanças de ambiente em estado semântico mensurável, correlação T0→EVENT→T1, rotas afetadas e cristal reutilizável sem promover correlação a causa.
---

# SIGNAL TERRITORY CRYSTALLIZER

## Função

Ler áudio, evento, visual, texto, log, CI, webhook, runtime, UI, notificação ou sensor como **telemetria semântica**, resolver o território afetado, medir mudança de estado e produzir cristal somente quando houver ganho informacional comprovado.

```text
HOUSE_WIDE=true
MULTIMEDIA_AS_TELEMETRY=true
SIGNAL_IS_NOT_CAUSE=true
CORRELATION_IS_NOT_PROOF=true
REALITY_IS_JUDGE=true
REUSE_BEFORE_CREATE=true
```

## Modelo de sinal

```yaml
SIGNAL:
  kind: audio|event|visual|text|runtime|ci|webhook|notification|sensor|other
  signature: ""
  source: ""
  observed_at: ""
  semantic_territory: ""
  context_ref: ""
  expected_effect: ""
  observed_effect: ""
```

Classificação:

```text
SIGNAL_ONLY
STATE_CHANGE
ACTION_TRIGGER
DECORATIVE
UNKNOWN_EFFECT
```

## Modelo de território

```yaml
TERRITORY_STATE:
  territory: ""
  state_ref: ""
  available_capabilities: []
  absent_capabilities: []
  hazards: []
  routes: []
  active_overlays: []
```

```text
BASE_MAP + ACTIVE_OVERLAYS → EFFECTIVE_MAP
DOCUMENTED_TOPOLOGY != EFFECTIVE_TOPOLOGY
HISTORY != CURRENT_STATE
```

Território é semântico. Pode representar repo, CI, runtime, rede, UI, memória/grafo, observabilidade, governança, ferramentas ou outro domínio material.

## Correlação temporal

```text
STATE_T0
→ SIGNAL|EVENT
→ STATE_T1
→ DIFF
→ CAUSAL_HYPOTHESIS
→ DISCRIMINATING_TEST
→ COUNTERPROOF
→ VERDICT
```

Registro:

```yaml
TEMPORAL_CORRELATION:
  target: ""
  t0_ref: ""
  signal_ref: ""
  t1_ref: ""
  observed_diff: ""
  causal_hypothesis: ""
  discriminating_test: ""
  verdict: FACT|INFERENCE|HYPOTHESIS|UNKNOWN
```

## Recuperação de território degradado

Quando o ambiente perde capacidade ou rota normal:

```text
INCIDENT
→ STRANDED_OR_DEGRADED_STATE
→ CONTAIN
→ INVENTORY_SURVIVING_CAPABILITIES
→ IDENTIFY_MINIMUM_RECOVERY_RESOURCE
→ ROUTE_TO_RECOVERY_OWNER
→ REPAIR_MINIMAL_ROUTE
→ REMEASURE_EFFECTIVE_MAP
→ REOPEN_ONLY_PROVEN_ROUTES
```

Nunca assumir que uma rota histórica continua válida depois da mudança.

## Grafo Vivo

Gerar relações semânticas compactas:

```text
NODE = signal|territory|capability|owner|consumer|state|route|crystal
EDGE = emits|observed_in|requires|routes_to|blocks|repairs|proves|supersedes
```

Somente dependências afetadas devem ser invalidadas/recalculadas.

## 10 × 12 adversarial

Usar a referência da skill-mãe:

`../distinct-engineering-compiler/references/signal-territory-fixed-point.md`

A matriz tenta falsificar o cristal em 10 passes × 12 lentes, incluindo percurso invertido. Célula sem informação nova vira `SKIP_JUSTIFICADO`, não nova regra.

## Fixed point

```text
CRYSTAL_CANDIDATE
→ ADVERSARIAL_10x12
→ NEW_INFORMATION?
   YES → UPDATE_CRYSTAL → REPLAY_AFFECTED_PASSES
   NO  → FINAL_REMEASUREMENT
→ META_LUPA
→ REALITY_JUDGE
→ FIXED_POINT
```

Fixed point significa estabilidade epistemológica do cristal no alvo medido; não significa deploy, merge ou runtime ativo.

## Saída

```yaml
AMBIENT_CRYSTAL:
  signal_signature: ""
  territory: ""
  target: ""
  state_t0: ""
  event: ""
  state_t1: ""
  effect_class: ""
  capability_delta: ""
  affected_routes: []
  canonical_owner: ""
  consumer: ""
  proof_ref: ""
  verdict: FACT|INFERENCE|HYPOTHESIS|UNKNOWN
  reusable_delta: ""
  next_cursor: ""
```

## Anti-teatro

```text
SOUND_PLAYED != ACTION_EXECUTED
NOTIFICATION_SHOWN != CI_PASS
VOICE_SAID_READY != DESTINATION_PROVED
VISUAL_GREEN != SAME_TARGET_PROOF
MAP_DOCUMENTED != ROUTE_AVAILABLE
SKILL_CREATED != RUNTIME_BOUND
FIXED_POINT_CANDIDATE != MAIN
```

## Composição

```text
BOOT/STATE      → LEIA-ME-IA.md + AGENTS.md
GAP/TRANSFER    → distinct-engineering-compiler
ROUTING         → capability-contract-router
COUNTERPROOF    → meta-lupa
EXECUTION       → HERMES / centraldark-operational-method
GRAPH           → owner canônico aplicável do Grafo Vivo
TRIGGERS        → CENTRALDARK-TRIGGER-FABRIC
```
