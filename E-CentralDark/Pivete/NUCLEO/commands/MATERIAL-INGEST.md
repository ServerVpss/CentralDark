# COMANDO - MATERIAL-INGEST.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\ARQUITETURA\CENTRALDARK-TRIGGER-FABRIC\MATERIAL-INGEST.md
**SHA:** ab322257a9e2b391
**Timestamp:** 2026-08-28T02:56:44.764619
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- CRYSTAL_REQUIRES_OWNER_CONSUMER_TEST_GATE=true
- Contrato: `ARTIFACT-PROPERTIES.yml`
- CONTRACT = DECLARED_IN_TRIGGER_FABRIC

### Ouro Bruto (primeiros 5000 chars)
```
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
GIANT_U
```