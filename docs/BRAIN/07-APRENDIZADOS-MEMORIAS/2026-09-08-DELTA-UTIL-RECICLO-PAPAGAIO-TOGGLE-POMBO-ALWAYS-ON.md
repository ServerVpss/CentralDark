---
title: "Delta útil — reciclo passado, presente e futuro"
status: KNOWLEDGE_ONLY
date: 2026-09-08
updated: 2026-09-08T00:00:00-03:00
tags: [delta-util, reciclo, handoff, pr-mae, centraldark]
category: BRAIN-APRENDIZADOS
sensitivity: INTERNAL
source: "sessão viva do CHEFE sobre delta útil e handoff material"
source_class: HUMAN_AUTHORITY
source_rule: "CURRENT > HISTORY; MATERIAL_DELTA_REQUIRED; UNKNOWN_IS_NOT_PASS"
owner: "docs/BRAIN/07-APRENDIZADOS-MEMORIAS/"
---
# 👑 !AUREULA · DELTA ÚTIL · RECICLO PASSADO → PRESENTE → FUTURO

Data: 2026-09-08

Refs #1444 #1463 #1458 #1454 #1447

```text
PR_MAE=#1444
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
PAPAGAIO_DEFAULT=OFF
POMBO_DEFAULT=CHECKSUM_ON
POMBO_MATERIAL_HANDOFF=ALWAYS_ON
UNKNOWN_IS_NOT_PASS=true
ACTION_IS_NOT_PROOF=true
CURRENT_GT_HISTORICAL=true
```

## 1. Correção explícita da SOL

A SOL classificou cedo demais como feridas atuais três itens vistos em tela/sessão:

```text
JUDGE_RUNTIME_ERROR
GH_RUN_VIEW_INVALID_FIELD_STEPS
RUNNER_CAPACITY_OFFLINE
```

Correção do método:

```text
SCREEN_OBSERVATION
!= CURRENT_LIVE_FAILURE_FOREVER

OBSERVATION_FROM_T0
→ preserve as HISTORY/PROVENANCE
→ remeasure affected cone
→ if autonomous loop continued, do not pretend the first symptom stopped the engine
```

As telas posteriores mostraram o agente truncando saída e continuando autonomamente com `Continuing toward your standing goal`. Portanto, o fato material é:

```text
AUTONOMOUS_LOOP_CONTINUED_AFTER_OUTPUT_TRUNCATION=true
TRUNCATED_OUTPUT!=STOPPED_ENGINE
ASK_AGAIN_FOR_ALREADY_GRANTED_SAFE_AUTHORITY=false
```

`judge error: RuntimeError` e comando `gh run view` com campo inválido permanecem como observações históricas úteis para diagnóstico, mas não são promovidos aqui a falhas vivas sem nova prova específica.

## 2. Estado vivo GitHub desta remedição

```text
MAIN_HEAD=c59b522b5917c089d57c2f0a2a92396dbeb098e9
MAIN_MESSAGE=docs(cli): padronizar saída humana da CentralDark em português

PR_1444_HEAD_BEFORE_THIS_RECEIPT=a217a84527d5021c891f76b6fd4f2e6f1305c9cd
PR_1444_STATE=OPEN
PR_1444_MERGEABLE=true
COMPARE=diverged
PR_AHEAD_BY=78
PR_BEHIND_BY=4
MERGE_BASE=ad4ed0ac76cb2361b005684c9c1323876a5174a5

PR_1444_SAME_HEAD_RUN_COUNT=16
KNOWN_RUN_STATES=pending|queued|other_not_yet_final
FIXED_POINT=false
```

A `main` realmente avançou e, nesta medição, permanece em `c59b522...`.

O #1444 está quatro commits atrás da `main`; isso exige reconciliação antes de qualquer promoção final, mas não apaga os 78 commits de lineage do PR.

## 3. Reciclo temporal obrigatório

```text
PASSADO
→ preservar evidência, erros, refutações, receipts e decisões

PRESENTE
→ remedir somente o cone afetado
→ CURRENT > HISTORICAL

FUTURO
→ preparar owner + next cursor + contraprova
→ não criar sistema paralelo
```

Algoritmo:

```text
HISTORY
→ DEDUPE
→ CURRENT_MEASUREMENT
→ CLASSIFY
→ OWNER
→ MINIMAL_DELTA
→ TEST
→ COUNTERPROOF
→ REMEASURE
→ RECEIPT
→ NEXT_CURSOR
```

Nada fica para trás, mas nada antigo governa o presente sem remedição quando o estado puder ter mudado.

## 4. BOOT Papagaio como estado controlável

O repo já possui o cristal canônico `PAPAGAIO_MODE=OFF` e `POMBO_MODE=CHECKSUM_ON`.

Nova exigência de produto para o mesmo core, sem criar engine novo:

```text
PAPAGAIO_SWITCH_SUPPORTED=true
PAPAGAIO_ALLOWED_STATES=[ON,OFF]
PAPAGAIO_DEFAULT=OFF
PAPAGAIO_STATE_SHARED_ACROSS_SURFACES=true
```

Superfícies obrigatórias:

```text
CLI
CentralDark.exe
SITE/HUD
VOICE quando aplicável
```

Semântica:

```text
PAPAGAIO=OFF
→ máquina deduplica
→ não devolve trabalho mecânico já resolvível
→ não preenche lacuna com narrativa
→ não trata histórico/screenshot como estado vivo

PAPAGAIO=ON
→ permite modo mais narrativo/repetitivo/explicativo para interação humana
→ ainda não pode fabricar PASS
→ ainda não pode remover UNKNOWN
→ ainda não muda autoridade, Writer ou Judge
```

O toggle é preferência de interação, não licença para falso-verde.

Interface desejada:

```text
CLI:            !PAPAGAIO ON|OFF
APP/HUD:        toggle PAPAGAIO [ON|OFF]
SITE/HUD:       toggle PAPAGAIO [ON|OFF]
STATUS:         PAPAGAIO=<ON|OFF>
```

Owner real de CLI/APP/site deve ser localizado antes da implementação material. `CREATE_PAPAGAIO_ENGINE_V2=false`.

## 5. POMBO sempre ativo em handoff/pacote material

O POMBO já é canônico como transporte verificável de continuidade.

Nova regra de produto:

```text
POMBO_MODE=CHECKSUM_ON
POMBO_DISABLE_FOR_MATERIAL_HANDOFF=FORBIDDEN
POMBO_DISABLE_FOR_PACKAGE_EXPORT=FORBIDDEN
POMBO_DISABLE_FOR_PLUGIN_PLAY_PACKAGE=FORBIDDEN
```

Para qualquer pacote plug-and-play material:

```text
PACKAGE
→ DESTINATION_LOCK
→ SOURCE_REF
→ FILE_INVENTORY
→ SHA256_WHEN_MATERIAL
→ MANIFEST
→ PROVENANCE
→ RECEIPT
→ UNKNOWNS/RESIDUAL
→ NEXT_CURSOR
```

O POMBO ajuda a provar integridade/proveniência e continuidade do pacote.

Cadeado epistemológico:

```text
CHECKSUM_MATCH=BYTE_IDENTITY
CHECKSUM_MATCH!=FUNCTIONAL_SAFETY
CHECKSUM_MATCH!=SEMANTIC_CORRECTNESS
PACKAGE_VERIFIED!=DEPLOYED
PLUGIN_PLAY_READY_REQUIRES_TESTS_AND_CONSUMER_PROOF=true
```

Portanto, `POMBO_ALWAYS_ON` fortalece pacote seguro, mas não substitui testes, contraprova, consumer real e Reality Judge.

## 6. HUD único

O estado desses modos deve aparecer no HUD lateral já registrado nesta sessão:

```text
👑 !AUREULA
├── 🦜 PAPAGAIO: OFF|ON
├── 🕊️ POMBO: CHECKSUM_ON (LOCKED para handoff/pacote material)
├── 🤖 provider/model
├── 👥 contas
├── 📊 quota
├── 🔌 MCP/connectors
├── 📚 sources
├── 🧰 tool calls
├── 🎯 results
├── 🧿 queue
├── 🏠 Casa
├── 🖥️ VPS
├── 🐙 GitHub
├── 🌐 site
└── 🧾 receipts
```

## 7. Autoridade e autonomia

A correção da sessão fica explícita:

```text
SAFE_AUTHORITY_ALREADY_GRANTED
+ MACHINE_RESOLVABLE_DIRECTION
→ MEASURE
→ EXECUTE_MINIMAL_SAFE_DELTA
→ RETEST
→ CONTINUE_NEXT_CURSOR
```

Não voltar ao CHEFE só para pedir autorização já concedida.

Parada somente em:

```text
FIXED_POINT
PROVEN_HUMAN_FRONTIER
BLOCKED_WITH_EXPLICIT_CAUSE
DESTRUCTIVE_OR_IRREVERSIBLE_OUTSIDE_AUTHORITY
```

## 8. Feridas vivas após reciclo

Com evidência GitHub disponível nesta rodada:

```text
MAIN_DRIFT_VS_PR1444=PROVED
PR1444_BEHIND_MAIN_BY=4
PR1444_AHEAD_BY=78
SAME_HEAD_CI_FINAL_PASS=NOT_PROVED
PR1444_FIXED_POINT=false
```

Não promover como ferida viva sem remedição específica:

```text
JUDGE_RUNTIME_ERROR=HISTORICAL_OBSERVATION_UNTIL_REMEASURED
GH_RUN_VIEW_INVALID_FIELD=HISTORICAL_OPERATIONAL_ERROR_UNTIL_REMEASURED
RUNNER_OFFLINE=HISTORICAL_OR_TRANSIENT_UNTIL_CURRENT_RUNNER_PROOF
```

## 9. Linha contínua do que já foi cadastrado nesta sessão

Preservado no #1444 e nos receipts desta sessão:

```text
AUREULA_HEADER
BIBLICAL_TRIGGER_STYLE
HUD_PROVIDER_MODEL
MULTI_ACCOUNT_MINIMUM_2
QUOTA_LIMITS
CONNECTION_FABRIC
TOOL_CALL_LEDGER
SOURCES
RESULTS
QUEUE_FABRIC
REMOTE_BRIDGE_SESSION_STALE
APP_EXE
JARVIS_FRIDAY_VOICE
429_PROVIDER_ROUTING
PM2_WATCHDOG
OBSIDIAN_BRAIN
CASA_VPS_SITE_RECEIPTS
PAPAGAIO_TOGGLE
POMBO_ALWAYS_ON_FOR_MATERIAL_HANDOFF_AND_PACKAGES
```

Nada desta lista é descartado só porque ainda não está implementado no runtime. Estado correto é `REGISTERED/REQUIREMENT` até prova física.

## 10. Next cursor

```text
NEXT_CURSOR_1=RECONCILE_PR1444_WITH_CURRENT_MAIN_WITHOUT_LOSING_LINEAGE
NEXT_CURSOR_2=FREEZE_NEW_HEAD_AND_MEASURE_SAME_HEAD_CI
NEXT_CURSOR_3=LOCATE_EXISTING_CLI_APP_SITE_SETTINGS_OWNER_FOR_PAPAGAIO_TOGGLE
NEXT_CURSOR_4=LOCATE_EXISTING_PACKAGE_BUILDER_AND_BIND_POMBO_CHECKSUM_ALWAYS_ON
NEXT_CURSOR_5=REMEASURE_RUNNER_ONLY_IF_CURRENT_CI_REQUIRES_SELF_HOSTED_CAPACITY
NEXT_CURSOR_6=CONTINUE_SITE_FIRST_GOAL_WITH_CURRENT_EVIDENCE
```

## 11. Fixed point

```text
FIXED_POINT=false
MAIN_CURRENT=c59b522b5917c089d57c2f0a2a92396dbeb098e9
PR1444_DIVERGED=true
SAME_HEAD_FINAL_VERDICT=UNKNOWN
PAPAGAIO_RUNTIME_TOGGLE=NOT_YET_PROVED
POMBO_PACKAGE_BINDING=NOT_YET_PROVED
```

> Nada fica para trás. Passado vira proveniência, presente vira medição, futuro recebe next cursor. O Pombo carrega o fio com checksum; o Papagaio pode ser ligado ou desligado na interface, mas nunca ganha licença para pintar UNKNOWN de verde.
