---
title: "BRAIN cristalizacao ledgers — tombstone"
status: "DOCUMENTAL_SEM_PROVA_RUNTIME_ATUAL"
owner: "evidence/BRAIN-LEDGERS-TOMBSTONE-20260911.md"
source_class: "INTERNAL"
tipo: "evidencia_documental"
data_criacao: "UNKNOWN"
ultima_atualizacao: "UNKNOWN"
ultima_modificacao: "2026-11-12T18:33:38-03:00"
ultima_verificacao: "2026-11-12T18:33:38-03:00"
fuso_horario: "America/Sao_Paulo"
hash_conteudo: "10828ac67f8556cbdd7dcb50d7576300941ba7088b93e2d77a795cd35da03e94"
rastro: 
  - tipo: "CONCILIACAO_PROPRIEDADES"
    momento: "2026-11-12T18:33:38-03:00"
    origem_commit: "4eadc58541700ad63279d226109e4ed1373fada4"
    resultado: "SOMENTE_METADADOS"
    prova_runtime: "UNKNOWN"
grupo_notas: "03-evidencias-contraprovas"
relacionado_a: []
estado_evidencia: "UNKNOWN"
---
# BRAIN cristalizacao ledgers — tombstone

## Why
Porta identidade FAIL on main:
- cristalizacao-source-a-ledger.json → EXTERNAL_SOURCE_FILE_UNSCANNABLE
- cristalizacao-source-b-ledger.json → EXTERNAL_SOURCE_PROJECT_FORBIDDEN

## Pre-replace (origin/main blobs)
| path | git-blob SHA | size bytes |
|---|---|---|
| docs/BRAIN/cristalizacao-source-a-ledger.json | `5e39e370dd7aef5a66ff8ddca15715d9266f52ff` | 33821319 |
| docs/BRAIN/cristalizacao-source-b-ledger.json | `491846f675f67f1ef973635943f6a5888e09a4a5` | 10386876 |

## After
Paths kept as TOMBSTONE stubs. Raw inventory removed. UNKNOWN≠PASS.

## House measure
validateExternalDelta maxBuffer 32MB→128MB so large stub-replace diffs are measurable.

## Stack
Rebased onto #1492 tip `940fb1c3d16f67e7ab75474d2a94161962707515` (Ian GO A / Geoff proof descendant).
