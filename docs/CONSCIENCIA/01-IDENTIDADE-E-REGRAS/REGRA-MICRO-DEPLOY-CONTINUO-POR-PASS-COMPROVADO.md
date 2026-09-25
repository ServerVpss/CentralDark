---
title: "Regra Global — Micro-deploy Contínuo por PASS Comprovado"
status: "CANONICAL_GLOBAL_RULE"
updated: 2026-09-25
owner: "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/"
authority: "SEGREDO/CHEFE"
scope: "CentralDark, VPS, MCP, Hermes, bots, plugins, workflows e agentes autorizados"
truth_rule: "REALIDADE_IS_JUDGE"
related:
  - docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/REGRA-PREPRODUCAO-MCP-MAO-NA-MASSA.md
  - .agents/skills/centraldark-esteira-motor/SKILL.md
---

# Regra Global — Micro-deploy Contínuo por PASS Comprovado

Esta regra cristaliza a ordem do SEGREDO/CHEFE: em pré-produção MCP, qualquer PASS comprovado deve gerar atualização contínua no escopo afetado, sem esperar perfeição global.

## 1. Fórmula canônica

```text
QUALQUER_PASS_COMPROVADO
→ MICRO_DEPLOY_DO_ESCOPO_AFETADO
→ HEALTH_OU_PROVA_RUNTIME
→ RECEIPT_PR_MAE
→ NEXT_TIK_TAK
```

## 2. Definição de PASS comprovado

PASS comprovado é resultado determinístico, mensurável e vinculado a um escopo específico.

```text
PASS_COMPROVADO=true
PASS_VISUAL_BADGE_ONLY=false
ACTION_REQUIRED_IS_NOT_PASS=true
UNKNOWN_IS_NOT_PASS=true
LOCAL_PROOF_WITH_RUNTIME_SCOPE_REQUIRES_RUNTIME_PROOF=true
```

Exemplos de PASS comprovado:

- teste determinístico executado no SHA exato;
- health endpoint medido após promoção do mesmo SHA;
- serviço vivo com processo, porta e resposta funcional;
- bot/runtime recarregado e comportamento novo observado;
- arquivo de regra/doc sem runtime implantável, com hash/commit/receipt.

## 3. Micro-deploy obrigatório por escopo

Quando um PASS comprovado existir, o executor deve promover somente o escopo afetado.

```text
PASS_COMPROVADO_MCP → MICRO_DEPLOY_MCP
PASS_COMPROVADO_BOT → MICRO_DEPLOY_BOT
PASS_COMPROVADO_HERMES → MICRO_DEPLOY_HERMES
PASS_COMPROVADO_PLUGIN → MICRO_DEPLOY_PLUGIN
PASS_COMPROVADO_DOC_ONLY → DEPLOY_NOT_APPLICABLE_WITH_RECEIPT
```

Micro-deploy não significa reiniciar tudo. Significa atualizar o menor componente compatível com a prova.

## 4. Cadeia obrigatória

```text
PR_FILHO_CHECK_DETERMINISTICO_PASS
→ MERGE/SQUASH_OU_PROMOCAO_AUTORIZADA
→ MAIN
→ MICRO_DEPLOY_VPS_DO_ESCOPO
→ HEALTH/PROVA_RUNTIME
→ RECEIPT_PR_MAE
```

Se o PR-filho ainda está aberto, `CHECK_PASS != DEPLOYED`. Se o workflow está `action_required`, não é PASS total.

## 5. CI aberto, mas não frouxo

```text
CI_DOES_NOT_REQUIRE_GLOBAL_PERFECTION=true
UNRELATED_UNKNOWN_DOES_NOT_BLOCK_PROVEN_SCOPE=true
FAILED_CHECK_BLOCKS_ONLY_ITS_SCOPE=true
PROVEN_SCOPE_CAN_PROGRESS=true
REFINE_AFTER_MICRO_DEPLOY=true
```

O CI deve deixar passar o que foi provado e manter o resto como `UNKNOWN/PENDING`, sem transformar pendência paralela em bloqueio global.

## 6. Receipt mínimo

Todo micro-deploy deve registrar:

```text
START_HEAD=
SOURCE_REF=
COMMIT_SHA=
MAIN_HEAD=
SCOPE=
DEPLOY_ACTION=
RUNTIME_HEALTH=
RUNTIME_SHA_OR_RUNTIME_VERSION=
SECRET_EXPOSED=false
RESULT=DEPLOYED|DEPLOY_NOT_APPLICABLE|DEPLOY_ROUTE_UNKNOWN|FAILED
NEXT_CURSOR=
```

## 7. Limites permanentes

```text
NO_SECRET_LEAK=true
NO_BLIND_RESET=true
NO_BLIND_PULL_OVER_DIRTY_RUNTIME=true
MERGED != DEPLOYED
ACTION != PROOF
DOCUMENTED != EXECUTED
UNKNOWN != PASS
REALIDADE_IS_JUDGE=true
```

## 8. Frase canônica

> Qualquer PASS comprovado vira micro-deploy do escopo afetado. Atualização é constante; falso-verde continua proibido.
