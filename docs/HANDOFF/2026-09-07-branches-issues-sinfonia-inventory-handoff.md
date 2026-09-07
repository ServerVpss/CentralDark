# 🏺📦 Sinfonia de inventário — branches + Issues + fontes de ouro

**Data:** 2026-09-07  
**PR / Writer lane:** #1445 — `feat/omniroute-capability-surface-722`  
**Autoridade de intenção:** SEGREDO/CHEFE  
**Natureza:** CAMADA 1 — inventário e mapa de fontes.  
**Revisão profunda de diffs:** **AINDA NÃO EXECUTADA**.  

> 📜 “E antes de julgar os pergaminhos, o rei mandou contar todas as prateleiras; pois ouro perdido continua ouro, ainda que ninguém lembre em qual sala o deixou.”

```text
!CENTRALDARK
→ #ACORDAR
→ INVENTARIAR_TODAS_AS_FONTES
→ BRANCHES
→ ISSUES
→ PRS
→ TAGS_RELEASES
→ HANDOFFS_BRAIN_DOCS
→ ACTIONS_ARTIFACTS
→ CASA_VPS_EXTERNAL_STATE
→ CLASSIFICAR_CANDIDATOS
→ SOMENTE_DEPOIS_MEDIR_DIFFS
→ DELTA_UTIL
→ CONTRAPROVA
```

## 1. Regra desta passagem

O objetivo desta camada não é declarar que uma branch, Issue, PR ou documento contém ouro material. O objetivo é impedir que qualquer uma dessas superfícies desapareça do denominador antes da revisão profunda.

```text
EXISTS != USEFUL
OPEN != FAILURE
CLOSED != WORTHLESS
BRANCH_EXISTS != UNABSORBED_DELTA
ISSUE_EXISTS != CURRENT_CAUSE
SENTINELA_FINDING != CURRENT_FAILURE
DOCUMENTED != EXECUTED
MERGED != DEPLOYED
HISTORY != CURRENT_STATE
UNKNOWN != PASS
```

## 2. Baseline vivo medido

```text
REPO=ServerVpss/CentralDark
MAIN=b3de3d82067c9476657d8fff3c6115f05afa079a
PR_1445_HEAD_BEFORE_THIS_HANDOFF=e6f67fef0af5d455d505576eb7aa871057df5670
PR_1445_BRANCH=feat/omniroute-capability-surface-722
PR_1445_STATE=OPEN
PR_1445_MERGEABLE=true
```

## 3. Branches remotas entram no denominador

A enumeração paginada do GitHub terminou sem cursor restante e encontrou:

```text
REMOTE_BRANCHES_TOTAL=494
BRANCH_ENUMERATION_PAGES=5
DEEP_BRANCH_DIFF_REVIEW=false
```

A API de branches foi lida em páginas de 100 e expõe, para cada ref, `name`, `commit.sha` e `protected`. A listagem de nomes também foi percorrida até `cursor=null`.

**Importante:** este handoff NÃO chama a camada de branches de concluída enquanto o ledger completo `branch → tip SHA → compare(main, branch) → classificação` não estiver materializado e versionado. O snapshot de contagem e os candidatos abaixo servem como índice de continuidade, não como substituto da revisão linha a linha.

### Branches de alta sinalização já identificadas para a Camada 2

| Branch | Tip SHA observado | Família candidata | Estado nesta camada |
|---|---|---|---|
| `main` | `b3de3d82067c9476657d8fff3c6115f05afa079a` | baseline | CURRENT |
| `feat/omniroute-capability-surface-722` | `e6f67fef0af5d455d505576eb7aa871057df5670` | OmniRoute / router | WRITER #1445 |
| `feat/centraldark-omni-router-20260825` | `d607e6efbd3eb419e09cac2ac8ce3c39687e6718` | router legado/capability | DIFF_PENDING |
| `fix/abacus-via-omni-router-fabric` | `7ab8972a9cd9da82b7bb30358112a51a42f34e86` | provider/routing | DIFF_PENDING |
| `feat/capability-contract-router-20260825` | `c1e8efca79c2d9b7e2517098ee13b221fe74996a` | capability router | DIFF_PENDING |
| `feat/centraldark-capability-contract-router-20260825` | `11d035f5f13ad3d5f041224ede087dba5b467e6f` | capability router | DIFF_PENDING |
| `feat/zords-megazord-global-boot-20260829` | `40a5d188c233222eac80a30a1260a5c5be4f235b` | MEGAZORD/CARACOL | DIFF_PENDING |
| `feature/sol-miniapp-voice-poc-20260731` | `ec6b3dfe37d9d306da2bf6b80a1c9bc6fbf0038d` | SOL/voice | DIFF_PENDING |
| `fix/setup-node24-selfhosted-fast` | `2c590e6fe5d15f9cceca2d898b5ce948679c23bc` | self-hosted runner | DIFF_PENDING |
| `fix/varredura-branches-orfas` | `c95513c9d27bc1ff6394fe2c6cc35438e03ddf36` | branch archaeology | DIFF_PENDING |
| `fix/varredura-convergencia-resiliente` | `68cd68f42e2f1006b1d781bdf31f43541253272a` | convergence | DIFF_PENDING |
| `fix/varredura-runner-selfhosted` | `ddcf57b6f63b65e5a962e69aa084b42e3a53001c` | runner | DIFF_PENDING |
| `docs/trajectory-control-sinfonia-20260816` | `f7e488ea54e47ffb54dde3ab54e71c6468c3d3a8` | orchestration/sinfonia | DIFF_PENDING |
| `docs/segredo-reliquia-hud-20260816` | `0a321eaeb59bbf8a5df43731a370f2a2d13cecb4` | HUD/identity | DIFF_PENDING |
| `feat/status-badge-fabric-20260905` | `f09a0811ad1f62bd2ebd231d25bd8ee6db22baf4` | status/observability | DIFF_PENDING |
| `feat/vps-housekeeping` | `fc5934b22af10aca9a3a076955754bc3d666d37e` | VPS housekeeping | DIFF_PENDING |
| `fix/mcp-deploy-atomic-dist` | `94b44cdf4d4d839e2db79f1e4d20bc096c33e780` | deploy/artifact | DIFF_PENDING |
| `fix/mcp-deploy-safe-main-switch` | `ce88594cdf5c0218bb3206dfa66fb93cc74ae497` | deploy/git safety | DIFF_PENDING |
| `fix/mcp-deploy-status-proof` | `083a8f23d251315aeccad2a838d2b44bda7c156a` | deploy proof | DIFF_PENDING |
| `fix/sentinela-drift-github-vps-20260730` | `33907bb569467c52e3112a728038735a56315cc9` | GitHub↔VPS drift | DIFF_PENDING |

### Materialização obrigatória antes de declarar a Camada 1 completa

Para **cada uma das 494 branches**:

```text
BRANCH_NAME
TIP_SHA
PROTECTED_STATE
COMPARE_TO_CURRENT_MAIN
AHEAD_BY
BEHIND_BY
MERGE_BASE
CHANGED_FILES_COUNT
LAST_COMMIT_DATE
PR_LINEAGE_IF_ANY
CLASSIFICATION
```

Classificação mínima:

```text
SAME_AS_MAIN
ANCESTOR_OF_MAIN
AHEAD_CANDIDATE
DIVERGED_CANDIDATE
SUPERSEDED
ABSORBED
DUPLICATE
HISTORICAL_REFERENCE
ACTIVE_WRITER
UNKNOWN
```

Nenhuma branch é deletada/fechada/absorvida por nome parecido.

## 4. 😈 Issues entram no embalo da sinfonia

A pesquisa atual retornou:

```text
OPEN_ISSUES_TOTAL=91
PREVIOUS_PR1444_SNAPSHOT=90
TEMPORAL_DELTA=+1
NEWEST_OBSERVED_ISSUE=#1446
```

A diferença `90 → 91` é prova de que o inventário precisa ser temporal. A #1446 foi aberta pela Sentinela apontando workflow vermelho do **Trigger Fabric Full Package** na branch `feat/omniroute-capability-surface-722`.

Isso NÃO autoriza a inferência:

```text
ISSUE_1446_EXISTS → ROOT_CAUSE_PROVED
```

Correto:

```text
ISSUE_1446
→ SIGNAL
→ FIND_EXACT_RUN/HEAD
→ REPRODUCE
→ CAUSE
→ OWNER
→ MINIMAL_REMEDIATION
→ SAME_HEAD_RETEST
```

### Denominador atual de Issues abertas

```text
#115 #116 #119 #120 #124 #125 #127 #129 #131 #132
#133 #134 #144 #190 #195 #420 #537 #542 #564 #604
#707 #711 #722 #729 #824 #926 #975 #996 #1001 #1029
#1030 #1058 #1061 #1062 #1063 #1064 #1071 #1072 #1073 #1074
#1075 #1077 #1078 #1079 #1080 #1081 #1086 #1089 #1092 #1093
#1094 #1105 #1118 #1129 #1213 #1214 #1215 #1216 #1224 #1225
#1226 #1229 #1230 #1244 #1328 #1362 #1363 #1380 #1391 #1392
#1394 #1395 #1396 #1398 #1399 #1400 #1401 #1402 #1403 #1404
#1405 #1410 #1411 #1412 #1417 #1427 #1440 #1441 #1442 #1443
#1446
```

### Regra de classificação das Issues na Camada 2

```text
OWNER
DUPLICATE
COMPLEMENTARY
SUPERSEDED
ABSORBED
CONFLICTING
UNIQUE
STALE_SENTINELA
RUNTIME_REMEASURE_REQUIRED
HISTORY_WITH_GOLD
UNKNOWN
```

Além do corpo da Issue, a revisão deve incluir **comentários, links de PR, runs, labels, receipts e estado posterior**. Issue fechada também pode conter ouro não absorvido; portanto `state=closed` não remove a lineage histórica do denominador de pesquisa.

## 5. PRs abertos também são instrumentos separados

No instante desta medição há quatro PRs abertos:

```text
#1378 = CI / external-source sanitize lane
#1444 = umbrella/rendezvous CENTRALDARK_TERMINADA
#1445 = OmniRoute capability lane / Writer desta passagem
#1447 = multi-canetas / handoff / juiz final
```

Regra:

```text
OPEN_PR != FAILURE
PR_BODY != CURRENT_HEAD
PR_DIFF + SAME_HEAD_CHECKS + LINEAGE = REAL_INPUT
```

A Camada 2 deve medir overlap de arquivos e owner antes de mover ouro entre PRs.

## 6. Tags e Releases também entram no pacote

Foram observadas duas tags Git:

```text
obsidian-plugin-v0.4.0 → c8c77ab62e01a72022c103007410f75f2212f8e6
obsidian-plugin-v0.5.0 → 5853512f55ccb505226f5c3bd1fe5629aba030cc
```

Há releases correspondentes, incluindo assets com digest SHA-256. Releases podem conter bytes distribuídos que não estão evidentes no diff atual; por isso entram no mapa de proveniência, principalmente para Obsidian/plugin/runtime distribuído.

## 7. Mais locais de ouro que NÃO podem ficar fora

A busca profunda futura não fica limitada a branches e Issues. Denominador de superfícies:

```text
GITHUB_REMOTE
├─ main atual
├─ todas as branches vivas
├─ commits ancestrais e commits de PRs fechados
├─ PRs abertos
├─ PRs merged/closed
├─ Issues abertas
├─ Issues fechadas
├─ comentários de Issues/PRs
├─ reviews/threads
├─ workflow runs + logs
├─ workflow artifacts
├─ tags
├─ releases + assets/digests
├─ root _HANDOFF* / receipts históricos
├─ docs/HANDOFF/
├─ docs/BRAIN/07-APRENDIZADOS-MEMORIAS/
├─ docs/CONSCIENCIA/ + APRENDIZADOS
├─ docs/ARQUITETURA/
├─ .agents/skills/
├─ .claude/ / adapters de agentes
├─ .github/workflows/
├─ scripts/
└─ apps/modulos/* owners reais

CASA_LOCAL (medição separada, não inferir do GitHub)
├─ E:\CentralDark
├─ worktrees
├─ commits não publicados
├─ arquivos untracked
├─ GARIMPO-CHEFE
├─ Hermes/SOL/local runtime
├─ Obsidian/Vault permitido
└─ artefatos locais não promovidos

VPS_RUNTIME (medição separada)
├─ checkout/HEAD real
├─ self-hosted runner
├─ PM2/systemd/Docker
├─ process/port/proxy/domain
├─ deploy artifacts
├─ logs/health
└─ last-known-good / rollback receipts
```

```text
REMOTE_INVENTORY != CASA_INVENTORY
REMOTE_INVENTORY != VPS_RUNTIME
```

## 8. Famílias para priorizar na revisão profunda

A Camada 2 deve processar por família para evitar 494 leituras sem direção:

```text
F1  OMNI_ROUTER / CAPABILITY_ROUTER / PROVIDERS / FALLBACK
F2  SOL / VOICE / DESKTOP / HUMAN_FRONT_DOOR
F3  HERMES / GROK_BUILD / ENGINES / ARSENAL
F4  AIOX_DERIVED / SKILLS / ACTIVATION / SYNC / DRIFT
F5  BRAIN / OBSIDIAN / RAG / GRAPH / MEMORY
F6  CARACOL / MEGAZORD / FIXED_POINT / PROOF
F7  CI / SELF_HOSTED_RUNNER / ACTIONS / SENTINELA
F8  DEPLOY / ARTIFACT / DIGEST / VPS / ROLLBACK
F9  HUB / API / MCP / ONE_SITE / ONE_ADMIN
F10 HANDOFF / WRITER / AUTHORITY / REALITY_JUDGE
F11 BUZZ / ODS / OPENMAUSBOT / OPEN_LOVABLE / FUTURE_RESERVES
F12 SECURITY / SECRETS / GIT_SAFETY / LEGACY
```

Dentro de cada família:

```text
BRANCHES
+ ISSUES
+ PRS
+ DOCS/HANDOFFS
+ RUNTIME EVIDENCE
→ DEDUPE
→ OWNER
→ DIFF
→ DELTA_MATERIAL
```

## 9. Planos que permanecem preservados

Este inventário não remove nem reclassifica silenciosamente:

```text
BUZZ
GROK_BUILD
LOCAL_AI
ODS
OPENMAUSBOT
OPEN_LOVABLE
AIOX_DERIVED_CAPABILITIES
HERMES
SOL
OBSIDIAN
SCREENPIPE
CARACOL
MEGAZORD
FUTURE_DISCOVERED_CAPABILITIES
```

`DEFERRED != CANCELLED`  
`RESERVE != DEAD`  
`CANDIDATE != DISCARDED`  
`NOT_YET_REVIEWED != USELESS`

## 10. Estado desta entrega

```text
BRANCH_NAMES_ENUMERATED=494
BRANCH_API_PAGES_MEASURED=5
OPEN_ISSUES_MEASURED=91
OPEN_PRS_MEASURED=4
TAGS_MEASURED=2
RELEASE_SURFACE_FOUND=true
MORE_SOURCE_LOCATIONS_MAPPED=true
ISSUES_ADDED_TO_SINFONIA=true

ALL_BRANCH_SHA_ROWS_VERSIONED=false
ALL_BRANCH_DIFFS_MEASURED=false
ALL_CLOSED_ISSUES_REVIEWED=false
ALL_CLOSED_PRS_REVIEWED=false
CASA_LOCAL_INVENTORIED=false
VPS_RUNTIME_INVENTORIED=false
DEEP_REVIEW_DONE=false
FIXED_POINT=false
```

Portanto esta entrega é **handoff de inventário em progresso**, não selo de conclusão.

## 11. NEXT_CURSOR

```text
NEXT_CURSOR=
MATERIALIZE_FULL_BRANCH_LEDGER
→ for each branch: TIP_SHA + compare(main, branch)
→ classify branch families
→ join Issues by family/refs/mentioned branch/run
→ include closed PR/Issue history as gold candidates
→ inspect tags/releases/artifacts where relevant
→ identify owner collisions
→ rank UNABSORBED_GOLD candidates
→ DEEP_DIFF_REVIEW_BY_FAMILY
→ only then propose absorption/remediation
→ CONTRAPROVA
→ RECEIPT
```

### Regra final

> 📜 “Nenhum instrumento será expulso da orquestra só porque ainda não chegou sua parte; primeiro se lê a partitura inteira, depois se decide quem realmente toca.”

🏺 **Baianês:** oxente, branch, Issue, PR velho, comentário, tag e release agora entram na mesma feira. Mas ninguém vai catar tudo no grito: primeiro conta os sacos, depois abre um por um e vê onde tem ouro de verdade.
