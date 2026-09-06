# RECEIPT — RECONCILIAÇÃO DA MAIN — 2026-09-05

## Intenção

Registrar a mudança material desta rodada sem promover falso verde: os PRs #1413, #1408, #1381 e #1409 foram absorvidos pela `main`, encerrando a fase de múltiplas linhas concorrentes para esse conjunto de deltas.

## Evidência estrutural observada

```text
MAIN_MEASURED=72a0cbbc269a80ca1fcf086007c5aa1999fde91a
PR_1413=MERGED
PR_1408=MERGED
PR_1381=MERGED
PR_1409=MERGED
PR_1381_MERGE_COMMIT=7555c2fb8ea64d6b351ce9d65a9392b489717c8c
PR_1408_MERGE_COMMIT=cdcddc5efab7860b493da8e3eaa4610c858911a1
PR_1413_MERGE_COMMIT=05340cece49d3c6e34cbff8739676f72aa13df05
REPOSITORY_CONVERGENCE=PROVEN_FOR_MEASURED_MAIN
```

## Correção propagada

Antes, o #1381 era tratado como PR-mãe vivo porque carregava estado ainda fora da `main`.

Depois da absorção:

```text
PR_MAE_HISTORICAL=#1381
PR_MAE_HISTORICAL_STATUS=MERGED
CURRENT_CONSOLIDATED_BASELINE=main
CURRENT_OWNER_OF_CONSOLIDATED_STATE=main
PAST_PR_IS_PROVENANCE_NOT_CURRENT_CONTROL_PLANE=true
```

A correção não apaga a história do #1381; apenas impede que um PR já mesclado continue sendo apresentado como owner vivo.

## O que foi absorvido

```text
#1413 → CARACOL + SOUL reanchor reconciliado
#1408 → PEGATUDO + reanchor visual + Screenpipe no owner existente
#1381 → fixed-point fabric + provas + SOUL + CARACOL + contratos acumulados
#1409 → atualização de dependências
```

Resultado mental:

```text
MUITAS_LINHAS
→ RECONCILIAR
→ PRESERVAR_DELTA_UTIL
→ ABSORVER
→ MAIN_UNICA
→ MEDIR_RUNTIME
```

## Limite da prova

Esta rodada prova convergência estrutural do repositório para a `main` medida. Não prova automaticamente runtime global.

```text
REPOSITORY_RECONCILIATION_FIXED_POINT=PROVEN_FOR_MEASURED_MAIN
GLOBAL_RUNTIME_FIXED_POINT=NOT_PROVEN
GPU_LIVE_PROBE=RESIDUAL_YELLOW
OMNI_HEALTH=ERROR_REPORTED
ONLINE_RUNTIME_STATE=UNKNOWN
SHA_TO_ARTIFACT_TO_DEPLOYMENT_TO_RUNTIME=NOT_PROVEN
MERGED != DEPLOYED
IMPLEMENTED_ON_MAIN != RUNNING_NOW
UNKNOWN != PASS
```

## Regra futura

```text
CURRENT_MAIN > HISTORICAL_PR_STATE
PR_MERGED → PROVENANCE
NEW_PR_MOTHER → ONLY_IF_NEW_ACTIVE_MISSION_REQUIRES_IT
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
ONE_WRITER_PER_SCOPE=true
REALITY_IS_JUDGE=true
```

## Próximo cursor

`main` atual → runtime vivo → GPU/live probe → Omni health → prova causal de deploy quando aplicável → contraprova → nova remedição.
