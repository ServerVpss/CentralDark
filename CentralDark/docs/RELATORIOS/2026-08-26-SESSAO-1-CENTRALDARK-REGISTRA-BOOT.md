# !REGISTRA — Sessão 1 CentralDark — 2026-08-26

## Classificação

```text
TYPE=SESSION_INTELLIGENCE_RECEIPT
CURRENT_STATE_AUTHORITY=false
HISTORICAL_REFERENCE=true
REMEASURED_BEFORE_REGISTER=true
PAPAGAIO_MODE=OFF
POMBO_MODE=CHECKSUM_ON
REALITY_IS_JUDGE=true
UNKNOWN_IS_NOT_PASS=true
```

Este receipt preserva o delta útil observado nesta sessão sem transformar narrativa, screenshot, arte visual, histórico de PR ou workflow antigo em estado vivo.

## 1. Cadeia cognitiva consolidada

```text
!CENTRALDARK
→ #ACORDAR
→ !CALIBRAR
→ !MULTIBUSSOLA
   └→ MODE=META quando !MULTIBÚSSOLA_META
→ TRUE_NORTH_LOCK
   INTENT
   DESTINATION
   PROOF_TARGET
   MATERIAL_SCOPE
→ RESOLVE_REQUIRED_BEARINGS
→ EXECUTE_MATERIAL_BEARINGS
   + SKIP_JUSTIFICADO apenas não materiais
→ FORWARD_ROUTE
→ REVERSE_ROUTE
→ INVERSE_ROUTE quando discriminante
→ CROSS_BEARING_RENDEZVOUS
→ SE DIVERGIR:
   !META_LUPA
   → TESTE_DISCRIMINANTE
   → !RECONCILIAR
   → RENDEZVOUS novamente
→ SE ESTADO MATERIAL MUDAR:
   IDENTIFICAR_CONE_CAUSAL
   → INVALIDAR_SOMENTE_CLAIMS_DEPENDENTES
   → PRESERVAR_PROVAS_INDEPENDENTES
   → RE-FIX_AFFECTED_AXES
   → RENDEZVOUS novamente
→ LOCAL_ANALYSIS_STABLE?
   NÃO → RESIDUAL_MAP → NEXT_CURSOR
   SIM → LOCAL_FIXED_POINT
          → NÃO ENCERRA A MISSÃO
→ !META_LUPA quando aplicável
→ !RECONCILIAR quando aplicável
→ !CONTRAPROVA
   → PROOF_TARGET_MATCH
   → PROOF_OWNERSHIP
   → INDEPENDENT_COUNTERPROOF
   → EXTERNAL_ANCHOR quando aplicável
→ !REMEDIÇÃO_T1
→ REALITY_JUDGE
→ FIXED_POINT_PASS | FIXED_POINT_FAIL | FIXED_POINT_BLOCKED
→ !REGISTRA
→ !BOOT
```

## 2. Invariantes aprendidos/reforçados

```text
FIXED_POINT != PASS
LOCAL_FIXED_POINT != MISSION_COMPLETE
DIAGNOSTIC_PROVEN != MISSION_CLOSED
UNKNOWN_MATERIAL=0_REQUIRED_FOR_PASS
MATERIAL_STATE_CHANGE_REOPENS_AFFECTED_AXES_ONLY=true
PRESERVE_INDEPENDENT_PROOF=true
INVALIDATE_ONLY_CAUSALLY_DEPENDENT_CLAIMS=true
NO_NEW_INFORMATION -> STOP_OR_PRESERVE_FRONTIER
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
ONE_WRITER_PER_SCOPE=true
NO_V3_V4_FOR_SAME_RESPONSIBILITY=true
GRAPH=DERIVED_NOT_AUTHORITY
ACTION!=PROOF
HISTORY!=CURRENT_STATE
```

## 3. PR #1189 — reconciliação temporal

### Estado histórico capturado no material da sessão

O material humano preservou um instante em que:

```text
PR=1189
HEAD=684a12f9f8e5a527352531388411d30fde4230c1
MISSION_STATE=FIXED_POINT_BLOCKED / NOT_YET
CI/gates=queued|cancelled|pending conforme o instante observado
```

Esse estado é **histórico**, não atual.

### Estado re-medido nesta execução

```text
PR_1189_STATE=CLOSED
PR_1189_MERGED=true
PR_1189_HEAD_SHA=684a12f9f8e5a527352531388411d30fde4230c1
PR_1189_MERGE_SHA=e1d7aac29f03a32699514683b8da7df341f745b8
PR_1189_MERGED_AT=2026-08-26T20:10:01Z
```

Logo:

```text
OLD_FIXED_POINT_BLOCKED != CURRENT_PR_STATE
OLD_QUEUED_CI != CURRENT_PR_STATE
MERGED=true
MERGED != DEPLOYED
MERGED != CURRENT_MAIN_HEAD_FOREVER
```

## 4. Main — estado re-medido

No momento do registro:

```text
MAIN_HEAD=1c9225005276bef3b1f4dd41acb3a73a95269e83
MAIN_HEAD_MESSAGE=chore(deps): bump typescript from 5.8.3 to 5.9.3 (#1193)
```

Portanto qualquer claim anterior sobre `main@1ba30266...`, `main@684a12f9...` ou outro SHA é histórico até nova medição.

## 5. Workflows do antigo HEAD do PR #1189

A consulta do SHA `684a12f9...` mostrou uma mistura de estados históricos, incluindo:

```text
Trigger Fabric Full Package=cancelled
porta-de-entrada=cancelled
lupa-conformance=cancelled
codex-validate=cancelled
PR auto-review=cancelled
CodeQL=skipped
alguns jobs ainda queued/pending na consulta
```

Regra preservada:

```text
CANCELLED != PASS
SKIPPED != PASS
QUEUED != PASS
OLD_WORKFLOW_STATE != CURRENT_MAIN_STATE
```

O merge do PR é fato independente; não retroativamente converte cada workflow histórico em PASS.

## 6. Material visual da sessão

### Screenshot isolado

Arquivo observado nesta sessão:

```text
SHA256=afcd5ce3f7a8b53190c6219d1f3b356896f35bfe0b642c051ddff75298243dd9
BYTES=430046
```

O screenshot mostra Visual Studio Code / terminal / extensão Docker DX e conteúdo operacional local. Ele é evidência de uma superfície visual em T0, não prova automática do runtime atual.

### Pacote CENTRALDARK_PACOTAO_DUAS_ARTES_VISUAIS(1).zip

```text
ZIP_SHA256=2be83adeda6880648b676c3468824861fda3ba85bd95abe929a9c52fd0b1b5be
ZIP_BYTES=5036931
```

Conteúdo verificado:

```text
ARQUITETURA.md=OK
MANIFEST.json=OK
README.md=OK
RECEIPT.json=OK
assets/01_CENTRALDARK_AMADURECIMENTO_TATICO_DA_CASA.png=OK
assets/02_CENTRALDARK_OURO_SENDO_COLETADO.png=OK
```

Hashes declarados e recalculados dos dois PNGs:

```text
01=9c5fd4bc7486f79b1014f323e1e65e53a380e9b54177d68d0ecf2cd9761ebe4b
02=252709f127cde40ba571ec54a6f2fda44b8989b6715f73db8f5817414f87217f
```

Fronteira preservada pelo próprio pacote:

```text
VISUAL_ALIAS != CANONICAL_OWNER
VISUAL_CLAIM != LIVE_STATE
CHECKSUM = BYTE_IDENTITY_ONLY
PACKAGE_INTEGRITY != DEPLOYMENT_PROOF
```

## 7. Ouro cognitivo observado nas duas artes

As artes representam, sem criar novos owners:

```text
SEGREDO/CHEFE
→ intenção + autoridade
→ #ACORDAR
→ !CALIBRAR
→ !MULTIBUSSOLA
→ SOL coordena/reconcilia
→ WRITER ÚNICO serializa mutação
→ HERMES executa/preserva
→ EVIDÊNCIA + CONTRAPROVA
→ REALITY JUDGE
→ REMEDIAR ou RECEIPT+APRENDIZADO
```

A segunda arte acrescenta a metáfora de garimpo:

```text
MATERIAL BRUTO
→ COLETA
→ CLASSIFICAÇÃO
→ PROVA/CONTRAPROVA
→ OURO ÚTIL
→ OWNER CANÔNICO
```

Metáfora visual é navegação, não autoridade.

## 8. Correções de narrativa desta sessão

A linguagem épica/baianesa pode ser usada como camada de apresentação, mas não governa o veredito técnico.

```text
"barreira desmoronou" -> pode descrever uma barreira específica removida
"tudo se revelou" -> NÃO implica ausência universal de UNKNOWN
"profeta/rei" -> linguagem humana/narrativa, NÃO owner técnico novo
"estabilidade absoluta" -> claim absoluto proibido sem denominador e prova correspondente
```

Forma operacional segura:

```text
BARRIER_X_REMOVED=PROVADO quando há evidência
MISSION_COMPLETE=só após fixed point aplicável
ZERO_REGRESSION=só com escopo/denominador/testes definidos
REALITY_REMAINS_JUDGE=true
```

## 9. Aprendizado transferível

```text
CLAIM
→ LOCAL_ANALYSIS
→ LOCAL_FIXED_POINT
→ NÃO ENCERRAR MISSÃO AUTOMATICAMENTE
→ CONTRAPROVA INDEPENDENTE
→ T1
→ REALITY_JUDGE
→ PASS|FAIL|BLOCKED
```

O ganho principal desta sessão é a separação explícita entre:

```text
ANÁLISE LOCAL ESTÁVEL
vs
MISSÃO GLOBAL ENCERRADA
```

Isso reduz falso verde sem transformar a Casa em loop infinito: quando não há informação nova, preserva-se `RESIDUAL_MAP + NEXT_CURSOR` ou uma fronteira provada.

## 10. !BOOT — estado recuperável

```text
BOOT_ID=2026-08-26-SESSAO-1-CENTRALDARK
SOURCE_SESSION=chat + screenshot + visual package + GitHub live remeasurement
CURRENT_MAIN_AT_REGISTER=1c9225005276bef3b1f4dd41acb3a73a95269e83
PR_1189=MERGED
PR_1189_MERGE_SHA=e1d7aac29f03a32699514683b8da7df341f745b8
VISUAL_PACKAGE_INTEGRITY=PASS
VISUAL_PACKAGE_RUNTIME_PROOF=NO
RUNTIME_LOCAL_VPS_CURRENT=UNKNOWN_UNTIL_REMEASURED
DEPLOY_STATE=UNKNOWN_UNTIL_SPECIFICALLY_MEASURED
NEXT_ACORDAR=REMEASURE_CURRENT_MAIN_AND_TARGET_SCOPE_BEFORE_ANY_PRESENT_TENSE_CLAIM
NEXT_CURSOR=CONTINUE_FROM_CURRENT_MAIN_NOT_FROM_684a12f9_HISTORY
```

Cadeia de retomada:

```text
!CENTRALDARK
→ #ACORDAR
→ comparar CURRENT_MAIN com 1c922500...
→ invalidar apenas claims dependentes se mudou
→ !CALIBRAR intenção/escopo atual
→ !MULTIBUSSOLA[_META] quando material
→ !META_LUPA
→ !RECONCILIAR
→ !CONTRAPROVA
→ !REMEDIÇÃO_T1
→ REALITY_JUDGE
→ !FIXED_POINT
→ !REGISTRA
→ !BOOT
```

## Receipt curto

```text
REGISTRA=PASS_NO_ESCOPO_DO_RECEIPT
SESSION_1_HARVESTED=true
PR_1189_CURRENT_STATE_REMEASURED=true
MAIN_CURRENT_STATE_REMEASURED=true
VISUAL_PACKAGE_BYTE_INTEGRITY=PASS
RUNTIME_GLOBAL=NOT_PROVEN
DEPLOY=NOT_PROVEN
UNKNOWN_PRESERVED=true
NEXT_CURSOR=REMEASURE_BEFORE_PRESENT_TENSE
```
