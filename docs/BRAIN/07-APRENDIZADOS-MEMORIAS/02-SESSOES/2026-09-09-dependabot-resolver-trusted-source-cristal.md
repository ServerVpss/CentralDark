---
centraldark_note_schema: "brain07.v1"
centraldark_category: "02-SESSOES"
centraldark_kind: "CRISTAL_DE_SESSAO"
centraldark_context_owner: "SEGREDO/CHEFE"
centraldark_intent_anchor: "🧵 Cristal · Dependabot resolver trusted-source · 2026-09-09"
centraldark_agent_recall: "Recuperar a intencao, correcoes, limites e NEXT_CURSOR antes de continuar; sessao historica nao equivale ao estado atual."
centraldark_kaizen_policy: "docs/CONSCIENCIA/PROGRAMAS/KAIZEN-VIVO-INTENCAO-VIVA-20261008.md"
centraldark_kaizen_skill: ".agents/skills/kaizen-sistema-um/SKILL.md"
centraldark_kaizen_trigger: "MATERIAL_DELTA_WHEN_CONSUMED"
centraldark_kaizen_runtime: "UNKNOWN_UNTIL_CONSUMER_READBACK"
centraldark_metabolic_roles: ["yuji-identidade-e-continuidade","gojo-seis-olhos","goku-instinto-superior","kaizen-continuo"]
centraldark_metabolic_source: "apps/instinto-superior/src/components/central/MapaMetabolicoCristal.tsx"
centraldark_previous_blob_sha: "c120e68c087f51aabfd90d2354e17f382a2bfb79"
centraldark_self_catalog: ".agents/skills/centraldark-operational-method/catalogo/META-RSI-40.md"
centraldark_self_primary: "Self-Correction"
centraldark_self_related: ["Self-Healing","Self-Recovery"]
centraldark_self_skill_refs: [".agents/skills/centraldark-operational-method/Skills/self-correction/SKILL.md",".agents/skills/centraldark-operational-method/Skills/self-healing/SKILL.md",".agents/skills/centraldark-operational-method/Skills/self-recovery/SKILL.md"]
centraldark_self_review: "APPLIED_OR_NOOP_JUSTIFIED_WHEN_RUNTIME_CONSUMES"
centraldark_self_activation: "RECALL_AND_REVIEW_ONLY_NOT_AUTOPATCH"
centraldark_self_runtime: "UNKNOWN_UNTIL_CONSUMER_READBACK"
---
# 🧵 Cristal · Dependabot resolver trusted-source · 2026-09-09

## Intenção

Costurar a ferida causal do radar Dependabot no owner existente, sem V2/V3, sem rerun-all, preservando `UNKNOWN != PASS` e deixando rastro durável na `main`.

## Ferida medida

Owner existente:

```text
scripts/dependabot/reconcile-open-prs.sh
scripts/dependabot/resolve-conflicts.sh
.github/workflows/dependabot-auto-merge.yml
```

O workflow executa o radar a partir do checkout confiável `.ci-house`, mas o radar exigia o resolver em:

```text
$REPO_DIR/scripts/dependabot/resolve-conflicts.sh
```

Isso acoplava indevidamente duas fronteiras diferentes:

```text
TRUSTED_CODE_SOURCE != MUTABLE_HOUSE_REPO
```

`REPO_DIR=/root/CentralDark` continua sendo a Casa persistente usada para `fetch/worktree/push`; ele não precisa ser a fonte do script confiável executado pela CI.

## Correção absorvida no owner

Commit de implementação provado antes desta cristalização:

```text
720c4d2a1e5b756f7f5bf5b611aea9bcf47566d8
FIX(DEPENDABOT): decouple trusted resolver source from house repo
```

Regra aplicada:

```text
RESOLVER_SOURCE=resolver irmão do radar no checkout confiável
REPO_DIR=Casa persistente para operações Git
RESOLVER_PATH override explícito continua permitido
fallback legado continua fail-closed
NO_PARALLEL_RESOLVER=true
DIRECT_MAIN_WRITE_BY_RESOLVER=0
UNKNOWN_IS_PASS=0
```

## Contraprova executada

Run explícito no HEAD de implementação:

```text
WORKFLOW=Dependabot — radar, compatibilidade e squash seguro
RUN_ID=34361377782
HEAD=720c4d2a1e5b756f7f5bf5b611aea9bcf47566d8
EVENT=workflow_dispatch
RESULT=SUCCESS
```

O log provou a separação das fronteiras:

```text
RESOLVER_SOURCE=/opt/actions-runner-centraldark/_work/CentralDark/CentralDark/.ci-house/scripts/dependabot/resolve-conflicts.sh
REPO_DIR=/root/CentralDark
```

Receipt do radar:

```text
DEPENDABOT_RADAR_TOTAL=4
PROCESSED=4
UPDATE_BRANCH_REQUESTED=4
CONFLICT_RESOLVED=0
UNCHANGED_OR_REMOTE_MOVED=0
BLOCKED=0
MERGE_PERFORMED=0
AI_DECISION_USED=0
CHECKS_PENDING_BLOCK_UPDATE_BRANCH=0
OLD_OPEN_PRS_INCLUDED=1
UNKNOWN_IS_PASS=0
```

PRs alcançados pelo radar:

```text
#1460
#1472
#1473
#1474
```

Remedição após `update-branch` mostrou os quatro `OPEN`, `MERGEABLE`, com base no HEAD de implementação; promoção permaneceu separada de sincronização e sujeita aos checks próprios de cada PR.

## Runner / realidade

O GitHub reportou um único runner self-hosted relevante:

```text
name=vmi3256920-centraldark
os=Linux
status=online
version=2.337.0
labels=self-hosted,Linux,X64,centraldark,dependabot
```

O próprio run 34361377782 executou nesse runner e concluiu `success`, portanto a ferida não é classificada como "VPS caiu" nem "runner ausente".

## Rastro

```text
PR_MAE_TRACE=#1444
PR_COMMENT_RECEIPT=5603288702
IMPLEMENTATION_COMMIT=720c4d2a1e5b756f7f5bf5b611aea9bcf47566d8
```

## Cadeado temporal

Este arquivo é a cristalização durável do reparo. Como a própria cristalização cria um novo commit na `main`, o `FIXED_POINT` final exige remedição do workflow no **HEAD que contém este receipt**.

```text
DOCUMENTED_IS_NOT_EXECUTED=true
PREVIOUS_HEAD_SUCCESS_IS_EVIDENCE_NOT_CURRENT_HEAD_PASS=true
REMEASURE_RECEIPT_HEAD=true
FIXED_POINT_REQUIRES_SAME_HEAD_REPROOF=true
UNKNOWN_IS_PASS=0
```

## Próximo cursor único

```text
DISPATCH_DEPENDABOT_WORKFLOW_ON_RECEIPT_HEAD
→ VERIFY_SAME_HEAD_SUCCESS
→ REMEASURE_1460_1472_1473_1474
→ UPDATE_PR_MAE_RECEIPT
→ FIXED_POINT_THIS_WOUND
```
