---
title: "Material Ingest — moinho obrigatório"
date: 2026-08-24
updated: 2026-08-24T19:53:00-03:00
status: CANONICO
tags: [material, ingest, harvester, compiler, flash, propriedades]
category: "M-Material"
sensitivity: INTERNAL
source: foto Notion + pacote FORJA-CRISTAL-FLASH + AGENTS.md
source_class: HUMAN_AUTHORITY
source_rule: "CANONICO -> ARTEFATO; artefato nao inventa canonico"
owner: docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/
consumer: Hermes + qualquer engine via AGENTS.md/CLAUDE.md
---

# Material Ingest — nada passa despercebido

## Lei

```text
TODO MATERIAL DESPEJADO NA CENTRALDARK
| MATERIAL QUE QUALQUER AGENTE USE
→ ENTRA NO MOINHO
→ NÃO PASSA DESPERCEBIDO
→ NÃO VIRA CÉREBRO PARALELO
```

## Moinho (owners já existentes)

```text
MATÉRIA (link|texto|imagem|pdf|código|log|erro|correção|evento)
→ TRIGGER FABRIC (MATERIAL_INGEST)
→ session-intelligence-harvester
→ scripts/memory-linker
→ knowledge-compiler (FORJA)
→ OWNER + SKILL + CONSUMER + TEST + GATE
→ ARTIFACT-PROPERTIES.yml (obrigatório)
→ vector-memory (índice derivado)
→ GraphRAG-Master (retrieval híbrido)
→ HERMES FLASH
→ AÇÃO MÍNIMA + PROVA + CONTRAPROVA
→ REMEDIÇÃO T0→T1
→ PRÓXIMA EXECUÇÃO COMEÇA MAIS ALTO
```

## Máquina de estados da matéria

O aprendizado `docs/CONSCIENCIA/APRENDIZADOS/2026-08-24-alquimia-operacional-minerio-ouro-cristal.md`
cristaliza a taxonomia sem criar engine novo.

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

Estados e regras:

```text
RAW_MATERIAL_IS_NOT_GOLD=true
GOLD_IS_NOT_CRYSTAL=true
CRYSTAL_REQUIRES_OWNER_CONSUMER_TEST_GATE=true
UNKNOWN_MUST_SURVIVE=true
NO_NEW_ENGINE_FROM_METAPHOR=true
```

Saídas laterais:

```text
DUPLICATE → DROP_DUPLICATE_KEEP_PROVENANCE
CONFLICT → DISCRIMINATING_TEST
UNKNOWN → QUARANTINE_PRESERVE_UNKNOWN
FAIL → ROOT_CAUSE → MINIMAL_DELTA → RETEST
STALE → INVALIDATE_AFFECTED_ROUTE_ONLY
```

O alias cultural `Alchemistic Cabinet` representa apenas compartimentação de matéria por estado. Não cria pasta obrigatória, banco, daemon, owner ou autoridade.

```text
ALCHEMISTIC_CABINET_IS_CULTURAL_ALIAS_ONLY=true
ALCHEMISTIC_CABINET_IS_ENGINE=false
```

## Dois setores — cognição enxuta + determinismo forte

A matéria extraída da conversa técnica sobre agentes reforça uma separação que a Casa já vinha construindo: o modelo raciocina em contexto pequeno e os invariantes importantes devem sobreviver fora da janela de contexto por contratos, testes e gates determinísticos.

```text
SETOR_COGNITIVO
→ DESTINATION_LOCK
→ PRECISE_RETRIEVAL
→ SMALL_CONTEXT
→ PAPAGAIO_MODE=OFF
→ HIPÓTESE / PLANO CURTO
→ META_LUPA

SETOR_DETERMINISTICO
→ WRITER ÚNICO
→ EXECUÇÃO TÁTICA
→ GAUNTLET PROPORCIONAL AO RISCO
→ REALITY JUDGE
→ RECEIPT / CHECKSUM
→ GOLD → CRYSTAL → FLASH
→ NEXT_CURSOR
```

Regras:

```text
ITEM_MINIMAL_CONTEXT_MAX_DETERMINISM=true
ITEM_DETERMINISTIC_GAUNTLET=true
ITEM_SHORT_LIVED_ROLE_CONTEXT=true
ITEM_ARCHITECTURE_DEPENDENCY_GUARD=true
ITEM_ITERATE_MEASURE_REORGANIZE=true
ITEM_VALUES_OVER_BLIND_HUMAN_RITUAL=true
```

### Setor cognitivo

```text
LONG_PROMPT != ENFORCEMENT
BIG_CONTEXT != BETTER_CONTEXT

BIG_LIBRARY
→ PRECISE_RETRIEVAL
→ SMALL_CONTEXT

ROLE_SPECIALIZATION
→ somente quando ganho material > overhead de coordenação
→ agentes podem ter contexto curto e tarefa focal
→ AGENT != OWNER
→ AGENT != AUTHORITY
```

A Casa preserva valores e invariantes; não obriga um motor a imitar cegamente um ritual humano se outro método verificável satisfaz o mesmo contrato.

```text
VALUES_AND_INVARIANTS = MANDATORY
HUMAN_WORKFLOW_RITUAL = ADAPTIVE_WHEN_PROOF_EQUIVALENT
THRESHOLD_CHANGE_REQUIRES_EVIDENCE=true
```

### Setor determinístico — gauntlet

O gauntlet não é uma lista fixa executada por superstição. Ele seleciona instrumentos conforme a mudança, a ferida e o risco.

```text
MUTATION
→ TYPECHECK quando aplicável
→ LINT quando aplicável
→ TEST
→ BUILD quando aplicável
→ SECURITY quando aplicável
→ REGRESSION_FROM_FAILURE
→ PROPERTY_BASED quando material
→ METAMORPHIC quando material
→ FUZZ quando material
→ MUTATION_TESTING quando valor > custo
→ ARCHITECTURE/DEPENDENCY_GUARD quando fronteiras mudarem
→ COUNTERPROOF
```

```text
ALL_CHECKS_ALWAYS = false
RISK_PROPORTIONAL_GAUNTLET = true
SAME_HEAD_EVIDENCE_REQUIRED = true
EXECUTOR_SELF_APPROVAL = FORBIDDEN
```

Uma falha descoberta aumenta permanentemente a resistência da Casa apenas quando vira teste/gate no owner correto.

```text
FAILURE
→ SIGNATURE
→ CAUSE
→ REGRESSION_TEST
→ OWNER_BINDING
→ COUNTERPROOF
→ CRYSTAL
```

### Arquitetura e dependências

```text
MODULE_BOUNDARY_CHANGED
→ DISCOVER_CONSUMERS
→ VERIFY_DEPENDENCY_DIRECTION
→ TEST_PUBLIC_INTERFACE
→ COUNTERPROOF_NEIGHBORS

GRAPH_OR_VIEWER = OBSERVATION
GRAPH_OR_VIEWER != AUTHORITY
```

Preferir módulos com interface pequena e responsabilidade profunda quando isso reduz contexto e acoplamento; não promover estética modular sem evidência de consumidores e dependências.

### Iteração estratégica

```text
GIANT_UPFRONT_PLAN != EXECUTION

SMALL_DELTA
→ DETERMINISTIC_FEEDBACK
→ REMEASURE
→ REORGANIZE_IF_NEEDED
→ NEXT_SMALL_DELTA
```

Planejamento pode ser efêmero. Só vira regra persistente quando a realidade provar que deve sobreviver como contrato, teste, owner ou cristal.

## Propriedades obrigatórias (foto Notion cristalizada)

Contrato: `ARTIFACT-PROPERTIES.yml`

Grupos alfabéticos:

| Grupo | Campos |
|---|---|
| A_IDENTIDADE | title, status, source_rule |
| B_TEMPORAL | date, updated, observed_at |
| C_CLASSIFICACAO | tags, category, sensitivity |
| D_PROVENIENCIA | source, source_class, head_sha, content_sha256 |
| E_GOVERNANCA | owner, consumer, writer |

Sem propriedades → **não** `FLASH_READY`. Hermes não consome artefato mudo.

```text
CANONICO -> ARTEFATO
ARTEFATO_NAO_INVENTA_CANONICO=true
DERIVED_VIEW != AUTHORITY
```

## Auto-melhoria / auto-cura (amarrada no motor)

```text
ERRO | FALHA | CORREÇÃO | DELTA
→ CANDIDATE (não canônico direto)
→ TESTE DISCRIMINANTE
→ WRITER AUTORIZADO
→ CRISTAL / SKILL / GATE NO OWNER EXISTENTE
→ INVALIDAÇÃO SELETIVA DO ÍNDICE
→ SELF-HEAL SÓ COM PROVA
```

```text
DIRECT_CANONICAL_WRITE_BY_MINER=false
GENERATIVE_OUTPUT_IS_NOT_AUTHORITY=true
UNKNOWN_NEVER_PASS=true
```

## Ganhos reutilizáveis desta rodada

```text
PROOF_DESTINATION_BINDING=true
RECEIPT_IS_HEAD_SCOPED=true
SUPERSEDED_PR_REQUIRES_SUCCESSOR_RESOLUTION=true
SCREENSHOT_IS_NOT_RUNTIME_PROOF=true
MULTIPLE_SURFACES_ARE_NOT_MULTIPLE_BRAINS=true
LEARNING_TRANSFER_FAIL_ON_RETEACH=true
ITEM_MINIMAL_CONTEXT_MAX_DETERMINISM=true
ITEM_DETERMINISTIC_GAUNTLET=true
ITEM_SHORT_LIVED_ROLE_CONTEXT=true
ITEM_ARCHITECTURE_DEPENDENCY_GUARD=true
ITEM_ITERATE_MEASURE_REORGANIZE=true
ITEM_VALUES_OVER_BLIND_HUMAN_RITUAL=true
```

Interpretação operacional:

```text
PROOF_DESTINATION_BINDING
→ prova precisa alcançar/referenciar o owner de destino

RECEIPT_IS_HEAD_SCOPED
→ HEAD mudou → receipt anterior vira histórico → remeasure

SUPERSEDED_PR_REQUIRES_SUCCESSOR_RESOLUTION
→ seguir o delta ao PR/owner vivo; não ressuscitar paralelo

SCREENSHOT_IS_NOT_RUNTIME_PROOF
→ screenshot prova somente a camada visual observável

MULTIPLE_SURFACES_ARE_NOT_MULTIPLE_BRAINS
→ várias superfícies compartilham intenção/owners; engines continuam substituíveis

LEARNING_TRANSFER_FAIL_ON_RETEACH
→ regra provada/promovida deve reaparecer automaticamente no evento equivalente
```

## Cola de superfície

| Superfície | Papel |
|---|---|
| `AGENTS.md` | contrato geral (matéria do CHEFE já no moinho) |
| `CLAUDE.md` | ponte DERIVED_VIEW → canônico |
| `LEIA-ME-IA.md` | porta de entrada |
| Hermes prompt | herda Trigger Fabric + learning route |
| Knowledge Compiler | FORJA: matéria → ouro → cristal → rota |
| Handoff/Pombo | leva receipt + checksum + NEXT_CURSOR ao próximo consumidor |
| Trigger Fabric contract | separa contexto cognitivo de enforcement determinístico |
| Gate determinístico | impede que itens aprendidos virem prosa descartável |

## O que isto **não** é

- AutoBot V2
- segundo cérebro paralelo
- Alchemist Engine
- UncleBobAgent / HardenerBrain paralelo
- RAG paralelo / MCP novo / daemon novo
- deploy / VPS / force-push nesta missão

## Runtime status

```text
CONTRACT = DECLARED_IN_TRIGGER_FABRIC
MATERIAL_STATE_MACHINE = DECLARED_AND_BOUND_TO_EXISTING_FORJA
DETERMINISTIC_SCAFFOLD = DECLARED_IN_EXISTING_CONTRACT
IMPLEMENTATION_HOOKS = PARTIAL (owners exist; physical hooks not all proven)
RUNTIME_HERMES_LEARNING = UNKNOWN até teste no corpo Hermes
VECTOR_MEMORY_RUNTIME = NOT_PROVEN
```
