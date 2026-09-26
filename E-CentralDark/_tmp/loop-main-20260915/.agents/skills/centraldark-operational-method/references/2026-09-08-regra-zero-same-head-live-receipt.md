# REGRA_ZERO_SAME_HEAD_LIVE_RECEIPT

owner: `.agents/skills/centraldark-operational-method/SKILL.md`
refs: `#1463`, `#1444`, `#1454`
status: `LIVE_RECEIPT`
writer: `SOL`
created_at: `2026-09-08T11:04:00-03:00`

## 0_INTENCAO

Registrar no proprio PR #1463 que a Regra Zero foi medida antes da resposta operacional e que houve drift de HEAD durante a sessao.

```text
REQUEST=#acordar faça comit
ACTION=commit_receipt_on_pr_branch
MAIN_TOUCH=false
MERGE=false
DEPLOY=false
```

## 1_ESTADO_MEDIDO

```text
PR=1463
STATE=open
MERGED=false
DRAFT=false
MERGEABLE=true
BASE=main
BASE_SHA=ad4ed0ac76cb2361b005684c9c1323876a5174a5
HEAD_BRANCH=sol/preanswer-github-gate-20260908
HEAD_OBSERVED_FROM_USER=d1161c16faf2eb6d05789ee26cbd0fa9f51ce37a
HEAD_LIVE_AFTER_REMEASURE=a82438e0b56cdabaae71938a6f690a5d919d779b
COMMITS_LIVE=24
FILES_CHANGED_LIVE=18
```

## 2_DRIFT_OBSERVADO

```text
USER_REPORTED_HEAD=d1161c16faf2eb6d05789ee26cbd0fa9f51ce37a
GITHUB_REMEASURED_HEAD=a82438e0b56cdabaae71938a6f690a5d919d779b
HEAD_DRIFT=true
```

A resposta nao pode tratar o HEAD antigo como atual depois da remedicao. O cursor passa a ser o novo HEAD produzido por este commit.

## 3_CI_SAME_HEAD

```text
WORKFLOW_RUNS_ON_A824=18
OBSERVED_STATUSES=queued_or_pending
SAME_HEAD_CI=IN_PROGRESS_OR_QUEUED
FIXED_POINT=false
UNKNOWN_IS_NOT_PASS=true
```

## 4_VEREDITO

```text
PROVADO:
  - PR existe e esta aberto.
  - PR nao esta mergeado.
  - PR nao e draft.
  - GitHub informou mergeable=true na remedicao.
  - Branch recebeu medicao viva e receipt.

QUEBRADO:
  - Nenhum fail causal de CI foi medido nesta rodada.

EVIDENCIA_FALTANTE:
  - conclusao dos workflows no HEAD novo;
  - logs de job se algum workflow falhar;
  - aprovacao de merge depois de CI same-head.

NEXT_CURSOR:
  - medir workflows do HEAD gerado por este commit.
```

## 5_REGRA_ZERO

```text
DOCUMENTED != EXECUTED
ACTION != PROOF
UNKNOWN != PASS
MERGED != DEPLOYED
HISTORY_IS_NOT_CURRENT_STATE
SAME_HEAD_REQUIRED=true
```

Este arquivo e receipt operacional. Nao declara runtime, deploy, site, VPS ou Casa como provados.
