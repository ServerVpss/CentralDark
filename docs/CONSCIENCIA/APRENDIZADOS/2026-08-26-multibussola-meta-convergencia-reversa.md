---
title: "!MULTIBÚSSOLA_META — convergência multieixo + rota reversa"
status: "CANONICAL_LEARNING_RECEIPT"
date: 2026-08-26
originator: "SEGREDO/CHEFE"
authority: "SEGREDO/CHEFE"
writer: "SOL"
owner: "docs/CONSCIENCIA/MULTIBUSSOLA.md"
source_pr: "#1189"
source_rule: "REALIDADE = JUDGE; UNKNOWN != PASS"
---

# !MULTIBÚSSOLA_META — extensão do owner existente

Este registro **não cria segundo gatilho, cérebro, router, agente ou owner**.

```text
!MULTIBÚSSOLA_META
= modo avançado / META(X) da !MULTIBUSSOLA canônica

OWNER
= docs/CONSCIENCIA/MULTIBUSSOLA.md

NEW_SYSTEM=false
NEW_OWNER=false
NEW_AGENT=false
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
```

A `MULTIBUSSOLA.md` já contém a lei `META(X) = X aplica a própria lei sobre X` e `META_MULTIBUSSOLA`; este cristal torna explícita a convergência por bearings e a contraprova reversa sem competir com o owner.

## Entrada

```text
INPUT:
  INTENT
  DESTINATION
  CURRENT_STATE
  HISTORY
  OWNERS
  CAPABILITIES
  EVIDENCE
  RISK
```

## Bearings materiais

```text
→ TRUE_NORTH_LOCK
→ RESOLVE_REQUIRED_BEARINGS
→ DECLINATION_CHECK
→ SPATIAL_TOPOGRAPHY_SCAN
→ TEMPORAL_CLOCK_FIX
→ HISTORY_DECAY_SCAN
→ NAUTICAL_HAZARD_DEPTH_SCAN
→ INERTIAL_CONTINUITY_CHECK
→ EXTERNAL_REALITY_FIX
→ PLANNED_VS_ACTUAL
→ PROVENANCE_BEARING
→ DEPENDENCY_BEARING
→ SEMANTIC_BEARING
→ RISK_BEARING
```

`REQUIRED_BEARINGS` significa apenas eixos materiais para o claim/escopo atual.

```text
NOT_APPLICABLE != UNKNOWN
JUSTIFIED_SKIP != PASS
UNKNOWN_MATERIAL = bearing material sem resposta suficiente
```

## Três rotas

```text
FORWARD_ROUTE
INTENT
→ owner/capability/action/evidence
→ DESTINATION

REVERSE_ROUTE
DESTINATION_PROVEN?
← receipt/evidence/effect
← execution
← decision
← INTENT

INVERSE_ROUTE
→ tentar inverter a premissa principal
→ testar causa/efeito trocados
→ testar owner/fonte alternativos
→ procurar explicação mais forte para a mesma evidência
```

```text
→ FORWARD_ROUTE
→ REVERSE_ROUTE
→ INVERSE_ROUTE
→ CROSS_BEARING_RENDEZVOUS
```

## Regra de divergência

```text
IF AXES_DISAGREE:
    → !META_LUPA
    → !RECONCILIAR
    → RESIDUAL_MAP
    → NEXT_CURSOR
```

Não existe votação de modelos. Conflito material exige teste discriminante ou permanece `UNKNOWN`.

## Mudança material invalida bearing dependente

```text
IF MATERIAL_STATE_CHANGED:
    → IDENTIFY_DEPENDENT_BEARINGS
    → INVALIDATE_STALE_BEARINGS
    → RE-FIX_ALL_MATERIAL_AXES_AFFECTED
```

Exemplos:

```text
HEAD mudou      → prova presa ao HEAD anterior pode ficar stale
runtime mudou   → health anterior pode ficar stale
owner mudou     → provenance bearing dependente precisa re-fix
fonte versionou → source/temporal bearing dependente precisa re-fix
intenção mudou  → TRUE_NORTH anterior não governa o novo destino
```

Não reiniciar cegamente eixo independente que continua válido.

## Fixed point

```text
ONLY_IF:
    ALL_REQUIRED_BEARINGS_CONVERGE
    AND UNKNOWN_MATERIAL=0
    AND NO_UNRESOLVED_CONTRADICTION

→ !FIXED_POINT

ELSE:
→ RESIDUAL_MAP
→ NEXT_CURSOR
```

## Contraprova reversa

A cadeia reversa serve para auditar se o estado final consegue voltar até a intenção sem contradição:

```text
!BOOT
← !REGISTRA
← !FIXED_POINT
← !REMEDIÇÃO
← !CONTRAPROVA
← !DELTAUTILS
← CROSS_CHAT_RECONCILIATION
← CRUZAR_CHATS
← HISTORY_RENDEZVOUS
← COMMITS_VERMELHOS
← PRS_ESQUECIDOS
← RELEMBRANDO
← !RECONCILIAR
← !META_LUPA
← !MULTIBÚSSOLA
← !CALIBRAR
← #ACORDAR
← [!HUMAN_FRONTIER_ONLY
   ← !CONTRAPROVA
   ← !META_LUPA
   ← !METACOGNIÇÃO
   ← !AUTOGRILL
   ← #GRILL-ME]
← !PAPAGAIO_OFF
← !MODO_CHEFE_CLARO
← !CENTRALDARK
```

Lei derivada:

```text
SE A CADEIA DIRETA DIZ "CHEGUEI"
MAS A CADEIA REVERSA NÃO VOLTA ATÉ A INTENÇÃO
SEM CONTRADIÇÃO MATERIAL

→ FIXED_POINT=false
```

## Aplicação ao PR #1189 no momento do aprendizado

No HEAD então medido `34f05572db270cd016da41d2cdc417f648b09661`, a rota reversa encontrou `mergeable=false` e workflows materiais em `failure`, portanto não permitiu fabricar `READY_FOR_MERGE=true`.

Este trecho é **HISTÓRICO preso ao HEAD**, não estado eterno do PR. Novo HEAD exige nova medição.

```text
HISTORY != CURRENT_STATE
GREEN_OLD + HEAD_NEW → REMEASURE
```

## Regra de ouro

```text
DERROTA
→ PRESERVAR EVIDÊNCIA
→ CONTRAPROVA
→ MECANISMO DISCRIMINÁVEL
→ DELTA MÍNIMO
→ TESTE/REGRESSÃO
→ GATE
→ CRISTAL
→ PRÓXIMO EVENTO REUSA
```

```text
PERDER != GANHAR
DERROTA_PRESERVADA_E_PROMOVIDA_CORRETAMENTE = GANHO_INFORMACIONAL_OPERACIONAL
CRYSTAL_CANDIDATE != CRYSTAL
PROSE_ONLY_RULE = NOT_LEARNED
```

## Fronteira de ativação

Este receipt registra a semântica no cânone de aprendizado e aponta para o owner existente.

```text
REGISTERED_IN_CANONICAL_LEARNING=true
OWNER_EXISTING=true
TRIGGER_MAP_EXPLICIT_ALIAS_FOR_!MULTIBUSSOLA_META=BOUND_IN_TRIGGER_FABRIC
RUNTIME_CONSUMPTION=NOT_PROVEN_BY_THIS_RECEIPT
```

O alias explícito `!MULTIBÚSSOLA_META` é promovido no Trigger Fabric como modo do owner `MULTIBUSSOLA`, com `FORWARD_ROUTE + REVERSE_ROUTE + INVERSE_ROUTE + CROSS_BEARING_RENDEZVOUS`, sem segundo pipeline.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
