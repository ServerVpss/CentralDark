# Tutorial operacional — absorver o curso dentro da CentralDark sem criar arquitetura paralela

## Objetivo

Transformar os princípios úteis do curso em capacidade operacional da CentralDark sem duplicar owners.

## Passo 1 — Boot

```text
!CENTRALDARK
#ACORDAR
!CALIBRAR
!MULTIBUSSOLA
!META_LUPA
!RECONCILIAR
```

Antes de criar qualquer coisa:

```text
CURRENT_STATE
→ SEARCH_EXISTING_OWNER
→ REUSE | EXTEND | CREATE
```

CREATE só existe quando owner/capability realmente não existem e a evidência disso foi medida.

## Passo 2 — Contexto

Toda missão deve produzir:

```text
MISSION_ID
GOAL
OWNER
SCOPE
EVIDENCE
COUNTERPROOF
NEXT_CURSOR
```

O agente pode usar contexto grande, mas nunca confundir histórico com estado vivo.

## Passo 3 — Workflows

Um workflow é sequência, não cérebro.

```text
input
→ owner
→ tool
→ evidence
→ verifier
→ output
```

Se a sequência já existe, corrija wiring, não crie workflow V2/V3.

## Passo 4 — RAG / semântica

Pipeline recomendado:

```text
RAW_INPUT
→ ORIGIN + PROVENANCE
→ NORMALIZE
→ SECRET_SCRUB
→ EXACT_IDENTIFIER_GATE
→ CHUNK
→ EXACT_DEDUPE + SEMANTIC_DEDUPE
→ RETRIEVAL_SELECTOR
   ├─ exact
   ├─ structured
   ├─ lexical
   ├─ vector
   └─ graph
→ RERANK
→ CONTRADICTION_CHECK
→ EVIDENCE_ENVELOPE
→ CURRENT_REALITY
```

Invariantes:

```text
VECTOR_INDEX_IS_AUTHORITY=false
SEMANTIC_SIMILARITY_IS_PROOF=false
STALE_VECTOR_IS_CURRENT_REALITY=false
NO_EVIDENCE=UNKNOWN
```

## Passo 5 — MCP

Cliente externo deve descobrir a CentralDark por um ponto único.

```text
CLIENT
→ CENTRALDARK MCP
→ AUTH OWNER
→ TOOL ROUTER
→ OWNER
→ EVIDENCE
```

A inteligência de auth, providers, logs e policy pertence ao servidor/owners existentes.

## Passo 6 — Skills

Skill boa é pequena, acionável e subordinada ao owner.

```text
trigger
→ read owner
→ execute
→ evidence
→ counterproof
```

Evite skill que replique documentação inteira.

## Passo 7 — Subagentes e times

```text
SOL = coordenação / writer
P1 = leitura
P2 = leitura
P3 = leitura
PN = leitura
```

Depois:

```text
receipts(P1..PN)
→ SOL
→ reconcile
→ one mutation
→ test
→ counterproof
```

## Passo 8 — Browser automation

Não preserve somente IDs efêmeros. Preserve o mecanismo de reencontro:

```text
event
→ candidates(Process/UIA/DOM/OCR/Window/History)
→ score
→ validate
→ execute
→ signature
```

## Passo 9 — Vídeo/imagem como evidência

Para artefatos visuais autorizados:

```text
source video
→ SHA-256
→ frame
→ timestamp
→ frame SHA-256
→ semantic tags
→ vector index
→ trace/evidence
→ graph/Obsidian projection
```

O frame é testemunha; não vira owner textual.

## Passo 10 — Fechamento

```text
DELTA_APPLIED
→ TEST
→ NEGATIVE_TEST
→ COUNTERPROOF
→ REMEASURE
→ RECEIPT
→ FIXED_POINT
```
