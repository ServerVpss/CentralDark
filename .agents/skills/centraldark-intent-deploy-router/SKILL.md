---
name: centraldark-intent-deploy-router
description: Router obrigatório de intenção, gatilhos e deploy vivo para agentes CentralDark. Use antes de escolher skill, subagente, escrita, microdeploy, CI profundo, HUB, provider ou segredo temporário.
metadata:
  type: routing
  version: "1.0"
  owner: SEGREDO/CHEFE
---

# CENTRALDARK INTENT DEPLOY ROUTER

## Regra central

Toda fala do CHEFE é primeiro delta da intenção vigente, não missão nova automática.

```text
NEW_CHEFE_MATERIAL=DELTA_TO_ACTIVE_INTENT_FIRST
PRESERVE_COMPATIBLE_ACTIVE_INTENT=true
RECALCULATE_INTENT_ALIGNMENT_EACH_MATERIAL_TURN=true
EXPLICIT_REPLACE_OR_PROVEN_INCOMPATIBILITY=ALLOW_INTENT_REPLACEMENT
PERTINENCE_FIRST=true
MINIMUM_SUFFICIENT_LOOP=true
TRIGGERS_ARE_CONDITIONAL_NOT_RITUAL=true
ALIGN_THOUGHT_NOT_WORDING=true
```

## Gatilhos por pertinência

```text
👑🪬 !CENTRALDARK
→ recuperar CURRENT, owner, escopo, runtime, PR/receipt e estado vivo.

🌅 #ACORDAR
→ medir HEAD/branch/worktree/runtime/PM2/MCP/HUB/Casa/VPS antes de afirmar ou mutar.

🎯 !CALIBRAR
→ calcular intenção, confiança, autoridade, writer, risco, frequência e gatilho mínimo.

⭕ !AURÉOLA CANÔNICA
→ mostrar rota operacional quando material: FASE, EIXO, OWNER, DESTINO, NEXT_GATE, PROVA, FERIDA, NEXT_CURSOR.

🔎 !META_LUPA
→ localizar lacuna, falso-verde, owner errado, duplicação, drift ou prova fraca.

💎 !DELTAUTIL
→ transformar descoberta em menor delta no owner existente.

🧪 !CONTRAPROVA
→ tentar derrubar conclusão antes de declarar PASS.

📏 !REMEDICAO
→ comparar T0 → ação → T1; provar efeito.

📍 !FIXED_POINT
→ declarar ponto fixo só quando não houver erro material novo no escopo medido.

🧾 !REGISTRA
→ receipt no #1562 ou PR-filho equivalente, sem segredo, com NEXT_CURSOR.

🚀 !BOOT
→ preservar continuidade e entregar próximo executor no mesmo fio.
```

## Roteamento obrigatório

```text
SE INTENCAO_CLARA && ESCOPO_AUTORIZADO
→ EXECUTE_MINIMUM_COMPLETE_PATH

SE AMBIGUIDADE_MATERIAL
→ ASK_MINIMUM_QUESTION

SE DELTA_ENVOLVE_RUNTIME/SITE/PAINEL/FEATURE
→ .agents/skills/centraldark-live-editing-fabric/SKILL.md
→ .agents/skills/main-pinned-runtime-fast-path/SKILL.md

SE DELTA_ENVOLVE_HUB/PROVIDER/SECRET/OAUTH/MODELO
→ .agents/skills/centraldark-hub-credential-control-plane/SKILL.md

SE DELTA_ENVOLVE_DOC/CANON/CONTRATO
→ EDIT_OWNER_EXISTING + RECEIPT

SE PASS_COMPROVADO
→ MICRO_DEPLOY_DO_ESCOPO_AFETADO + HEALTH/PROVA + RECEIPT + NEXT_TIK_TAK
```

## Cadeados

```text
UNKNOWN != PASS
ACTION != PROOF
MERGED != DEPLOYED
DOCUMENTED != EXECUTED
HEALTH_200 != FEATURE_READY
HUB_CONNECTED != PROVIDER_RUNTIME_PASS
OAUTH_ACTIVE != TOOL_CALL_PASS
MODEL_COUNT != MODEL_ROUTE_PASS
TOOL_LISTED != TOOL_ACTIVE
RUNTIME_IS_NOT_SCRATCH
CASA_IS_NOT_SCRATCH
NO_PARALLEL_ARCHITECTURE
```

## Segredo temporário

```text
SECRET_EPHEMERAL_AS_TRANSIT=true
USE_SECRET_ONLY_FOR_REQUESTED_OWNER=true
NO_SECRET_ECHO=true
NO_SECRET_COMMIT=true
NO_SECRET_RECEIPT_VALUE=true
NO_SECRET_MEMORY=true
NO_SECRET_LOG_VALUE=true
SCRUB_CONTROLLED_LOGS_AFTER_USE=true
ROTATE_OR_DISCARD_AFTER_USE=true
```

## Resultado esperado

O agente não escolhe ritual completo. Ele calcula intenção, escolhe o gatilho mínimo pertinente, usa os cristais corretos, executa o menor caminho completo, prova efeito, registra receipt e deixa NEXT_CURSOR.
