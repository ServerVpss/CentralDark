# APPCENTRALDARK EVOLUIR → bridge/capability reconciliation — 2026-09-02

**PR-mãe:** `#1381`  
**Owner canônico:** `.agents/skills/centraldark-operational-method/SKILL.md`  
**Natureza:** receipt/ledger subordinado; não cria novo sistema, novo bridge, nova identidade ou autoridade.  
**Intenção:** absorver o denominador citado `APPCENTRALDARK EVOLUIR` por cima do bridge já existente, sem perda silenciosa e sem transformar quantidade histórica em verde automático.

```text
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
ONE_WRITER_PER_SCOPE=true
CURRENT > HISTORICAL
UNKNOWN != PASS
DOCUMENTED != EXECUTED
ACTION != PROOF
VISUAL != RUNTIME_PROOF
RAW_ENTRY != CAPABILITY
FILESYSTEM_PRESENCE != OPERATIONAL_PASS
CACHE_ENTRY != PRODUCT_CAPABILITY
BRIDGE_SOURCE != RUNTIME_T1
```

## 1. Snapshot T0 remoto antes deste commit

```text
PR=1381
PR_STATE=OPEN
MERGED=false
MERGEABLE=false
PR_HEAD=901a43a3a791b19dce28bc338201e318918bc662
BASE=main
BASE_HEAD=0542cee586e55be5334ba1e8d369d3b040ee1178
AHEAD_OF_MAIN=60
BEHIND_MAIN=58
PR_RELATION=diverged
PR_WORKFLOW_RUNS_CURRENT_HEAD=0 observed by connector
GLOBAL_FIXED_POINT=NOT_PROVEN
```

O commit deste receipt avança o HEAD; este bloco é T0, não estado permanente.

## 2. Correção do denominador `11.360`

A frase de missão citou `11.360 entradas` para `APPCENTRALDARK EVOLUIR`. Nesta rodada esse número NÃO foi reproduzido por inventário byte-a-byte do alvo atual. Portanto:

```text
APPCENTRALDARK_EVOLUIR_DECLARED_DENOMINATOR=11360
DENOMINATOR_PROVEN_CURRENT=UNKNOWN
ENTRIES_PROVEN_PASS=UNKNOWN
ENTRIES_PROVEN_FAIL=UNKNOWN
ENTRIES_PROVEN_DUPLICATE=UNKNOWN
ENTRIES_PROVEN_CACHE=UNKNOWN
ENTRIES_PROVEN_CAPABILITY=UNKNOWN
```

Regra operacional:

```text
11360_DECLARED
!=
11360_CAPABILITIES
!=
11360_PASS
```

Cada entrada só pode avançar de RAW/CANDIDATE para owner/capability quando houver identidade suficiente, provenance, dedupe, consumidor e prova aplicável.

## 3. Screenpipe WebView2 / EBWebView

Caminho fornecido pelo CHEFE, sanitizado para evitar persistir username local:

```text
%LOCALAPPDATA%\screenpipe\WebView2\EBWebView
```

Classificação correta:

```text
SCREENPIPE_WEBVIEW2_PATH=OBSERVED_BY_HUMAN_INPUT
EBWEBVIEW_ROLE=CANDIDATE_RUNTIME_MATERIALIZATION_OR_CACHE
EBWEBVIEW_ENTRY_COUNT_AS_CAPABILITY=FORBIDDEN
DELETE_OR_PROMOTE_BY_NAME_ONLY=FORBIDDEN
```

WebView2 pode conter cache, storage, service worker, IndexedDB, sessão e materialização do renderer. Quantidade de arquivos ali não mede quantidade de capacidades da CentralDark.

A regra de ingestão é:

```text
RAW_ENTRY
→ IDENTIFY_TYPE
→ HASH_WHEN_BYTES_AVAILABLE
→ DEDUPE
→ CLASSIFY_CACHE_RUNTIME_SOURCE_ARTIFACT
→ MAP_CONSUMER
→ MAP_EXISTING_OWNER
→ PROVE_DELTA
→ COUNTERPROOF
→ ONLY_THEN_PROMOTE_OR_IGNORE
```

Nada em `EBWebView` deve ser executado, copiado ao Git ou apagado automaticamente apenas por existir.

## 4. Bridge Desktop já existente — REUSE, não duplicação

Owner real medido no branch do #1381:

```text
apps/modulos/Bolt/source/electron/preload/index.ts
apps/modulos/Bolt/source/electron/main/index.ts
```

Capacidades materializadas no source:

```text
CENTRALDARK_BRIDGE
├─ getRuntime
├─ getHermesHealth
├─ getScreenpipeHealth
├─ openIntent
├─ showMain
├─ toggleWidget
└─ hideWidget
```

O processo Electron principal também materializa:

```text
APP_NAME=CentralDark
APP_ID=com.centraldark.desktop
HOUSE_ROOT_RESOLUTION
CENTRALDARK_PUBLIC_URL
HERMES_BASE_URL
SCREENPIPE_BASE_URL
SOL_WIDGET_SHORTCUT
IPC_TYPED_CHANNELS
HERMES_HEALTH_PROBE
SCREENPIPE_HEALTH_PROBE
MAIN_WINDOW_CONTROL
SOL_WIDGET_CONTROL
INTENT_TO_RENDERER
```

Veredito:

```text
DESKTOP_BRIDGE_SOURCE=PROVEN
SECOND_DESKTOP_BRIDGE_REQUIRED=false
SECOND_CENTRALDARK_APP_REQUIRED=false
RUNTIME_T1_OF_ALL_BRIDGE_CALLS=UNKNOWN_UNTIL_EXECUTED
```

## 5. Screenpipe probe já existente

Owner real:

```text
apps/modulos/fixed-point-fabric/src/centraldark_fixed_point/probes/screenpipe.py
```

A prova do Screenpipe já segue duas etapas:

```text
GET /health
→ HTTP 200 requerido

GET /search?limit=5&start_time=<recent-window>
→ dado recente requerido
→ fingerprint SHA-256 do payload redigido
```

Sem health ou sem dado recente, o probe retorna `BLOCKED`; não inventa PASS. O próprio receipt afirma que Screenpipe é sensor read-only e não juiz.

Logo `APPCENTRALDARK EVOLUIR` deve reutilizar esse probe para qualquer claim de observação Screenpipe, em vez de inferir saúde pela existência de `WebView2`.

## 6. O que as capturas desta rodada provam e não provam

### Observado visualmente

```text
E:\CentralDark\sol-desktop-poc = pasta presente
E:\CentralDark = raiz com múltiplas superfícies/pastas históricas e atuais
Gmail = notificações de avanço/bloqueio do PR #1381 visíveis
APPCENTRALDARK/arquivos locais = material candidato a reconciliação
```

### Não provado por captura

```text
SOL_DESKTOP_RUNTIME_PASS=UNKNOWN
ALL_FILES_CANONICAL=UNKNOWN
ALL_11360_ENTRIES_USEFUL=UNKNOWN
SCREENPIPE_RUNTIME_PASS_BY_WEBVIEW_FOLDER=false
GMAIL_NOTIFICATION_IS_GITHUB_STATE=false
```

Notificação é trace; GitHub remoto é medido diretamente para estado do PR.

## 7. Matriz de capacidade a usar no inventário finito

Cada entrada do denominador precisa terminar em exatamente uma classificação primária, com provenance preservada:

```text
CANONICAL_SOURCE
RUNTIME_MATERIALIZATION
CACHE
GENERATED_BUILD
RECEIPT_EVIDENCE
CONFIGURATION
CAPABILITY_IMPLEMENTATION
UI_SURFACE
SENSOR_DATA
DEPENDENCY
DUPLICATE_BYTE_IDENTICAL
HISTORICAL_GOLD_CANDIDATE
PERSONAL_OR_OUT_OF_SCOPE
UNKNOWN
```

Se `CAPABILITY_IMPLEMENTATION` ou `UI_SURFACE`, mapear para owner/consumer existente. Se `CACHE`, `RUNTIME_MATERIALIZATION` ou `GENERATED_BUILD`, não transformar automaticamente em fonte canônica. Se `UNKNOWN`, bloquear promoção daquela entrada sem bloquear artificialmente o verde já provado de outro escopo.

## 8. Denominador mensurável

O painel não deve usar progresso global baseado em `11.360` até o inventário atual provar o total. Quando existir inventário reproduzível:

```text
TOTAL_CURRENT = número recontado no alvo exato
CLASSIFIED = soma das entradas com classe primária
OWNER_MAPPED = entradas aplicáveis com owner/consumer localizado
PROVEN = entradas aplicáveis que passaram teste/contraprova do território
BLOCKED = entradas aplicáveis com blocker explícito
UNKNOWN = TOTAL_CURRENT - CLASSIFIED
```

Percentuais só podem usar o denominador recontado:

```text
classification_pct = CLASSIFIED / TOTAL_CURRENT
owner_mapping_pct = OWNER_MAPPED / APPLICABLE_ENTRIES
proof_pct = PROVEN / APPLICABLE_ENTRIES
```

`100%` só existe para a métrica cujo denominador foi efetivamente medido; não existe `200%` como claim operacional.

## 9. Evoluir por cima do bridge provado

Fluxo canônico para esta frente:

```text
APPCENTRALDARK_EVOLUIR
→ READ_ONLY_INVENTORY
→ CURRENT_DENOMINATOR
→ HASH/DEDUPE
→ CLASSIFY
→ EXISTING_OWNER
→ EXISTING_BRIDGE_OR_PROBE
→ MINIMAL_DELTA
→ TEST
→ COUNTERPROOF
→ T1
→ RECEIPT
→ FIXED_POINT_CANDIDATE
```

Proibido:

```text
NEW_BRIDGE_BECAUSE_MANY_FILES
NEW_APP_BECAUSE_SOL_DESKTOP_POC_EXISTS
CACHE_TO_SOURCE_PROMOTION
HISTORICAL_COUNT_TO_GREEN
SCREENSHOT_TO_RUNTIME_PASS
DUPLICATE_OWNER_FOR_SAME_CAPABILITY
```

## 10. Continuidade da missão

Este delta não substitui o ledger anterior. Ele se encaixa nele:

```text
SESSION_LEDGER=.agents/skills/centraldark-operational-method/references/2026-09-02-session-hud-garimpo-mcp-reconciliation.md
PACKAGE_LEDGER=.agents/skills/centraldark-operational-method/references/PACKAGE-INGEST-LEDGER.md
FIXED_POINT_OWNER=apps/modulos/fixed-point-fabric/
DESKTOP_OWNER=apps/modulos/Bolt/source/
SCREENPIPE_PROBE_OWNER=apps/modulos/fixed-point-fabric/src/centraldark_fixed_point/probes/screenpipe.py
```

Nada fica para trás: material histórico continua candidato útil, mas só o que reconcilia com owner/consumer atual e sobrevive à contraprova vira estado promovível.

## 11. Próximo cursor objetivo

```text
REMEASURE_NEW_PR_HEAD
→ CI/status/workflow SAME HEAD
→ INVENTORY_CURRENT_TARGET_READ_ONLY
→ PROVE_CURRENT_DENOMINATOR
→ CLASSIFY + DEDUPE
→ MAP CAPABILITIES TO EXISTING OWNERS
→ TEST EXISTING BRIDGE/PROBES
→ COUNTERPROOF
→ T1
→ UPDATE HUD WITH MEASURED DENOMINATORS ONLY
→ FIXED_POINT OR EXACT BLOCKER
```

O verde existente é preservado. A frente nova só acrescenta informação quando a realidade produzir delta mensurável.