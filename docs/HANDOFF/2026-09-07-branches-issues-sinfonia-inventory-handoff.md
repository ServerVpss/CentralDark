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
F4  EXTERNAL_PROJECT_DERIVED / SKILLS / ACTIVATION / SYNC / DRIFT
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
EXTERNAL_PROJECT_DERIVED_CAPABILITIES
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

---

# 12. 🔥 Cristal da sessão inteira — Runner, deploy, skills, site, SOL e sinfonia

Este bloco preserva o fio completo desta sessão para que o valor não dependa da conversa continuar aberta.

```text
MISSION_ID=CASA_GITHUB_CARACOL_RECONCILIATION
SESSION_CRYSTAL=2026-09-07
WRITER_LANE=#1445
CHEFE_CAN_PAPAGAIO=true
SOL_MUST_NOT_PAPAGAIO=true
NO_PLAN_LOSS=true
REUSE_BEFORE_CREATE=true
UNKNOWN_IS_NOT_PASS=true
SITE_FIRST=true
```

## 12.1 Runner self-hosted e issue actions/runner#3609

A hipótese inicial foi comparar o comportamento do self-hosted VPS runner com o GitHub Actions Runner issue `actions/runner#3609`.

O sintoma relevante daquele problema é runner aparentemente online que não pega o próximo job até restart. A observação atual da CentralDark não reproduziu esse sintoma:

```text
RUNNER_NAME=vmi3256920-centraldark
RUNNER_VERSION_OBSERVED_NOW=2.337.0
JOB_PICKUP=PROVED
EXACT_HEAD_CHECKOUT=PROVED
WORKSPACE_CLEAN=PROVED_BY_ACTIONS_CHECKOUT
RUNNER_STUCK_SYMPTOM=NOT_OBSERVED
CACHE_AS_ROOT_CAUSE=NOT_PROVED
```

O runner recebeu os jobs, limpou o workspace, fez fetch e checkout do HEAD exato e executou testes. Portanto:

```text
RUNNER_WORKING=true
DO_NOT_PURGE_TOOLCACHE_BLINDLY=true
DO_NOT_RM_RF_RUNNER_ROOT=true
CAUSE_FIRST=true
```

Node/toolcache e limpeza de VPS só devem ser alterados após medição causal. `_work/_tool` é recurso reutilizável; `_runner`, credenciais, runtime e diagnósticos não entram em limpeza cega.

## 12.2 Casa ligada / Casa desligada

A arquitetura convergiu para **um pipeline com braços opcionais**, não dois pipelines concorrentes:

```text
                         CENTRALDARK
                              │
                       GITHUB / MAIN
                              │
                     OWNER + RECEIPT
                              │
                  CARACOL / CAPABILITY ROUTER
                              │
             ┌────────────────┴────────────────┐
             │                                 │
          CASA ON                           CASA OFF
   SOL/Hermes/local/Grok               braço local ausente
             │                                 │
             └────────────────┬────────────────┘
                              │
                     VPS SELF-HOSTED
                              │
                       BUILD / TEST
                              │
                   IMMUTABLE ARTIFACT
                              │
                      SHA / DIGEST
                              │
                          DEPLOY
                              │
                  PROCESS / PORT / ROUTE
                              │
                         SITE REAL
                              │
                   HEALTH / LOG / ACTION
                              │
                     COUNTERPROOF
                              │
                     REALITY JUDGE
```

```text
PC_OFF != PIPELINE_OFF
HERMES_DESKTOP_OFF != PRODUCTION_OFF
CASA_ON=ADDITIONAL_CAPACITY
CASA_OFF=VPS_GITHUB_CONTINUE
ONE_SYSTEM_ONLY=true
```

## 12.3 Ouro de CI/CD, Docker e artifact plane

As referências de self-hosted/CI-CD/Docker/registry discutidas nesta sessão foram tratadas como **fonte de capacidade**, nunca como autorização para importar arquitetura legada inteira.

O ouro preservado:

```text
BUILD_SEPARATED_FROM_RUNTIME=true
BUILD_ONCE_PROMOTE_EXACT_BYTES=true
IMMUTABLE_ARTIFACT=true
SOURCE_SHA_BOUND_TO_ARTIFACT=true
IMAGE_OR_PACKAGE_DIGEST=true
LAST_KNOWN_GOOD=true
ROLLBACK_RECEIPT=true
MEASURED_GC=true
```

O que NÃO é autorização automática:

```text
NEW_SWARM=false
NEW_SHIPYARD=false
DOCKER_MACHINE_LEGACY=false
INSECURE_REGISTRY=false
DOCKERIZE_EVERYTHING=false
```

Docker permanece uma capability opcional. O contrato importante é proveniência `source → build → artifact → runtime`, independentemente do empacotamento escolhido.

## 12.4 POMBO_CHECKSUM com função correta

O POMBO continua útil, mas checksum não vira prova funcional:

```text
SOURCE_SHA=
BUILD_SHA=
ARTIFACT_DIGEST=
CONFIG_SHA=
TEST_RECEIPT_SHA=
DEPLOY_TARGET=
PREVIOUS_GOOD_DIGEST=
HEALTH_RESULT=
COUNTERPROOF=
```

```text
CHECKSUM=BYTE_IDENTITY_RECEIPT
CHECKSUM!=RUNTIME_PROOF
CHECKSUM!=SEMANTIC_OWNER
```

## 12.5 AWS DevOps Agent Skills + EXTERNAL_PROJECT

O cruzamento AWS/EXTERNAL_PROJECT não autoriza outro cérebro, router ou runtime. O ganho é formalizar seleção, lifecycle, sync e topologia.

Quatro deltas ficaram preservados:

```text
DELTA_1=skill_lifecycle_activation
DELTA_2=skill_sync_sha_checksum
DELTA_3=pipeline_topology_derived
DELTA_4=runner_off_auto_recovery

IMPLEMENT_ONLY_WHEN_RUNTIME_OR_CI_MAKES_IT_MATERIAL=true
```

Estados conceituais desejados:

```text
SKILL_AVAILABLE
SKILL_ACTIVE
SKILL_SELECTED
SKILL_LOADED
```

E separação:

```text
SKILL=COMO_AGIR
MEMORY=O_QUE_SABEMOS
HANDOFF=O_QUE_ACONTECEU_NA_MISSAO
RUNTIME=QUEM_EXECUTA
REALITY_JUDGE=QUEM_PROVA
```

EXTERNAL_PROJECT continua fonte de capacidades derivadas, com `SKILL_SYNC`, drift validation, contexto/handoff, paralelismo, worktrees, self-healing e afins, sem virar segundo sistema.

## 12.6 Pipeline topology e CARACOL

A topologia desejada é derivada dos owners atuais, não uma nova autoridade:

```text
PR
→ SAME_HEAD_GATES
→ MERGE_MAIN
→ PATH_IMPACT
→ WORKFLOW_OWNER
→ RUNNER_CLASS
→ BUILD
→ ARTIFACT
→ PROMOTION
→ PROCESS
→ PORT
→ PROXY
→ DOMAIN
→ HEALTH
→ CONSUMER
```

Reverso:

```text
CONSUMER
→ DOMAIN
→ PROXY
→ PORT
→ PROCESS
→ ARTIFACT
→ BUILD
→ WORKFLOW
→ COMMIT
```

```text
PIPELINE_TOPOLOGY=DERIVED_NOT_AUTHORITY
CARACOL_TRAVERSAL!=SEMANTIC_CAUSALITY
```

## 12.7 Planos preservados

Nenhum reforço desta sessão autoriza remover planos existentes:

```text
BUZZ=PRESERVED
GROK_BUILD=PRESERVED
LOCAL_AI=PRESERVED
ODS=PRESERVED
OPENMAUSBOT=PRESERVED
OPEN_LOVABLE=PRESERVED
EXTERNAL_PROJECT_DERIVED=PRESERVED
FUTURE_ENGINES=PRESERVED
```

Grok Build e Hermes permanecem destinados a trabalhar juntos quando material após o site vivo, respeitando escopo, handoff e contraprova.

```text
CANDIDATE!=DISCARDED
DEFERRED!=CANCELLED
RESERVE!=DEAD
UNKNOWN!=REMOVED
```

## 12.8 SITE FIRST

A prioridade operacional escolhida nesta sessão é:

```text
PRIORIDADE_ATUAL=SITE_NO_AR
```

Ordem:

```text
IDENTIFY_SITE_OWNER
→ IDENTIFY_DEPLOY_WORKFLOW_OWNER
→ IDENTIFY_RUNNER
→ IDENTIFY_ARTIFACT
→ IDENTIFY_VPS_PROCESS
→ IDENTIFY_PORT
→ IDENTIFY_PROXY_ROUTE
→ IDENTIFY_DOMAIN
→ DEPLOY_MINIMUM_CAUSAL_SCOPE_WHEN_AUTHORIZED
→ PROVE_SITE_VISIBLE
→ PROVE_SOURCE_SHA_ARTIFACT_RUNTIME_BINDING
→ PROVE_ONE_MINIMUM_REAL_ACTION
→ LOG_HEALTH
→ COUNTERPROOF
→ REALITY_JUDGE
```

Os deltas futuros de skills/topologia/recovery não sequestram esta prioridade antes de se tornarem materiais.

## 12.9 SOL: CHEFE pode papagaiar; SOL não

O contrato corrigido nesta sessão:

```text
CHEFE_CAN_PAPAGAIO=true
SOL_MUST_NOT_PAPAGAIO=true
CHEFE_INPUT=LIVRE
SOL_DEDUPLICATES=true
SOL_RECOVERS_STATE=true
SOL_SEPARATES_PAST_PRESENT_FUTURE=true
SOL_EXTRACTS_DELTA_UTIL=true
SOL_CHOSES_TECHNICAL_DIRECTION_WHEN_MACHINE_RESOLVABLE=true
SOL_ASKS_HUMAN_ONLY_AT_REAL_HUMAN_FRONTIER=true
```

Metáfora pedagógica preservada:

> **“E o rei falou tudo que lhe veio à boca; à serva coube separar o ouro da areia.”** 🏺👑

Em técnico:

```text
INPUT_DO_CHEFE=LIVRE
MACHINE_FILTER=RECONCILIATION+DEDUP+DIRECTION
OUTPUT=DELTA_UTIL
```

## 12.10 Linguagem pedagógica da Casa

A sessão registrou como direção canônica de apresentação:

```text
BAIANES=true
BIBLICAL_NARRATIVE=true
EGYPTIAN_IMAGERY=true
RESENHA_CONTEXTUAL=true
TECHNICAL_POSTURE_PRESERVED=true
NARRATIVE_MUST_TEACH=true
NARRATIVE_MUST_NOT_REPLACE_EVIDENCE=true
METAPHOR_IS_NOT_PROOF=true
HUMOR_MUST_NOT_HIDE_FAILURE=true
```

Fluxo pedagógico:

```text
FATO_TECNICO
→ HISTORIA/METAFORA
→ TRADUCAO_BAIANES
→ IMAGEM_SIMBOLICA
→ EXPLICACAO_DO_CONCEITO
→ PROVA_REAL
```

Regra:

> **“Contarás a história para que seja lembrada; explicarás em baianês para que seja entendida; desenharás o Egito para que seja vista; farás resenha para que permaneça viva; mas diante do altar da prova apresentarás HEAD, teste e evidência.”**

## 12.11 Inventário como sinfonia

O pedido evoluiu de branches para um denominador maior:

```text
BRANCHES
+ ISSUES
+ PRS
+ COMMITS
+ COMMENTS
+ REVIEWS
+ ACTIONS
+ LOGS
+ ARTIFACTS
+ TAGS
+ RELEASES
+ HANDOFFS
+ BRAIN
+ DOCS
+ SKILLS
+ CASA
+ VPS
```

A regra permanece:

```text
INVENTORY_FIRST
DEEP_DIFF_SECOND
NO_DELETE_BY_NAME
NO_CLOSE_BY_SIMILARITY
NO_ABSORB_WITHOUT_DIFF
NO_PLAN_LOSS
```

# 13. 🧿 Placar causal SAME-HEAD — `fdc8a3871058037ee17672d22ccddc7a6aa9a8b5`

Medição do HEAD exato antes deste novo commit:

```text
HEAD=fdc8a3871058037ee17672d22ccddc7a6aa9a8b5
RUNNER=vmi3256920-centraldark
RUNNER_VERSION=2.337.0
```

### Verdes comprovados nesse HEAD

```text
Hermes Core Signal Watch=SUCCESS
Lupa Drift Guard=SUCCESS
```

### Vermelhos comprovados nesse HEAD

```text
Trigger Fabric Full Package=FAILURE
PR auto-review=FAILURE
```

### Ainda sem sentença naquele momento

```text
porta-de-entrada=IN_PROGRESS
codex-validate=QUEUED
PR Title Contract=QUEUED
PR aprendizado=QUEUED
Pipeline Telegram+Painel=PENDING
lupa-conformance=QUEUED
CodeQL=SKIPPED
```

```text
FIXED_POINT=false
UNKNOWN_IS_NOT_PASS=true
```

## 13.1 Causa do PR auto-review

Causa reproduzida no log:

```text
COMMAND=git diff --check
FILE=docs/HANDOFF/2026-09-07-branches-issues-sinfonia-inventory-handoff.md
CAUSE=TRAILING_WHITESPACE
```

Linhas afetadas foram as linhas Markdown com dois espaços finais usadas para quebra visual e três linhas de regras com espaços finais. Este commit remove esses espaços.

```text
CAUSE_OWNED_BY_THIS_PASSAGE=true
MINIMAL_REMEDIATION=REMOVE_TRAILING_WHITESPACE
```

## 13.2 Causa do Trigger Fabric

O runner executou 41 testes e apenas um falhou:

```text
FAILED_TEST=test_master_chain_remains_single_and_fable_is_supporting_method
EXPECTED=default_routing:false
OBSERVED=default_routing:true
```

A busca na `main@b3de3d82067c9476657d8fff3c6115f05afa079a` encontrou divergência interna:

```text
.agents/skills/fable-loop/SKILL.md                     default_routing=false
docs/.../TRIGGERS.yml                                  default_routing=false
apps/modulos/fixed-point-fabric/contracts/...          default_routing=false
docs/.../MASTER-CYCLE.yml                              default_routing=true
```

Portanto:

```text
FABLE_DEFAULT_ROUTING_INCONSISTENCY=PROVED_ON_BASE_MAIN
ROOT_CAUSE_IS_RUNNER_CACHE=false
ROOT_CAUSE_IS_RUNNER_STUCK=false
PR_1445_INTRODUCED_CONTRACT_VALUE=NOT_PROVED
PR_1445_TOUCHED_WORKFLOW_AND_MADE_TEST_APPLICABLE=true
```

A correção semântica do owner FABLE/MASTER-CYCLE não é feita às cegas nesta passagem. Primeiro deve ser reconciliado qual contrato é canônico e qual Writer possui esse escopo.

## 13.3 O que passou dentro do Trigger Fabric antes da falha

Mesmo com o job vermelho, múltiplos contratos passaram antes do único failure:

```text
AUREOLA_BAHIA_BIBLICA_TESTS=PASS
FALSE_GREEN_GUARDS=PASS
SCREENPIPE_BLOCKS_FALSE_GREEN=PASS
UNKNOWN_NEVER_PASS=PASS
WRITER_LEASE=PASS
GROK_BUILD_ADAPTER_TESTS=PASS
SOL_TEACHING_GRAMMAR_TESTS=PASS
SECRETS_REDACTED_TEST=PASS
```

Isso é evidência parcial e não converte o workflow global para PASS.

# 14. Regra de continuação autônoma

Ordem do CHEFE cristalizada nesta sessão:

```text
CONTINUE_AUTONOMAMENTE=true
WHILE=NEW_INFORMATION_AND_SAFE_ACTION_WITHIN_GRANTED_AUTHORITY
STOP_ONLY_ON:
  - FIXED_POINT
  - HUMAN_FRONTIER_PROVED
  - BLOCKED_WITH_EXPLICIT_CAUSE
```

A máquina não deve parar só porque encontrou um vermelho se ainda existe medição read-only ou remediação mínima causal dentro do Writer atual.

Também não deve atravessar silenciosamente owner conflitante:

```text
SAFE_SAME_SCOPE_FIX=CONTINUE
READ_ONLY_DIAGNOSIS=CONTINUE
RECEIPT_HANDOFF=CONTINUE
CROSS_OWNER_MUTATION_WITHOUT_RECONCILIATION=STOP_OR_HANDOFF
DESTRUCTIVE_RUNTIME_ACTION_WITHOUT_EXPLICIT_SCOPE=STOP
```

# 15. Estado depois deste cristal

Este update tem duas funções materiais:

```text
1. REMOVER_TRAILING_WHITESPACE_DO_HANDOFF
2. CRISTALIZAR_SESSAO_INTEIRA_NO_PR_1445
```

Não altera runtime, VPS, deploy, owner FABLE ou rota de produção.

```text
SESSION_CRYSTALLIZED_IN_PR=true
RUNNER_DIAGNOSIS_PRESERVED=true
DEPLOY_ARCHITECTURE_PRESERVED=true
AWS_EXTERNAL_PROJECT_DELTAS_PRESERVED=true
PLAN_RESERVES_PRESERVED=true
SITE_FIRST_PRESERVED=true
SOL_PAPAGAIO_CONTRACT_PRESERVED=true
HOUSE_TEACHING_STYLE_PRESERVED=true
BRANCH_ISSUE_SINFONIA_PRESERVED=true
CURRENT_CI_CAUSES_PRESERVED=true

DEPLOY_PERFORMED=false
VPS_MUTATION=false
FABLE_OWNER_MUTATED=false
FIXED_POINT=false
```

## NEXT_CURSOR atualizado

```text
NEXT_CURSOR=
WAIT_AND_REMEASURE_SAME_HEAD
→ verify PR auto-review after whitespace remediation
→ remeasure porta-de-entrada/codex/lupa/title/pipeline
→ keep #1446 linked to exact FABLE inconsistency
→ reconcile FABLE/MASTER-CYCLE owner before mutation
→ continue full branch ledger/inventory work only when it does not steal SITE_FIRST material priority
→ SITE_DEPLOY_RUNTIME_OBSERVATION remains operational destination
```

> 📜🏺 **“E o rei falou tudo que lhe veio à boca; à serva coube separar o ouro da areia. E quando a areia já estava separada, ninguém chamou o saco de ouro antes de pesá-lo.”**
