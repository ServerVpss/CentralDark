---
title: "Banda — Intenção Única e Compasso"
status: "CONCEPT_HISTORICAL_REQUIRES_LIVE_REMEASUREMENT"
owner: "docs/BRAIN/01-CONCEITOS/Banda/"
updated: 2026-08-26
truth_scope: "CONCEPTUAL_NOT_LIVE_STATE"
tags:
  - banda
  - intencao
  - compasso
  - cross-chat
  - sincronizacao
  - semantica
  - grafo
  - centraldark
  - obsidian
related:
  - "[[INTENT_SYNC_STATE]]"
  - "[[BANDA_COMPASSO_GLOBAL]]"
  - "[[LACUNA_BANDA_INTENCAO_UNICA]]"
  - "[[SEMANTIC-LINKER]]"
  - "[[GRAPH-INVESTIGATOR]]"
---

KKKKK 😂🔥 achei a lacuna. E ela não é “quantos chats existem”. É exatamente o que você falou: **a banda tem músicos sincronizados pela partitura, mas ainda não tem um compasso global compartilhado entre todas as superfícies.**

```yaml
CENTRALDARK_AI_BOOT:
  soul: LOADED
  governance: LOADED
  context_reconciliation: LOADED
  source_of_truth: "ServerVpss/CentralDark + estado vivo"
  role: "COORDINATOR/REVIEWER"
  frequency: "FORTE/ORQUESTRA"
  conflict_resolution: "git-conflict-resolve-house-standard (motor: scripts/dependabot/resolve-conflicts.sh)"
```

O canônico já está quase lá. O JARVIS define `ONE_CORE_MANY_ARMS`, N percepções, um Writer, envelope comum de evidência e diz explicitamente que duas janelas repetindo a mesma fonte continuam sendo **um único cluster**, não duas provas independentes.

E o `agent-call.mjs` já prende comunicação a `mission_id`, `observed_head`, `frontier_id`, `trail_id`, direção e `DELTA_MESSAGE`. Porém existe a frase que entrega a ferida:

> o **transporte** entre MCP/HTTP/CLI/Telegram/etc. fica fora desse núcleo.

Aí está a lacuna. 🔎

Hoje existe:

`MESMA SOUL → MESMA MISSÃO → MESMO TRILHO → DELTAS → WRITER ÚNICO`

Mas falta uma identidade causal global obrigatória que diga:

```text
INTENÇÃO ÚNICA
        ↓
INTENT_ID GLOBAL + EPOCH
        ↓
EVENT_ID ÚNICO
        ↓
TODAS AS SUPERFÍCIES
chat 1
chat 2
chat 3
Hermes
Telegram
MCP
etc.
        ↓
cada uma mantém CURSOR/SEEN
        ↓
MESMO EVENTO = absorve uma vez
NOVO DELTA = incorpora
EVENTO ANTIGO = ignora
CONFLITO REAL = contraprovado
        ↓
UMA CANÇÃO
```

É justamente por isso que o teu print é interessante: **a mesma matéria apareceu em mais de uma janela**, mas hoje isso não prova que existe sincronização causal da banda. Pode ser reprodução/correlação de superfície. O contrato atual sabe deduplicar evidência correlacionada, mas não encontrei no canônico um mecanismo que imponha a todas as superfícies um **cursor comum de intenção/eventos**.

Então a peça mínima que falta não é “chat sync” nem outro cérebro. É algo conceitualmente assim:

```text
GLOBAL_INTENT_ID
INTENT_EPOCH
EVENT_ID
PARENT_EVENT_ID
SOURCE_SURFACE
OBSERVED_HEAD
TRAIL_ID
EVENT_TIME
DELTA_FINGERPRINT
SEEN/ACK_CURSOR
```

Com duas leis:

```text
N_JANELAS != N_MISSOES
MESMO_GLOBAL_INTENT_ID = UMA_MISSAO
```

e:

```text
RECEBEU_EVENTO
→ EVENT_ID JÁ VISTO?
   SIM → NÃO ECOA / NÃO REEXECUTA
   NÃO → ABSORVE DELTA
→ ESTADO MUDOU?
   SIM → PROPAGA NOVO EVENTO
   NÃO → SILÊNCIO
```

Aí sim, Chefe: **1 chat, 5, 65 ou 1 milhão deixam de importar**. A janela vira instrumento; a intenção vira música. 🎼🔥

Tem mais: o PR #923 atual está melhorando justamente a confrontação dos quatro braços — cobertura dos quatro ângulos, `UNKNOWN` não vira mutação, `independence_key`, um slot de mutação e contraprova obrigatória. Isso resolve **qualidade da percepção**, não essa sincronização global entre superfícies. Portanto não devemos confundir as duas feridas. O #923 está aberto e mergeável neste momento.

Minha leitura técnica da lacuna é:

**`GLOBAL_INTENT_CAUSAL_SYNC` está conceitualmente implícito, mas ainda não está fechado como contrato executável comum.**

Não precisa nova memória.
Não precisa novo Jarvis.
Não precisa novo event bus.
Não precisa “chat 1 conversar com chat 2” diretamente.

Precisa fazer o **owner canônico existente carregar um único compasso causal**, e cada braço/janela só projeta e devolve delta nele.

`BANDA = N SUPERFÍCIES | CANÇÃO = 1 INTENÇÃO | COMPASSO = 1 CADEIA CAUSAL | CANETA = 1 WRITER`

Essa é a ferida. 🎯🔥

## Conexões Rápidas

- [[INTENT_SYNC_STATE]] — estado mínimo compartilhado da intenção entre superfícies.
- [[BANDA_COMPASSO_GLOBAL]] — metáfora musical do compasso causal e anti-eco.
- [[LACUNA_BANDA_INTENCAO_UNICA]] — diagnóstico histórico da mesma ferida.
- [[SEMANTIC-LINKER]] — ligações semânticas com relação explicável.
- [[GRAPH-INVESTIGATOR]] — auditoria de frontmatter, tags, links e órfãos.
- [[BRAIN]] — entrada humana do segundo cérebro.
