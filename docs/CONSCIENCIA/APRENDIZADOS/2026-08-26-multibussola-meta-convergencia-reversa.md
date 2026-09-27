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

## Colheita complementar da sessão — diagnóstico local não encerra missão

O material posterior do SEGREDO/CHEFE explicitou uma separação que precisa
sobreviver à narrativa e ao status visual:

```text
LOCAL_ANALYSIS_STABLE
→ LOCAL_FIXED_POINT
→ LOCAL_FIXED_POINT_ENDS_GLOBAL_MISSION=false

PROOF_TARGET_MATCH
+ PROOF_OWNERSHIP
+ INDEPENDENT_COUNTERPROOF
+ EXTERNAL_ANCHOR_WHEN_APPLICABLE
+ REMEDICAO_T1
+ REALITY_JUDGE
→ FIXED_POINT_PASS | FIXED_POINT_FAIL | FIXED_POINT_BLOCKED | NOT_YET
```

O resolver determinístico agora discrimina esses estados. Um diagnóstico local
estável pode continuar com `MISSION_STATE=NOT_YET`; somente um PASS do alvo de
prova junto de `GLOBAL_OBJECTIVE_CLOSED=true` fecha a missão global.

### Evidência histórica recebida

O relato do CHEFE citou o PR `#1189`, HEAD candidato `684a12f9...`, main
`1ba30266...`, HEAD anterior `ed5970dc...`, diferença de dependências em
`package.json`/`package-lock.json` e workflows ainda `queued`.

Classificação desta colheita:

```text
SOURCE=CHEFE_SESSION_TEXT_AND_SCREENSHOTS
CLASS=HISTORICAL_REFERENCE
HASHES_PRESENT_IN_LOCAL_OBJECT_DB=false
GITHUB_LIVE_REMEASUREMENT=UNAVAILABLE_NO_REMOTE_OR_AUTH
QUEUED != PASS
CURRENT_PR_1189_STATE=UNKNOWN_UNTIL_REMEASURED
```

As screenshots também mostram superfícies abertas de Screenpipe, Codex/VS Code,
terminal, navegador e Obsidian. Elas provam a existência visual dessas
superfícies no instante capturado; não provam sozinhas o backend, o HEAD atual,
o resultado dos gates ou transporte causal entre janelas.

```text
SCREENSHOT_IS_SENSOR=true
SCREENSHOT_IS_CURRENT_RUNTIME_PROOF=false
MULTIPLE_WINDOWS != MULTIPLE_CANONICAL_OWNERS
HISTORICAL_REFERENCE != CURRENT_STATE
```

## Colheita complementar — Electron ZIP renomeado e prova byte a byte

O SEGREDO/CHEFE entregou um transcript de execução anterior com três nomes para
o mesmo candidato a artefato Electron:

```text
electron-v40.10.2-win32-x64(1).zip
electron-v40.10.2-win32-x64.zip
CENTRALDARK_ELECTRON_v40.10.2_win32_x64.zip
```

O transcript declarou, para aquela execução:

```text
SHA256=25ea6cfdc06deba58dafa6a3fc1fbd6dcda9e06a14035150ee1d9f73bca2e651
SIZE_BYTES=138160256
SOURCE_DUPLICATES_BYTE_IDENTICAL=PASS
ZIP_TEST_EXIT=0
ENTRY_COUNT=75
UNCOMPRESSED_BYTES=346330166
COMPRESSED_MEMBER_BYTES=138152334
```

Esses campos são preservados como receipt histórico fornecido pelo CHEFE, sem
promovê-los a estado atual. Na remedição desta sessão, os três caminhos estavam
ausentes em `/mnt/data`; por isso nenhum rename, cópia, novo hash ou `unzip -t`
foi alegado como executado agora.

```text
SOURCE=CHEFE_SUPPLIED_COMMAND_TRANSCRIPT
HISTORICAL_BYTE_IDENTITY=USER_SUPPLIED_PASS
CURRENT_SOURCE_1=MISSING
CURRENT_SOURCE_2=MISSING
CURRENT_DESTINATION=MISSING
CURRENT_RENAME=BLOCKED_SOURCE_MISSING
CURRENT_BYTE_IDENTITY=UNKNOWN
CURRENT_ZIP_VALIDITY=UNKNOWN
NO_FALSE_RECEIPT=true
```

Quando qualquer fonte reaparecer, o gate discriminante é:

```text
MEASURE_SOURCE_SHA256_AND_SIZE
→ IF BOTH_SOURCES_EXIST: CMP_BYTE_FOR_BYTE
→ RENAME_OR_COPY_ONLY_AUTHORIZED_SOURCE_TO_CANONICAL_NAME
→ MEASURE_DESTINATION_SHA256_AND_SIZE
→ unzip -tq DESTINATION
→ REQUIRE SOURCE_SHA256 == DESTINATION_SHA256
→ WRITE_EXTERNAL_RECEIPT_BOUND_TO_OBSERVED_PATH_AND_TIME
```

### Screenshot Screenpipe

A imagem posterior mostra a tela `Models & keys -> Update preset`, com opções de
provider incluindo `screenpipe`, `Codex`, `Claude Code`, `Cursor` e `Pi`, além de
`AI Model=auto` e um campo `Custom Prompt`. A imagem comprova a superfície
visual naquele instante; não comprova qual preset foi salvo, qual provider foi
ativado, autenticação bem-sucedida ou execução posterior do prompt.

```text
SCREENPIPE_PROVIDER_OPTIONS_VISIBLE=true
SCREENPIPE_PRESET_SAVED=UNKNOWN
CODEX_PROVIDER_ACTIVE=UNKNOWN
AUTHENTICATION_STATE=UNKNOWN
CUSTOM_PROMPT_EXECUTED=UNKNOWN
```

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
