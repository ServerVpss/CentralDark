# !CENTRALDARK — GARIMPO CHEFE · PR/MAIN · DELTA CONTÍNUO

OBSERVED_AT=2026-09-08T16:14:00-03:00
SCOPE=GITHUB_PR_MAIN_RECEIPT
SOURCE_OF_TRUTH=ServerVpss/CentralDark
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
UNKNOWN_IS_NOT_PASS=true

## Intenção

Persistir somente o delta útil fresco observado no GitHub, sem copiar todo o histórico, sem promover PR aberto a PASS e sem transformar evidência local visual em prova remota.

## Estado vivo medido

```text
MAIN_HEAD=58b7d6c44b1175891c4a97e3c57a54464375c901
MAIN_LAST_MERGE=#1461
MAIN_LAST_DELTA=autoprefixer 10.5.4 -> 10.5.5
```

O estado acima é GitHub/main observado no instante deste receipt. Mudança posterior exige nova medição.

## PRs ativos materiais ao escopo

```text
#1463 OPEN MERGEABLE=true DRAFT=false
  ROLE=PR_TRILHO_GOVERNANCA_CONTINUIDADE
  HEAD=969ab7e144ce147df59667f71abb5a24263979df
  DELTA_FRESCO=preanswer GitHub gate + handoff bruto + label gate model-neutral + PR trilho vivo
  STATUS=CANDIDATE_NOT_MAIN

#1462 OPEN MERGEABLE=true DRAFT=false
  ROLE=CI_JUIZ_PORTA
  HEAD=0f2d5394ba201d6199df35919022fcbf44c82626
  DELTA_FRESCO=SEM_BASE para null OID + redução de cron/ruído
  STATUS=CANDIDATE_NOT_MAIN

#1458 OPEN MERGEABLE=true DRAFT=false
  ROLE=PROVIDER_ACCESS_LEASE
  HEAD=3bff05b02e1af98a48d632648816aabaeecb4201
  STATUS=CANDIDATE_NOT_MAIN

#1456 OPEN MERGEABLE=true DRAFT=true
  ROLE=MEMORY_GIT_PUSH_FAIL_CLOSED
  HEAD=f0bc63c03046ccd045308a990f67d884cb696c9a
  STATUS=HUMAN_HOLD_DRAFT

#1455 OPEN MERGEABLE=true DRAFT=true
  ROLE=PAINEL_GIT_PUSH_FAIL_CLOSED
  HEAD=a815777b69c3ab947db4eb72dc5a84c18dd271e6
  STATUS=HUMAN_HOLD_DRAFT

#1454 OPEN MERGEABLE=true DRAFT=false
  ROLE=HORN_LOGIC_PROOF_LIBRARY
  HEAD=75ad05f90d1292bb7a287e66c8c0779d092189fb
  STATUS=CANDIDATE_NOT_MAIN

#1447 OPEN MERGEABLE=true DRAFT=false
  ROLE=MULTI_CANETAS_HANDOFF_JUIZ_FINAL
  HEAD=a26de185180255be1ddcafb5a2ec16d511998ca2
  STATUS=CANDIDATE_NOT_MAIN

#1444 OPEN MERGEABLE=true DRAFT=false
  ROLE=PR_MAE_RENDEZVOUS
  HEAD=0a69e83fb8ea1fcad670b77e9d59c3c4f6805372
  STATUS=UMBRELLA_ACTIVE

#1378 OPEN MERGEABLE=true DRAFT=false
  ROLE=CI_EXTERNAL_SOURCE_SANITIZE
  HEAD=de6a43e1bb1dd4154f609c034ff09dd0f8fd4a2a
  STATUS=CANDIDATE_NOT_MAIN
```

## Delta útil fresco

1. A `main` avançou por #1461; portanto receipts que fixavam SHA anterior são históricos.
2. #1463 virou o trilho mais novo de governança/continuidade e já declara explicitamente que labels de agente são proveniência, não gate de promoção.
3. #1444 segue como rendezvous/índice vivo, não como PR gigante de código.
4. #1455 e #1456 continuam em draft com HOLD humano explícito; não promover automaticamente.
5. `DELTA-CONTINUO.md` já é owner canônico para continuidade. Este arquivo é receipt temporal, não novo owner.
6. A imagem local compartilhada pelo CHEFE mostra `E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE` com diversos HTMLs de sessões/artefatos. Isso prova apenas a existência visual dessa coleção local naquele instante; conteúdo, checksum, absorção no repo e atualidade de cada HTML permanecem UNKNOWN até medição local autorizada.

## Regra de absorção

```text
PR_OPEN != MAIN
MERGEABLE != PASS
DRAFT=false != READY
SCREENSHOT != RUNTIME_PROOF
HISTORY != CURRENT
LOCAL_HTML_COLLECTION != GITHUB_LINEAGE

NOVO_MATERIAL
→ DEDUPE
→ OWNER_EXISTENTE
→ CLASSIFY
→ ABSORB_ONLY_USEFUL_DELTA
→ RECEIPT
→ NEXT_CURSOR
```

## Classificação do garimpo atual

```text
CURRENT_MAIN=#1461
ACTIVE_UMBRELLA=#1444
LATEST_GOVERNANCE_TRACK=#1463
HUMAN_HOLD=#1455,#1456
OPEN_CANDIDATES=#1378,#1447,#1454,#1458,#1462,#1463
LOCAL_GARIMPO_HTML=EVIDENCE_CANDIDATE_ONLY
```

## Contraprova

- Este receipt não declara CI same-head verde para os PRs abertos.
- Este receipt não declara merge dos PRs abertos.
- Este receipt não declara deploy, VPS, site, MCP, Casa ou runtime como provados.
- Este receipt não copia nem ingere o conteúdo dos HTMLs locais.
- Este receipt não substitui `DELTA-CONTINUO.md` nem o PR-mãe #1444.

## NEXT_CURSOR

```text
REMEASURE_MAIN
→ REMEASURE_ACTIVE_PR_HEADS
→ SAME_HEAD_CI_PER_PR
→ DEDUPE_AGAINST_MAIN
→ ABSORB_ONLY_SURVIVING_DELTA
→ RETURN_RECEIPT_TO_#1444
→ REALITY_JUDGE
```

STATUS=PERSISTED_RECEIPT
FIXED_POINT=FALSE
