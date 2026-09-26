# Arquitetura completa — HUMAN MIND ROUTER

```text
                           SEGREDO/CHEFE
                     intenção + autoridade humana
                               │
                               ▼
                              SOL
                  coordenação + reconciliação
                               │
                               ▼
                      HUMAN MIND ROUTER
                   runtime genérico, read-only
                               │
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
 GEOFF-HUNTLEY-LENS     DEX-HORTHY-LENS      IAN-LIVINGSTONE-LENS
        │                      │                      │
        ├──────────────┬───────┴──────────┬───────────┤
        ▼              ▼                  ▼           ▼
GREG-PSTRUCHA-LENS  ALLIE-HOWE-LENS   FUTURE-LENS  FUTURE-LENS
        │              │                  │           │
        └──────────────┴──────────┬───────┴───────────┘
                                  ▼
                         ENVELOPE DE EVIDÊNCIA
                                  │
                                  ▼
                 NORMALIZE → DEDUPE → CLUSTER
                                  │
                                  ▼
                     CONFLITOS / CONTRAPONTOS
                                  │
                                  ▼
                       TESTE DISCRIMINANTE
                                  │
                                  ▼
                             REALIDADE
                                  │
          ┌───────────────────────┼────────────────────────┐
          ▼                       ▼                        ▼
      CONVERGED          MATERIAL_DISAGREEMENT           UNKNOWN
          │                       │                        │
          └───────────────┬───────┴────────────────────────┘
                          ▼
                     DELTA CANDIDATO
                          │
                          ▼
                Biblioteca Cognitiva atual
                          │
                          ▼
                Knowledge Compiler / owner
                          │
                          ▼
                    prova + reutilização
                          │
                          ▼
                         OURO
```

## Um runtime, N agentes nomeados

Não implementar cinco cópias de lógica. Implementar um único runtime:

```text
Human-Mind-Router
  load_profiles()
  select_lenses()
  recover_public_sources()
  build_lens_packet()
  normalize_outputs()
  reconcile()
```

Cada nome é um perfil declarativo carregado pelo mesmo runtime.

## Saída de cada lente

```yaml
lens_id: ""
target: ""
observation_time: ""
source_refs: []
facts: []
claims: []
counterclaims: []
questions_other_lenses_may_miss: []
tests_to_distinguish_hypotheses: []
candidate_delta: []
unknowns: []
write_authority: false
```

## Envelope comum

```text
TARGET=
OPERATIONAL_SCOPE=
EVENT_TIME=
OBSERVATION_TIME=
PROVENANCE=
CLAIM=
EVIDENCE_REF=
CLASS=FACT|INFERENCE|HYPOTHESIS|UNKNOWN
HUMAN_ROUTER_ID=
SOURCE_PUBLICATION_TIME=
SOURCE_KIND=
SOURCE_CANONICAL_URL=
CONTENT_FINGERPRINT=
INDEPENDENCE_CLUSTER=
```

## Convergência

Não há maioria como mecanismo de verdade.

```text
LENS_A diz X
LENS_B diz Y
→ confirmar mesmo target/scope/time
→ buscar fonte primária
→ formular teste discriminante
→ executar/observar
→ REALIDADE decide
```

Estados válidos: `CONVERGED`, `PARTIAL_CONVERGENCE`, `MATERIAL_DISAGREEMENT`, `UNKNOWN`, `NO_NEW_INFORMATION`.
