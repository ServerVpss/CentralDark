# Arquitetura Integrada — Proof-Carrying Closed Loop Control

```text
                         👑 SEGREDO/CHEFE
                    intenção + autoridade final
                               │
                               ▼
          #ACORDAR → !CALIBRAR → !MULTIBÚSSOLA → !META_LUPA
                               │
                               ▼
                              SOL
                      coordena / reconcilia
                               │
                 ┌─────────────┼─────────────┐
                 ▼             ▼             ▼
              PERCEPÇÃO      GRAFO         BRAÇOS
              READ_ONLY      derivado       motores/tools
                 └─────────────┼─────────────┘
                               ▼
                           META LUPA
                         tenta falsificar
                               │
                               ▼
                       WRITER ÚNICO/ESCOPO
                               │
                               ▼
                         HERMES / PIVETE
                        executa / preserva
                               │
                               ▼
                  EXECUTAR → MEDIR → REMEDIAR
                               │
                               ▼
                         OUTPUT_GUARD
                               │
                               ▼
                         REALITY JUDGE
                               │
                  ┌────────────┴────────────┐
                  ▼                         ▼
                FALHOU                    PROVOU
                  │                         │
       causa → owner → delta          evidence → receipt
          → reteste → counterproof        │
                  └────────────┬────────────┘
                               ▼
                    MATERIAL_INGEST / MOINHO
                               │
                               ▼
                    KNOWLEDGE_COMPILER / FORJA
                               │
                 RAW → CANDIDATE → GOLD
                               │
                               ▼
                             CRYSTAL
                               │
                               ▼
                              FLASH
                               │
                               ▼
                    🕊️ POMBO CHECKSUM
                               │
                               ▼
                          NEXT_CURSOR
                               │
                               ▼
                        PRÓXIMO #ACORDAR
```

```text
ARCHITECTURE_CLASS = PROOF_CARRYING_CLOSED_LOOP_CONTROL
STATE_MODEL = EPISTEMIC_STATE_MACHINE
MUTATION_MODEL = SERIALIZED_SINGLE_WRITER
CONTINUITY_MODEL = RECEIPT_PLUS_CHECKSUM_PLUS_NEXT_CURSOR
KNOWLEDGE_MODEL = RAW_TO_GOLD_TO_CRYSTAL_TO_FLASH
REALITY_IS_FINAL_JUDGE = true
```

## Planos

AUTHORITY_PLANE → CHEFE.
ORIENTATION_PLANE → #ACORDAR + !CALIBRAR + !MULTIBÚSSOLA.
PERCEPTION_PLANE → Grafo/Vigia/J.R.V.S./outros braços READ_ONLY.
FALSIFICATION_PLANE → !META_LUPA.
MUTATION_PLANE → ONE_WRITER_PER_SCOPE.
EXECUTION_PLANE → HERMES/PIVETE.
JUDGMENT_PLANE → REALITY_JUDGE.
KNOWLEDGE_PLANE → Material Ingest + Knowledge Compiler.
CONTINUITY_PLANE → Pombo checksum + NEXT_CURSOR.

## Evolução segura

```text
STATE_CHANGED → REMEASURE → RECALIBRATE
FAIL → ROOT_CAUSE → EXISTING_OWNER → MINIMAL_DELTA → RETEST → COUNTERPROOF
PROVEN → RECEIPT → SHA/CHECKSUM → LEARNING → NEXT_CURSOR
NOT_PROVEN → permanece NOT_PROVEN
```
