---
title: "Alquimia operacional — minério, ouro, cristal e continuidade"
date: 2026-08-24
updated: 2026-08-24T19:45:00-03:00
status: "CRISTAL OPERACIONAL DERIVADO"
tags: [aprendizado, material-ingest, knowledge-compiler, handoff, pombo, anti-papagaio]
authority: "SEGREDO/CHEFE"
owner: ".agents/skills/knowledge-compiler/ + docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MATERIAL-INGEST.md + docs/CONSCIENCIA/02-PROTOCOLO-HANDOFF-IA.md"
consumer: "Trigger Fabric + Knowledge Compiler + Hermes quando runtime provar herança"
source_rule: "fonte ensina padrão; realidade e owners canônicos governam"
---

# Alquimia operacional — minério → ouro → cristal → FLASH

Este cristal generaliza aprendizados de múltiplas sessões, PRs, screenshots,
correções humanas e evidências históricas apresentadas à CentralDark em
2026-08-24. Não cria cérebro, engine, agente, autoridade ou dispatcher novo.

```text
AUTHORITY_FINAL=SEGREDO/CHEFE
SOL=COORDENA_RECONCILIA
PIVETE_HERMES=EXECUTA_PRESERVA
PAPAGAIO=FAILURE_MODE_NOT_ROLE
POMBO=PROOF_CARRYING_CONTINUITY_TRANSPORT
REALITY=JUDGE
```

## 1. O lugar do Papagaio

Papagaio não é personagem necessário da arquitetura. É o nome cultural de uma
falha operacional que qualquer superfície/modelo pode cometer.

```text
PAPAGAIO_MODE=OFF

PAPAGAIO =
UNMEASURED_NARRATIVE
| REPEAT_WITHOUT_STATE
| RETURN_MECHANICAL_WORK_TO_CHEFE
| SCREENSHOT_AS_LIVE_STATE
| HISTORY_AS_CURRENT_STATE
| ACTION_AS_PROOF
| UNKNOWN_REMOVED_TO_LOOK_GREEN
| PROOF_LEFT_OUTSIDE_DESTINATION
```

Logo:

```text
PAPAGAIO_IS_ENGINE=false
PAPAGAIO_IS_OWNER=false
PAPAGAIO_IS_AGENT=false
PAPAGAIO_IS_FAILURE_SIGNATURE=true
```

## 2. O lugar do Pombo

O Pombo também não governa. Ele transporta continuidade já medida e preserva o
fio entre sessão, modelo, PR, Git, Hermes e próximo boot.

```text
POMBO_MODE=CHECKSUM_ON

POMBO =
DESTINATION_LOCK
+ OBSERVED_AT
+ HEAD_SHA_OR_CONTENT_SHA256
+ PROVENANCE
+ EVIDENCE
+ UNKNOWN
+ RESIDUAL
+ RECEIPT
+ NEXT_CURSOR
```

O Pombo entra **depois que há estado/evidência para transportar** e antes da
próxima superfície assumir o fio.

```text
POMBO != CEREBRO
POMBO != OWNER
POMBO != WRITER
POMBO != JUDGE
POMBO != AUTHORITY
```

## 3. Lições aprendidas nas sessões

### L1 — Estado vivo vence narrativa

```text
HISTORY != CURRENT_STATE
SCREENSHOT != LIVE_STATE
PR_OPEN != MERGED
ACTION != PROOF
STATE_CHANGED → REMEASURE → RECALIBRATE
```

### L2 — Prova precisa chegar ao destino

Uma prova em chat que deveria governar um PR ainda não fechou o circuito.
Comentário pode ser receipt auxiliar; quando o PR body é o owner do julgamento,
a prova material deve estar nele ou referenciada por ele.

```text
PROOF_WITHOUT_DESTINATION_BINDING = INCOMPLETE_HANDOFF
DESTINATION_PROOF_REQUIRES_SCOPE_AND_HEAD=true
```

### L3 — Receipt é temporal

```text
RECEIPT_HEAD_SHA != CURRENT_HEAD_SHA
→ RECEIPT_BECOMES_HISTORY
→ REMEASURE
→ NEW_RECEIPT
```

### L4 — PR superseded exige seguir o fio, não ressuscitar cadáver

```text
PR_SUPERSEDED
→ RESOLVE_SUCCESSOR
→ PROVE_DELTA_ABSORBED
→ MOVE_RECEIPT_TO_LIVE_OWNER
→ DO_NOT_CREATE_PARALLEL_OWNER
```

### L5 — Muitas superfícies não significam muitos cérebros

```text
CHAT_A + CHAT_B + MODEL_C + HERMES + GITHUB
!= MULTIPLE_CENTRALDARKS

ONE_SYSTEM_ONLY
→ ONE_DESTINATION_LOCK
→ CAPABILITY_ROUTING
→ ONE_WRITER_PER_SCOPE
→ MANY_READ_ONLY_ARMS_WHEN_USEFUL
```

### L6 — Aprender significa não exigir o mesmo reensino mecânico

```text
HUMAN_CORRECTION
→ SIGNATURE
→ INVARIANT
→ OWNER
→ TEST
→ GATE
→ CRYSTAL
→ NEXT_EVENT_REUSES

REPEATED_MECHANICAL_RETEACH_AFTER_PROVEN_PROMOTION
= LEARNING_TRANSFER_FAIL
```

## 4. Máquina de estados da matéria

Todo material entra como matéria, não como verdade.

```text
RAW_MATERIAL
→ ASSAY
→ CANDIDATE
→ COUNTERPROOF
→ GOLD
→ OWNER_BINDING
→ TEST + GATE
→ CRYSTAL
→ FLASH
```

Saídas laterais:

```text
DUPLICATE → DROP_DUPLICATE_KEEP_PROVENANCE
CONFLICT → DISCRIMINATING_TEST
UNKNOWN → QUARANTINE_PRESERVE_UNKNOWN
FAIL → ROOT_CAUSE → MINIMAL_DELTA → RETEST
STALE → INVALIDATE_AFFECTED_ROUTE_ONLY
```

Definições:

```text
RAW_MATERIAL = link|texto|imagem|arquivo|log|erro|histórico|PR|correção
ASSAY = provenance + live_state + scope + owner_search + counterproof
CANDIDATE = útil, mas ainda sem prova operacional suficiente
GOLD = capacidade generalizável que sobreviveu à contraprova no escopo
CRYSTAL = GOLD + OWNER + SKILL + CONSUMER + TEST + GATE + PROVENANCE + ROUTE
FLASH = rota mínima reutilizável em runtime sem carregar o museu inteiro
```

## 5. Alchemistic Cabinet — alias cultural, não engine

Referência externa usada somente como metáfora:
`https://www.tibiawiki.com.br/wiki/Alchemistic_Cabinet`.

No material externo, o Alchemistic Cabinet é classificado como armário e pode
ser movido/reembrulhado. A CentralDark absorve somente o padrão útil de
**compartimentação móvel de matéria**, não o nome como arquitetura técnica.

```text
ALCHEMISTIC_CABINET = CULTURAL_ALIAS_ONLY
ALCHEMISTIC_CABINET_IS_ENGINE=false
ALCHEMISTIC_CABINET_IS_OWNER=false
ALCHEMISTIC_CABINET_IS_AUTHORITY=false
```

Na Casa, o equivalente funcional já existe:

```text
MATERIAL_INGEST
+ ARTIFACT_PROPERTIES
+ KNOWLEDGE_COMPILER_FORJA
= MATERIAL_COMPARTMENTALIZATION_AND_DISTILLATION
```

As gavetas lógicas são estados, não diretórios obrigatórios:

```text
GAVETA_RAW       = matéria ainda não ensaiada
GAVETA_CANDIDATE = hipótese útil ainda não promovida
GAVETA_GOLD      = capacidade generalizada provada no escopo
GAVETA_CRYSTAL   = ouro amarrado a owner/consumer/test/gate/route
GAVETA_UNKNOWN   = resíduo preservado sem falso verde
```

`GAVETA_*` é linguagem de entendimento; não obriga criar pastas ou bancos novos.

## 6. Itens ganhos para o motor

Os ganhos reais desta rodada são capacidades, não personagens:

```text
ITEM_PROOF_DESTINATION_BINDING
  prova deve morar/referenciar o owner de destino e o HEAD correto

ITEM_SAME_HEAD_RECEIPT
  receipt fica preso ao HEAD; mudança de HEAD exige recalibração

ITEM_SUPERSEDED_CHAIN_FOLLOW
  PR morto aponta para successor; delta deve ser provado no owner vivo

ITEM_SCREENSHOT_SCOPE_GUARD
  screenshot prova apenas o que é visualmente observável

ITEM_MULTI_SURFACE_ONE_DESTINATION
  várias superfícies convergem por intenção/owner, não por sessão/UI id

ITEM_ALCHEMICAL_MATTER_STATES
  RAW → CANDIDATE → GOLD → CRYSTAL → FLASH

ITEM_LEARNING_TRANSFER
  regra promovida e provada deve ser reutilizada sem reensino mecânico
```

Esses itens pertencem ao scaffold cognitivo da Casa e devem ser consumidos por
owners existentes; não são poderes concedidos a modelos.

## 7. Arquitetura integrada

```text
                         👑 SEGREDO/CHEFE
                    intenção + autoridade final
                               │
                               ▼
               #ACORDAR → !CALIBRAR → !MULTIBÚSSOLA
                               │
                               ▼
                              SOL
                      coordena / reconcilia
                               │
                 ┌─────────────┼─────────────┐
                 ▼             ▼             ▼
             PERCEPÇÃO       GRAFO        BRAÇOS
             read-only       derivado      substituíveis
                 └─────────────┼─────────────┘
                               ▼
                           META LUPA
                         tenta falsificar
                               │
                               ▼
                       WRITER ÚNICO/ESCOPO
                               │
                               ▼
                         PIVETE / HERMES
                        executa / preserva
                               │
                               ▼
                  EXECUTAR → MEDIR → REMEDIAR
                               │
                               ▼
                         REALITY JUDGE
                               │
                  ┌────────────┴────────────┐
                  ▼                         ▼
                FALHOU                    PROVOU
                  │                         │
        causa → delta → reteste        receipt/evidência
                  │                         │
                  └────────────┬────────────┘
                               ▼
                    MATERIAL_INGEST / MOINHO
                               │
                               ▼
                    KNOWLEDGE_COMPILER / FORJA
                               │
             RAW → CANDIDATE → GOLD → CRYSTAL
                               │
                               ▼
                             FLASH
                               │
                               ▼
                 🕊️ POMBO CHECKSUM / HANDOFF
                               │
                               ▼
                   ESTADO/GRAFO ATUALIZADO
                               │
                               ▼
                       PRÓXIMO #ACORDAR
```

## 8. Invariantes

```text
AUTHORITY_FINAL_IS_CHEFE=true
PAPAGAIO_MODE_DEFAULT=OFF
POMBO_MODE_DEFAULT=CHECKSUM_ON
PROOF_MUST_REACH_DESTINATION=true
RECEIPT_IS_HEAD_SCOPED=true
STATE_CHANGE_REQUIRES_REMEASURE=true
SUPERSEDED_PR_REQUIRES_SUCCESSOR_RESOLUTION=true
SCREENSHOT_IS_NOT_RUNTIME_PROOF=true
MULTIPLE_SURFACES_ARE_NOT_MULTIPLE_BRAINS=true
ALCHEMISTIC_CABINET_IS_CULTURAL_ALIAS_ONLY=true
RAW_MATERIAL_IS_NOT_GOLD=true
GOLD_IS_NOT_CRYSTAL=true
CRYSTAL_REQUIRES_OWNER_CONSUMER_TEST_GATE=true
UNKNOWN_MUST_SURVIVE=true
NO_NEW_ENGINE_FROM_METAPHOR=true
LEARNING_TRANSFER_FAIL_ON_RETEACH=true
```

## 9. Contraprova e limite do cristal

Este documento prova a **regra registrada no repositório** quando o gate do
mesmo HEAD a verificar. Não prova automaticamente que todo runtime Windows,
VPS, Hermes ou toda sessão externa já carregou a regra.

```text
CONTRACT_IN_GIT != UNIVERSAL_RUNTIME_PROOF
CRYSTAL_FILE_PRESENT != BEHAVIOR_PROOF
CI_PASS != ALL_EXTERNAL_RUNTIME_PASS
UNKNOWN != PASS
```

A promoção forte só existe quando a rota aplicável possuir owner, consumidor,
teste, gate, evidência e contraprova no mesmo alvo.
