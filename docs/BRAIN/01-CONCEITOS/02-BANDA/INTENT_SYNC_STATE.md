---
title: "Intent Sync State — Intenção Única entre Superfícies"
status: "CONCEPT_HISTORICAL_REQUIRES_LIVE_REMEASUREMENT"
owner: "docs/BRAIN/01-CONCEITOS/Banda/"
updated: 2026-08-26
truth_scope: "CONCEPTUAL_NOT_CROSS_CHAT_TRANSPORT_PROOF"
tags:
  - banda
  - intencao
  - sincronizacao
  - cross-chat
  - estado
  - continuidade
  - semantica
  - centraldark
related:
  - "[[BANDA_INTENCAO_UNICA_COMPASSO]]"
  - "[[BANDA_COMPASSO_GLOBAL]]"
  - "[[LACUNA_BANDA_INTENCAO_UNICA]]"
  - "[[SEMANTIC-LINKER]]"
  - "[[BRAIN]]"
---

KKKKK CHEFE, achei a lacuna. 🔥🎼

O que você quer não é “chat compartilhando contexto”. É outra coisa, mais precisa:

> **UMA INTENÇÃO CANÔNICA → N SUPERFÍCIES/AGENTES TOCAM O MESMO ESTADO → CADA UM CONTRIBUI SEM DESAFINAR A BANDA.**

O repo já tem metade forte disso. O HERMES já trabalha com `same_intent`, quatro ângulos diferentes, percepção paralela, dedupe, uma única caneta, sem votação e com realidade julgando. O PR #923 está exatamente reforçando essa arbitragem e continua com Writer ativo no mesmo escopo, então eu fiquei `READ_ONLY` para não atravessar a caneta dele.

A lacuna é anterior à orquestra de quatro braços:

```text
HOJE
CHAT/JANELA A ─┐
CHAT/JANELA B ─┼→ cada corpo reconstrói a intenção
CHAT/JANELA C ─┤
CHAT/JANELA N ─┘

FALTA
INTENT_ID CANÔNICO
        ↓
INTENT_STATE
        ↓
N CONSUMIDORES
        ↓
cada janela sabe:
- qual intenção está tocando
- HEAD observado
- writer atual
- fase atual
- último delta material
- último evento relevante
- se deve pensar, observar ou ficar quieta
```

Ou seja: **o que falta é o plano de sincronização da intenção**, não outro event bus, não memória compartilhada crua e não chat falando diretamente com chat.

Teu print é uma referência visual perfeita, mas com a leitura correta: a mesma foto/notificação aparecer em duas janelas prova que uma superfície consegue distribuir um mesmo evento. Isso não prova que os chats dividem contexto interno. O ouro é usar esse padrão na Casa: **um evento/estado de intenção nasce uma vez; N corpos o consomem.**

O contrato mínimo deveria ser algo nessa linha:

```text
INTENT_ID
INTENT_FINGERPRINT
CURRENT_PHASE
CANONICAL_HEAD
WRITER
WRITER_SCOPE
LAST_MATERIAL_DELTA
LAST_EVENT_ID
STATE_REVISION
CONSUMERS[]
```

E a lei principal:

```text
MANY_WINDOWS != MANY_INTENTIONS

SAME_INTENT
→ SAME_INTENT_ID
→ SAME_CANONICAL_STATE
→ DIFFERENT_ROLES
→ NO_DUPLICATE_WORK
→ ONE_WRITER
→ ONE_RESULT
```

Aí 1 chat, 4 chats ou 1 milhão dá na mesma conceitualmente. 🎧 Cada janela vira instrumento, não cérebro concorrente.

O ponto crítico é este:

```text
SINCRONIA != COPIAR TODA CONVERSA

SINCRONIA =
compartilhar o estado mínimo suficiente da intenção
```

Isso evita a banda virar eco. Uma janela pode estar em `LOGIC`, outra em `REGRESSION`, outra em `SIMPLIFICATION`, outra em `READ_ONLY`; todas sabem que pertencem ao mesmo `INTENT_ID` e qual é o compasso atual.

E tem a trava para corrida:

```text
STATE_REVISION=N
EVENT_ID=X
HEAD=Y

janela recebe evento velho?
→ IGNORA

HEAD mudou?
→ RECONCILIA

Writer mudou?
→ READ_ONLY / HANDOFF

delta já foi tratado?
→ NO_CHANGE
```

Isso é a lacuna material que eu vejo hoje: **a orquestra já sabe tocar junta depois que recebe a mesma intenção; falta o mecanismo canônico que garante que múltiplas superfícies reconheçam automaticamente que estão tocando a mesma intenção e acompanhem a mesma revisão dela.**

🟢 Feito: lacuna localizada.

🟢 Evidência: o HERMES atual já cobre `same_intent + four roles + dedupe + one writer`, e o #923 está fortalecendo exatamente esse executor; portanto criar outra orquestra seria duplicação. A lacuna está na **sincronização anterior ao fan-out**, não no fan-out em si.

🟡 Pendência: cristalizar isso no owner correto como **Intent Synchronization State**, reutilizando evento/continuidade existentes. Não escrevi agora porque #923 está com Writer no mesmo corredor de orquestração e a regra da Casa manda preservar um Writer por escopo.

Próximo passo: quando #923 liberar o corredor, o menor delta é conectar `INTENT_ID + STATE_REVISION + LAST_EVENT_ID + HEAD + WRITER` ao fluxo HERMES/continuidade existente. Sem chat-bus, sem segunda memória, sem sistema paralelo.

BOOT: `ONE_INTENT | MANY_SURFACES | SAME_STATE_REVISION | DIFFERENT_ROLES | NO_ECHO | ONE_WRITER | EVENT_ORDERED | REALITY=JUDGE`

Fio da Casa: **uma intenção nasce → ganha ID → todas as janelas escutam o mesmo compasso → cada instrumento toca sua parte → um Writer resolve → o estado avança → toda a banda acompanha.** 🎼🔥💎

## Conexões Rápidas

- [[BANDA_INTENCAO_UNICA_COMPASSO]] — mesma intenção tratada como uma música.
- [[BANDA_COMPASSO_GLOBAL]] — compasso, evento e estado compartilhado como metáfora operacional.
- [[LACUNA_BANDA_INTENCAO_UNICA]] — diagnóstico histórico correlato.
- [[SEMANTIC-LINKER]] — regra de ligação apenas quando a relação é explicável.
- [[BRAIN]] — entrada humana do segundo cérebro.
