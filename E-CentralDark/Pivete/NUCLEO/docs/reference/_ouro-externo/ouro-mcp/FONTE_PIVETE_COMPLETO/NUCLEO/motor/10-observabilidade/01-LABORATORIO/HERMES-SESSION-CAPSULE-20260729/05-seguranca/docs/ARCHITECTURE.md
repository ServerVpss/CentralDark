# Arquitetura — SENSORY_PLANE

```text
EVENT SOURCE
    │
    ▼
SENSOR NORMALIZER
    │
    ▼
TELEMETRY BUS
    │
    ├─► STATE MIRROR
    ├─► DRIFT DETECTOR
    ├─► BOUNDARY SENTINEL
    ├─► WRITER COLLISION WATCH
    ├─► EVIDENCE CONFLICT WATCH
    └─► HEARTBEAT WATCH
            │
            ▼
       SIGNAL FUSION
            │
            ▼
       META_LUPA GATE
            │
            ▼
      COUNTEREVIDENCE
            │
            ▼
      REALITY_JUDGE
       /    |     \
   PROVEN UNKNOWN FAILED
      │      │      │
      │      │      └─► REMEDIATE / CONTAIN
      │      └────────► FIND_EVIDENCE
      ▼
 RECEIPT + SHA + NEXT_CURSOR
```

## Planos

```text
CONTROL_PLANE:
  CHEFE / SOL / BOUNDARY / WRITER_LOCK

EXECUTION_PLANE:
  HERMES / workers / tools

SENSORY_PLANE:
  GUARDIÃ / telemetry / detectors / signal fusion

JUDGMENT_PLANE:
  META_LUPA / REALITY_JUDGE
```

Nenhum plano herda a autoridade de outro.

## Reflexos automáticos

```text
STATE_CHANGED
→ invalidate stale receipt
→ #ACORDAR

WRITER_CONFLICT
→ READ_ONLY
→ RENDEZVOUS

BOUNDARY_TOUCHED
→ STOP_PROPAGATION
→ CONTAIN
→ MEASURE

EVIDENCE_CONFLICT
→ META_LUPA
→ DISCRIMINATING_TEST

UNKNOWN_MATERIAL
→ NO_MUTATION
→ FIND_EVIDENCE

HEARTBEAT_LOST
→ mark UNKNOWN
→ independent health check

PROOF_TARGET_MISMATCH
→ INVALIDATE_VERDICT
→ measure correct target

NO_NEW_INFORMATION
→ NO_CHANGE
→ FIXED_POINT_CHECK
```
