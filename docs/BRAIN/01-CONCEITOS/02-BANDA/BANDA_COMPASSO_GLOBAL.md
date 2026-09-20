---
title: "Banda — Compasso Global"
status: "ACTIVE_CONTRACT_SOURCE_RUNTIME_REMEASURE_REQUIRED"
owner: "docs/BRAIN/01-CONCEITOS/02-BANDA/"
updated: 2026-09-05
truth_scope: "SOURCE_CONTRACT_NOT_LIVE_TRANSPORT_PROOF"
tags:
  - banda
  - compasso
  - musica
  - intencao
  - cross-chat
  - sincronizacao
  - semantica
  - centraldark
related:
  - "[[BANDA_INTENCAO_UNICA_COMPASSO]]"
  - "[[INTENT_SYNC_STATE]]"
  - "[[LACUNA_BANDA_INTENCAO_UNICA]]"
  - "[[SEMANTIC-LINKER]]"
  - "[[GRAPH-INVESTIGATOR]]"
---

# Banda — Compasso Global

A mesma matéria pode chegar em muitas superfícies sem que elas estejam no mesmo compasso.

> **TODOS RECEBEREM A MESMA MATÉRIA ≠ TODOS ESTAREM NO MESMO COMPASSO.**

A unidade operacional não é a janela. É a intenção canônica:

```text
WINDOWS = MANY
INTENT = ONE
MISSION = ONE
CANONICAL_STATE = ONE

PERCEPTION = PARALLEL
MUTATION_BY_WOUND = SERIALIZED

SAME_INPUT != NEW_WORK
NEW_INFORMATION = NEW_EVENT

NO_NEW_INFORMATION
→ NO_ECHO
→ NO_DUPLICATE_WORK

STATE_CHANGED
→ DELTA_RECONCILIATION
→ CONTINUE_FROM_NEW_STATE
```

## Partitura viva

O contrato executável da Banda está em:

```text
docs/BRAIN/01-CONCEITOS/02-BANDA/BANDA_COMPASSO_GLOBAL.json
```

Ele define as 17 respirações, aliases, grupos, bindings e invariantes. Este Markdown explica a intenção; o JSON é a partitura estruturada.

```text
🎼 COMPASSO = INTENT_FINGERPRINT / MISSION_ID
🥁 BATIDA = EVENT_ID
⏱️ TEMPO = STATE_VERSION / HEAD_OBSERVED
🎻 INSTRUMENTO = AGENTE/MODELO/SUPERFÍCIE
🎵 NOTA = SKILL/CAPACIDADE EM USO
⚡ DISSONÂNCIA = CONFLITO MATERIAL
🔧 RESOLUÇÃO = MENOR DELTA CAUSAL
💎 ACORDE = CRISTAL COM PROVA
❤️‍🔥 SILÊNCIO = FIXED_POINT
```

## Núcleo amarrado — 2026-09-05

A Banda foi ligada explicitamente ao mesmo núcleo do Hermes:

```text
BANDA
→ META_LUPA
→ CLAIM_SEALS
→ GRAPHRAG_MASTER
→ APRENDIZADOS
→ SECOND_BRAIN
```

E às três superfícies estruturais:

```text
GITHUB_MAIN
   ├─ PING → CASA → PONG
   └─ PING → VPS  → PONG
```

O `PING/PONG` é receipt de sincronização, **não** segundo deployer. O antigo webhook de deploy permanece `RETIRED`; o deploy canônico continua GitHub Actions.

## META_LUPA acompanha a trajetória

A Lupa não aparece só no fim:

```text
ENTRADA
→ META_LUPA FRIA
→ CLAIM_SEAL PREFLIGHT
→ OBSERVAR
→ AGIR
→ AUTOLUPA
→ TESTAR
→ META_LUPA MÉDIA SE HOUVER CONTRADIÇÃO
→ CONTRAPROVA
→ VERTEX_INVERSO / CARACOL_REVERSO
→ META_LUPA QUENTE ANTES DE PROMOÇÃO
→ AUTOLUPA
→ FIXED_POINT
→ SEAL / NEXT_CURSOR
```

Ponto fixo só existe quando uma nova AutoLupa não altera materialmente hipótese, bloqueio, risco residual, próximo teste ou veredito.

## Lacre: o que foi provado não vira a mesma pendência

```text
NON_TEMPORAL + SEALED + SAME_TARGET + NO_REOPEN_CAUSE
→ RESOLVIDO
→ DO_NOT_REPEAT_WORK

TEMPORAL + SEALED
→ HISTORICAL_PROOF
→ REMEASURE_CURRENT
→ NÃO DIZER "NUNCA FUNCIONOU"

REOPEN
→ REQUIRES_CAUSE_REF
→ PRESERVE_OLD_PROOF
→ REOPEN_ONLY_CAUSAL_CONE
```

O ledger vive em:

```text
.agents/skills/meta-lupa/references/claim-seals.jsonl
```

E a catraca executável em:

```text
.agents/skills/meta-lupa/guardrails/claim_seal.py
```

## Grupos / instrumentos

Os grupos são visões do mesmo motor, não cérebros paralelos:

```text
KERNEL
PERCEPTION
SCOUT
BUILDER
REVIEWER
INTEGRATION
JUDGE
MEMORY
SYNC
```

A biblioteca de agentes já existente (`scout`, `builder`, `reviewer`, `swarm`) alimenta o GraphRAG como fonte de capacidade. Provider, agente, swarm e biblioteca **não são autoridade de realidade**.

## Casa, VPS e remoto no mesmo compasso

### Casa

Owner de sincronização:

```text
scripts/casa/sync-hermes-obsidian.ps1
```

Leis:

```text
EXPLICIT_ROOTS
CLEAN_WORKTREE
CANONICAL_ORIGIN
FAST_FORWARD_ONLY
LOCAL_AHEAD_IS_NOT_DISCARDED
META_LUPA + CLAIM_SEALS
PONG_ONLY_AFTER_REMEASURE
```

### VPS

Owner de sincronização/deploy:

```text
scripts/vps/centraldark-deploy.sh
```

Leis:

```text
DIRTY_WORKTREE=BLOCK
LOCAL_COMMITS_AHEAD=BLOCK_UNLESS_EXPLICIT
ROLLBACK_ANCHOR
TARGET_CONTAINS_PROOF_LINKS
META_LUPA/CLAIM_SEALS/GRAPHRAG_BEFORE_RUNTIME_RESTART
RUNTIME_HEALTH_AFTER_SYNC
PONG_ONLY_AFTER_COUNTERPROOF
```

### GitHub main

```text
ServerVpss/CentralDark@main = STRUCTURAL_SOURCE_OF_TRUTH
```

`main` não prova runtime da Casa nem da VPS. Cada corpo precisa devolver seu próprio receipt.

## Nenhuma nota toca sozinha

O Grafo Vivo projeta os elos:

```text
BANDA ↔ META_LUPA ↔ CLAIM_SEALS ↔ GRAPHRAG ↔ APRENDIZADOS
                       │
                 AGENT_LIBRARY
                       │
                SECOND_BRAIN

GITHUB_MAIN ↔ CASA
GITHUB_MAIN ↔ VPS
```

Se elo essencial do compasso não existir no checkout, o gate deve falhar. Link quebrado não vira silêncio verde.

## Fixed Point

```text
SOURCE_CONTRACT_CRYSTALLIZED=true
RUNTIME_HOUSE=UNKNOWN_UNTIL_EXECUTED
RUNTIME_VPS=UNKNOWN_UNTIL_EXECUTED
GLOBAL_RUNTIME_FIXED_POINT=NOT_PROVEN
UNKNOWN_IS_NOT_PASS=true
```

## Conexões rápidas

- [[BANDA_INTENCAO_UNICA_COMPASSO]] — partitura única e cadeia causal.
- [[INTENT_SYNC_STATE]] — estado mínimo que mantém as superfícies no mesmo compasso.
- [[LACUNA_BANDA_INTENCAO_UNICA]] — origem histórica da ferida.
- [[SEMANTIC-LINKER]] — cria relações explicáveis entre notas.
- [[GRAPH-INVESTIGATOR]] — identifica nós sem properties, tags e links.
- [[BRAIN]] — entrada humana do cérebro.
