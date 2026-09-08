---
title: "Setor ML · Corpus offline local inteiro"
status: "LOCAL_RUNTIME_CONTRACT"
owner: "docs/BRAIN/03-DOCUMENTACAO/02-BIBLIOTECA/SETORES/ML-CIENCIA-DE-DADOS"
created_at: "2026-09-08T00:11:00-03:00"
tags:
  - biblioteca
  - offline
  - local-corpus
  - rag
  - training-data
  - machine-learning
---

# Corpus offline local inteiro

## Intenção do CHEFE

O objetivo deste setor não é apenas guardar links. É permitir que a Casa mantenha uma cópia local completa das fontes de estudo escolhidas pelo CHEFE para consulta offline, economia de internet, busca semântica, RAG e preparação de dataset local.

```text
LINK_ONLINE
→ CACHE_LOCAL
→ INVENTÁRIO
→ SHA256
→ EXTRAÇÃO_DE_TEXTO_QUANDO_POSSÍVEL
→ CHUNKS_JSONL
→ BUSCA_LOCAL / RAG / TREINO_LOCAL
```

## Separação correta

```text
REPOSITÓRIO_GITHUB
= código, manifesto, scripts, índice, regras, receipts pequenos

CASA_LOCAL
= conteúdo inteiro, PDFs, livros, zips, clones, texto extraído, corpus de treino
```

Isso evita baixar tudo de novo toda hora e evita transformar a `main` em depósito pesado.

## Caminho local recomendado

```text
E:\CentralDark\_BIBLIOTECA_OFFLINE\entrada
E:\CentralDark\_BIBLIOTECA_OFFLINE\ML-CIENCIA-DE-DADOS
```

Coloque em `entrada` tudo que deve entrar no corpus local:

```text
HEPML-LivingReview-master.zip
dev-livros-main.zip
clones de repositórios
PDFs
Markdown
TXT
JSON
CSV
notebooks
```

Depois rode:

```powershell
pwsh -ExecutionPolicy Bypass -File scripts/library/CentralDark-LocalOffline-Library-Ingest.ps1 `
  -SourceRoot "E:\CentralDark\_BIBLIOTECA_OFFLINE\entrada" `
  -OutputRoot "E:\CentralDark\_BIBLIOTECA_OFFLINE\ML-CIENCIA-DE-DADOS" `
  -Recreate
```

Para baixar `ml-journey` uma vez e deixar offline:

```powershell
pwsh -ExecutionPolicy Bypass -File scripts/library/CentralDark-LocalOffline-Library-Ingest.ps1 `
  -SourceRoot "E:\CentralDark\_BIBLIOTECA_OFFLINE\entrada" `
  -OutputRoot "E:\CentralDark\_BIBLIOTECA_OFFLINE\ML-CIENCIA-DE-DADOS" `
  -CloneMlJourney
```

## Saídas geradas

```text
raw/
  cópia local integral por SHA

work/
  zips expandidos e área técnica

index/inventory.jsonl
  um registro por arquivo medido

index/corpus.jsonl
  chunks de texto para busca, RAG e treino local

index/manifest.json
  resumo técnico da rodada

index/receipt.txt
  recibo humano da execução
```

## Contrato de treino local

```text
LOCAL_FULL_CONTENT_COPY=true
LOCAL_TEXT_EXTRACTION=true
LOCAL_CORPUS_JSONL=true
LOCAL_RAG_READY=true
LOCAL_TRAINING_DATASET_CANDIDATE=true
PUBLIC_REPO_RAW_COPY=false
```

A IA pode usar o `corpus.jsonl` como entrada local para:

- busca por assunto;
- revisão de lacuna de estudo;
- geração de flashcards;
- montagem de currículo;
- RAG local;
- preparação de dataset para treino local.

## Regras da Casa

```text
CONTEÚDO_LOCAL != CONTEÚDO_PUBLICADO
PDF_GUARDADO != TEXTO_EXTRAÍDO
TEXTO_EXTRAÍDO != CONHECIMENTO_VALIDADO
TREINO_LOCAL != PROVA_DE_CAPACIDADE
MODELO_TREINADO != REALITY_JUDGE
```

O corpus inteiro pode morar na Casa local. O GitHub guarda o mapa, o script e o recibo pequeno.

## Próximo encaixe

Quando o `index/corpus.jsonl` existir, o próximo delta é ensinar o `library-router.mjs` a ler fontes do tipo:

```text
source_kind=local-offline-corpus
locator=index/corpus.jsonl
sector=ml-ciencia-de-dados
```

Assim o setor vira uma fonte pesquisável da Biblioteca sem criar outro cérebro.
