---
title: "Material Ingest — moinho obrigatório"
date: 2026-08-24
updated: 2026-08-24T20:00:00-03:00
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

## Cola de superfície

| Superfície | Papel |
|---|---|
| `AGENTS.md` | contrato geral (matéria do CHEFE já no moinho) |
| `CLAUDE.md` | ponte DERIVED_VIEW → canônico |
| `LEIA-ME-IA.md` | porta de entrada |
| Hermes prompt | herda Trigger Fabric + learning route |

## O que isto **não** é

- AutoBot V2
- segundo cérebro paralelo
- RAG paralelo / MCP novo / daemon novo
- deploy / VPS / force-push nesta missão

## Runtime status

```text
CONTRACT = DECLARED_IN_TRIGGER_FABRIC
IMPLEMENTATION_HOOKS = PARTIAL (owners exist; physical hooks not all proven)
RUNTIME_HERMES_LEARNING = UNKNOWN até teste no corpo Hermes
VECTOR_MEMORY_RUNTIME = NOT_PROVEN
```
