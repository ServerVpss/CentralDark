# HERMES — State-Driven Narration + Rolling Handoff

Data: 2026-09-16
Status: SOURCE_CRYSTALLIZED
Owner: HERMES-CORE / protocolo de continuidade existente
PR: #1554

## Intenção

Preservar a narração operacional como trilho de orientação e continuidade, sem permitir que repetição verbal seja confundida com progresso.

## Invariantes

```text
NARRATION_IS_OPERATIONAL_RAIL=true
NARRATION_IS_NOT_PROGRESS_BY_ITSELF=true
NARRATION_MODE=STATE_DRIVEN
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
UNKNOWN != PASS
```

## Regra determinística

```text
STATE_FINGERPRINT = hash(
  MISSION_ID
  + GOAL
  + POSITION
  + OWNER
  + WRITER_SCOPE
  + LAST_ACTION
  + LAST_EVIDENCE
  + LAST_DELTA
  + CURRENT_HYPOTHESIS
  + CURRENT_STATE
  + RESIDUAL
  + UNKNOWNS
  + NEXT_CURSOR
)

NEW_STATE_HASH != OLD_STATE_HASH
→ NARRATE_DELTA
→ UPDATE_ROLLING_HANDOFF

NEW_STATE_HASH == OLD_STATE_HASH
→ SUPPRESS_DUPLICATE_NARRATION
→ KEEP_GOAL
→ KEEP_NEXT_CURSOR
→ CONTINUE
```

`updated_at` não participa do fingerprint material e não pode fabricar delta.

## Rolling Handoff

```text
MISSION_ID
GOAL
POSITION
OWNER
WRITER_SCOPE
LAST_ACTION
LAST_EVIDENCE
LAST_DELTA
CURRENT_HYPOTHESIS
CURRENT_STATE
RESIDUAL
UNKNOWNS
NEXT_CURSOR
UPDATED_AT
STATE_HASH
```

## Arquitetura

Este delta não cria novo cérebro, engine, bot, registry, plugin ou dashboard. Ele reutiliza:

- HERMES-CORE;
- protocolo canônico de handoff;
- Trigger Fabric;
- OUTPUT_GUARD / REALITY_JUDGE;
- receipts e NEXT_CURSOR existentes.

Plugins/HUD podem projetar o estado, mas não são o enforcement.

## Prova em source

Implementação:

- `apps/modulos/HERMES-CORE/core/state-driven-narration.mjs`
- `apps/modulos/HERMES-CORE/core/state-driven-narration.test.mjs`

Cobertura mínima:

- mesmo estado suprime emissão duplicada;
- evidência/estado novo libera uma emissão;
- timestamp sozinho não fabrica delta;
- rolling handoff preserva GOAL e NEXT_CURSOR com o mesmo hash material.

## Fronteira atual

```text
SOURCE_CRYSTALLIZED=true
RUNTIME_BOUND=NOT_PROVEN
HUD_PROJECTED=NOT_PROVEN
TRIGGER_HOOK_BOUND=NOT_PROVEN
CI_SAME_HEAD=UNKNOWN_UNTIL_MEASURED
GLOBAL_FIXED_POINT=NOT_REACHED
```

## NEXT_CURSOR

1. ligar o guard ao ponto de emissão/continuidade já existente no HERMES-CORE;
2. reutilizar hook do Trigger Fabric em vez de criar hook paralelo;
3. projetar contadores de `duplicates_suppressed` e `state_changes` no HUD existente;
4. provar no runtime vivo que repetição idêntica é cortada e delta novo continua narrado;
5. emitir receipt runtime e revalidar CI no mesmo HEAD.
