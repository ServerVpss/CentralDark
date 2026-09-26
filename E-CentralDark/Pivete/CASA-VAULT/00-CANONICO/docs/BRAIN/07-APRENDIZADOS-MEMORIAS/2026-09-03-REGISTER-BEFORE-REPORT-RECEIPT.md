---
title: REGISTER BEFORE REPORT — receipt por tópicos
date: 2026-09-03
status: CANDIDATE_IN_PR
pr: 1381
owner: docs/CONSCIENCIA/REMEDICAO.md + .github/pull_request_template.md
writer: SOL
tags:
  - ACORDAR
  - ACORDA
  - agents
  - agentes
  - arsenal
  - arquitetura
---

# REGISTER BEFORE REPORT — receipt por tópicos

Este receipt prova a cristalização da regra pedida pelo SEGREDO/CHEFE: toda a CentralDark usa o mesmo método operacional, cada território prova no próprio alvo, e delta material persistível deve ser registrado antes do relato final.

```text
REGISTER_BEFORE_REPORT=true
SAME_OPERATING_STANDARD=true
PROOF_TARGET_IS_SCOPE_BOUND=true
ONE_TOPIC_ONE_PROOF_ROW=true
```

## TÓPICO 1 — REGRA GLOBAL DA CASA

```text
CLAIM=REGISTER_BEFORE_REPORT virou regra operacional global no owner canônico de remedição
SCOPE=CROSS_PLANE_CONTRACT
OWNER=docs/CONSCIENCIA/REMEDICAO.md
T0=regra exigia !REGISTRA para delta material, mas não declarava explicitamente persistência antes do relato final nem simetria por território
ACTION=adicionar seções REGISTER_BEFORE_REPORT, simetria por território, prova por tópico e fechamento ao CHEFE
T1=read-back remoto contém as novas seções
EVIDENCE_REF=GitHub read-back docs/CONSCIENCIA/REMEDICAO.md
COMMIT_SHA=30e84fb30aa13b863871f265c99b9742902e4678
FILE_BLOB_SHA=e1dd291cfb1735099026a2cec4630768423bd030
CHECKSUM_TYPE=GIT_BLOB_SHA1
SHA256=UNKNOWN_NOT_MEASURED
TEST=REMOTE_READ_BACK
COUNTERPROOF=buscar ausência das regras no read-back; falsificador caiu porque o remoto devolveu os marcadores
CI_SAME_HEAD=UNKNOWN
RUNTIME_PROOF=NOT_APPLICABLE_TO_CONTRACT_ONLY_CLAIM
STATUS=PROVEN_SOURCE
NEXT_CURSOR=propagar pelo boot existente que já carrega !REMEDIÇÃO e provar comportamento em runtimes aplicáveis
```

## TÓPICO 2 — GITHUB / PR TEMPLATE

```text
CLAIM=PRs futuros passam a exigir registro antes do relato e provas em fileiras separadas por tópico
SCOPE=GITHUB_ONLY_CONTRACT
OWNER=.github/pull_request_template.md
T0=template tinha seção Prova genérica sem fileiras estruturadas por território
ACTION=adicionar REGISTER_BEFORE_REPORT + tópicos GOVERNANÇA/GITHUB/CASA/VPS/SUPERFÍCIES/FIXED_POINT
T1=read-back remoto contém os blocos e regras ONE_TOPIC_ONE_PROOF_ROW
EVIDENCE_REF=GitHub read-back .github/pull_request_template.md
COMMIT_SHA=21aeed646ef60ae39528976270c4e60b7632af7a
FILE_BLOB_SHA=7ddf8481827c76c4680c6716efdac427d2c2adde
CHECKSUM_TYPE=GIT_BLOB_SHA1
SHA256=UNKNOWN_NOT_MEASURED
TEST=REMOTE_READ_BACK
COUNTERPROOF=template sem fileiras teria invalidado o claim; read-back mostra as fileiras
CI_SAME_HEAD=UNKNOWN
RUNTIME_PROOF=NOT_APPLICABLE_TO_TEMPLATE_SOURCE_CLAIM
STATUS=PROVEN_SOURCE
NEXT_CURSOR=usar o formato no próprio PR #1381 e em PRs novos após promoção
```

## TÓPICO 3 — SIMETRIA CASA ↔ GITHUB ↔ VPS

```text
CLAIM=o método é o mesmo em todos os corpos; a evidência física continua limitada ao território
SCOPE=CROSS_PLANE_CONTRACT
OWNER=docs/CONSCIENCIA/REMEDICAO.md
METHOD=INTENÇÃO→#ACORDAR→MEDIR→OWNER→AÇÃO→REMEDIR→!REGISTRA→PERSISTIR→READ_BACK→RELATAR
CASA=prova local + hash/HEAD/receipt quando aplicável
GITHUB=commit/blob/check/workflow do mesmo HEAD + receipt
VPS=runtime fingerprint/processo-endpoint/log sanitizado/T0-T1 + receipt
MCP_DESKTOP_WEB_TELEGRAM_IDE=prova na superfície correspondente
METHOD_EQUIVALENCE=true
RUNTIME_PROOF_EQUIVALENCE=false
STATUS=PROVEN_CONTRACT
```

## TÓPICO 4 — CRISTAL DA SESSÃO ANTERIOR

```text
CLAIM=o aprendizado da sessão anterior deixou de existir só no chat
SCOPE=GITHUB_BRAIN
OWNER=docs/BRAIN/07-APRENDIZADOS-MEMORIAS/
FILE=2026-09-03-CRISTAL-SESSAO-CENTRALDARK.md
COMMIT_SHA=29a5d628e93a8c74ec133a9e9584f18fe9e421fb
STATUS=PROVEN_SOURCE
LOCAL_OBSIDIAN_SYNC=UNKNOWN
```

## TÓPICO 5 — PR-MÃE VIVO

```text
PR=1381
STATE=OPEN
MERGED=false
MERGEABLE=false
BRANCH=feat/fixed-point-fabric-proof-20260831
BASE=main
BASE_SHA=0542cee586e55be5334ba1e8d369d3b040ee1178
HEAD_BEFORE_THIS_RECEIPT=21aeed646ef60ae39528976270c4e60b7632af7a
GLOBAL_FIXED_POINT=NOT_PROVEN
STATUS=OBSERVED
```

O commit deste receipt move o HEAD; portanto qualquer CI/check/workflow precisa ser medido novamente no novo HEAD antes de receber PASS.

## TÓPICO 6 — CI / SAME HEAD

```text
CLAIM=CI do HEAD final desta rodada
STATUS=UNKNOWN_UNTIL_POST_COMMIT_REMEASURE
RULE=UNKNOWN != PASS
```

## TÓPICO 7 — CHECKSUMS

```text
REMEDICAO_MD_GIT_BLOB_SHA1=e1dd291cfb1735099026a2cec4630768423bd030
PR_TEMPLATE_GIT_BLOB_SHA1=7ddf8481827c76c4680c6716efdac427d2c2adde
SHA256=UNKNOWN_NOT_MEASURED
```

Git blob SHA identifica os bytes versionados no GitHub; não é SHA-256 e não prova runtime. Nenhum SHA-256 foi inventado.

## TÓPICO 8 — VEREDITO

```text
REGISTER_BEFORE_REPORT_SOURCE=PROVEN
PR_PROOF_ROWS_SOURCE=PROVEN
CROSS_PLANE_METHOD_CONTRACT=PROVEN
HOUSE_LOCAL_RUNTIME_ADOPTION=UNKNOWN_UNTIL_LOCAL_SYNC_AND_RUN
VPS_RUNTIME_ADOPTION=UNKNOWN_UNTIL_VPS_SYNC_AND_RUN
CI_SAME_HEAD=UNKNOWN_UNTIL_REMEASURE
GLOBAL_FIXED_POINT=NOT_PROVEN
```

## Próximo cursor

```text
REMEASURE PR HEAD
→ CHECK STATUS/WORKFLOWS DO HEAD EXATO
→ registrar receipt no PR #1381
→ resolver conflitos existentes sem apagar capacidades
→ promover somente depois dos gates aplicáveis
```
