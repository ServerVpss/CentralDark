---
title: "🫀 Auditoria repo-wide — Grafo Vivo Markdown"
status: "AUDITADO_COM_RESIDUAL"
date: 2026-09-10
owner: "docs/CONSCIENCIA/PADRAO-GRAFO-VIVO-MARKDOWN.md"
truth_scope: "DOCS_STRUCTURAL_AUDIT_2026_09_10"
canonical: false
tags:
  - centraldark
  - auditoria
  - docs
  - markdown
  - grafo-vivo
  - legado
  - reconciliacao
related:
  - "[[PADRAO-GRAFO-VIVO-MARKDOWN]]"
  - "[[PADRAO-EMOJIS]]"
  - "[[HERMES-CADEIA-OPERACIONAL]]"
links:
  - "docs/CONSCIENCIA/PADRAO-GRAFO-VIVO-MARKDOWN.md"
  - "docs/SEGURANCA/ADM-GATILHOS-OPERACIONAIS.json"
  - "docs/RECEIPTS/README.md"
---

# 🫀 Auditoria repo-wide — Grafo Vivo Markdown

## 👑 Intenção

Aplicar o mesmo padrão estrutural além de `docs/RECEIPTS`: nó vivo com nome estável, tempo no frontmatter, um owner por capacidade, `tags`/`related`/`links`, emojis alinhados ao registry e histórico sem disputar o presente.

## 🧿 Baseline e concorrência

```text
BRANCH=fix/docs-grafo-vivo-repo-audit-20260910
BRANCH_BASE=f8936f04b82b5aaac2f9f75c6d4142cda1286eac
MAIN_OBSERVED_DURING_AUDIT=f8830a166189b12f04580fd62efbf9ba72d09b05
MAIN_ADVANCED_DURING_WORK=true
OVERLAP_OBSERVED_WITH_MAIN_DELTA=false
```

A `main` avançou cinco commits depois do ponto de partida. A comparação mostrou que o delta concorrente adicionou material de `INTERLIGADOS` e receipts, sem tocar os arquivos desta correção. A branch não foi forçada nem reescrita.

## 🔎 Feridas confirmadas

A busca por `ATIVO_RECONCILIADO` combinada com nomes/semântica legada encontrou quatro nós vivos evidentes ainda usando identidade de caminho antiga: o padrão de resposta datado, o guia `PIVETE`, a postura `PIVETE` e a cadeia Hermes em `PIVETE-07`. Também foram encontrados dois documentos visuais com mapeamento de gatilhos divergente do registry e um handoff duplicado em dois caminhos.

## 🛠️ Correções aplicadas

```text
12-GUIA-PIVETE.md
→ GUIA-COMUNICACAO-SEGREDO-CHEFE.md
→ caminho antigo removido quando não havia consumidor vivo material

00-POSTURA-PIVETE.md
→ POSTURA-SEGREDO-CHEFE.md
→ caminho antigo removido quando não havia consumidor vivo material

2026-06-20-padrao-resposta-pivete.md
→ LEGACY_ALIAS
→ owner=PADRAO-RESPOSTA-SEGREDO-CHEFE.md

PIVETE-07-HERMES-CADEIA.md
→ LEGACY_ALIAS porque ainda há consumidores
→ owner=HERMES-CADEIA-OPERACIONAL.md

CONSCIENCIA/CONTINUIDADE/proxima-ia.md
→ LEGACY_ALIAS
→ owner=docs/CONTINUIDADE/proxima-ia.md

docs/CONTINUIDADE/proxima-ia.md
→ entrypoint estável
→ estado vivo deve ser remedido, não congelado no handoff

PADRAO-EMOJIS.md
→ projeção do registry, não segundo owner

MATRIZ-ORQUESTRACAO-PERFIS.md
→ gatilhos reconciliados com canonical_display

01-IDENTIDADE.md
→ projeção curta do Soul, canonical=false

01-REGRAS-DA-EQUIPE-IA.md
→ LEGACY_ALIAS; remove governo fixo por marca/modelo

00-MAPA.md
→ mapa de navegação, truth_scope explícito, sem runtime antigo apresentado como CURRENT
```

## 🕰️ O que NÃO deve ser renomeado em massa

Arquivos datados em `docs/RELATORIOS`, `docs/HANDOFF`, snapshots, auditorias e receipts imutáveis podem manter data quando o tempo é parte da identidade do evento. A auditoria não trata `2026-...` como erro por si só.

A pasta `docs/CONSCIENCIA/PIVETE-IA` contém bastante material de compatibilidade/história. Arquivos já marcados como `HISTORICAL_COMPATIBILITY_REDIRECT` permanecem como proveniência; não foram promovidos novamente a nós vivos.

## ❓ Residual conhecido

```text
PADRAO-RESPOSTA-SEGREDO-CHEFE_FRONTMATTER_FULL_CONVERGENCE=NOT_DONE
HISTORICAL_REPORT_LINK_REWRITE=NOT_REQUIRED
RUNTIME_CONSUMER_OF_MARKDOWN_STANDARD=UNKNOWN
OBSIDIAN_PHYSICAL_SYNC_AFTER_MERGE=UNKNOWN
SAME_HEAD_CI=UNKNOWN
```

O owner `PADRAO-RESPOSTA-SEGREDO-CHEFE.md` já tem nome estável, mas é grande e contém muitas regras acumuladas. Nesta rodada ele não foi reescrito integralmente apenas para completar frontmatter, porque uma substituição total via contents API aumentaria risco de regressão sem ganho causal suficiente.

## ⚖️ Veredito

```text
RECEIPTS_DATED_SHADOWS_REMOVED_ON_MAIN=PROVED_BY_DIRECTORY_READBACK
ACTIVE_LEGACY_NODE_SWEEP=APPLIED_ON_BRANCH
TRIGGER_VISUAL_DRIFT=CORRECTED_ON_BRANCH
DUPLICATE_HANDOFF_OWNER=RECONCILED_ON_BRANCH
HISTORICAL_DATED_ARTIFACTS=PRESERVED_BY_DESIGN
ALL_DOCS_BYTE_FOR_BYTE_VALIDATED=false
FIXED_POINT=false
```

## 🧭 Próximo cursor

1. reconciliar branch com a `main` avançada sem force;
2. abrir PR e medir mergeability/diff;
3. executar checks disponíveis no mesmo HEAD;
4. somente depois promover para `main`;
5. reabrir owners e diretórios afetados para contraprova final.
