---
title: "Fonte — Lógica Computacional 23"
status: "SOURCE_BYTES_PENDING_CANONICAL_PLACEMENT"
classification: "STUDY_CANDIDATE"
sector: "LOGICA-E-PROVA"
source_id: "cc2003-logica-computacional-23-nelma-moreira"
format: "pdf"
sha256_observed: "b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1"
size_bytes_observed: 206674
pages_observed: 8
---

# 📖 Lógica Computacional 23 · Nelma Moreira

Fonte de estudo observada pelo CHEFE e usada para estruturar o Setor Horn · Lógica & Prova.

## Conteúdo observado

- introdução à programação em lógica;
- fórmulas e cláusulas de Horn;
- satisfazibilidade de cláusulas;
- estruturas e Teorema de Herbrand;
- modelo mínimo de Herbrand;
- resolução para cláusulas de Horn.

## Subconjunto transferido para o motor

O motor não tenta fingir que implementa todo o PDF. Ele absorve um subconjunto finito, determinístico e testável:

```text
¬p1 ∨ ... ∨ ¬pn ∨ p
≡
(p1 ∧ ... ∧ pn) → p

sem literal positivo:
(p1 ∧ ... ∧ pn) → F
```

Algoritmo operacional absorvido:

```text
FATOS
→ MARCAR
→ PROPAGAR REGRAS FORÇADAS
→ REPETIR
→ PARAR QUANDO NADA MUDA
→ CONTRADIÇÃO SE REGRA NEGATIVA FOR FORÇADA
```

`NÃO MARCADO` permanece `UNKNOWN`; não vira falso por ausência de derivação.

## Transferência operacional já existente na CentralDark

A Casa já registrou, em `docs/CONSCIENCIA/APRENDIZADOS/erros-agente-2026-08-29-medicao-e-falso-verde.md`, a adaptação da marcação de Horn até ponto fixo:

```text
FATO_MEDIDO
→ marcar
→ regra com premissas satisfeitas força nova marca
→ repetir até nada mudar
→ agir somente sobre o fecho provado
```

Lei preservada:

```text
NAO_MARCADO != FALSO
NAO_MARCADO != LIXO
UNKNOWN != PASS
```

## Bindings atuais

```text
ENGINE=apps/modulos/HERMES-CORE/core/horn-proof-gate.mjs
LIBRARY=scripts/memory-linker/library-router.mjs
COGNITIVE_COUNCIL=apps/modulos/HERMES-CORE/core/cognitive-council.mjs
PERCEPTION=apps/modulos/HERMES-CORE/core/perception-orchestra.mjs
CONFORMANCE=PDF-CONFORMANCE-CC2003.md
```

## Proveniência

O SHA-256 e o tamanho acima foram medidos sobre o PDF entregue nesta missão. Os bytes binários ainda não foram gravados no repositório por esta lane; portanto o status permanece `SOURCE_BYTES_PENDING_CANONICAL_PLACEMENT`.

Quando o PDF for colocado fisicamente na Biblioteca/Drive canônico, reconciliar o mesmo `source_id` e conferir SHA-256 antes de promover para `INGESTED`.

```text
SAME_TITLE != SAME_BYTES
HASH_MATCH_REQUIRED_FOR_SAME_BINARY=true
SOURCE_REFERENCE != TECHNICAL_PROOF
```
