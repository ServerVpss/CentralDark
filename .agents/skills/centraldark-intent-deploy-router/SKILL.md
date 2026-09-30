---
name: centraldark-intent-deploy-router
description: Router obrigatório de intenção, gatilhos, Capability HUD e deploy vivo para agentes CentralDark. Use antes de escolher skill, subagente, escrita, microdeploy, CI profundo, HUB, provider, segredo temporário ou antes de alegar limitação de ferramenta.
metadata:
  type: routing
  version: "1.1"
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
INTENT_CONFIDENCE_GTE_95_EXECUTES_IF_SCOPE_AND_TOOL_ARE_CLEAR=true
```

## Capability HUD obrigatório

Antes de responder "não consigo", "não tenho ferramenta", "preciso do link" ou voltar cedo, carregue:

```text
.agents/CAPABILITY-HUD-BOOT.json
.agents/skills/centraldark-capability-hud/SKILL.md
```

Regra:

```text
TOOL_UNKNOWN
→ PROBE_RELEVANT_TOOL
→ IF_FAIL, REPORT REAL BLOCKER
→ ASK ONLY MINIMUM IDENTIFIER
```

Exemplo GitHub/CI:

```text
SHA/commit
→ workflow runs
→ jobs
→ logs
→ erro exato ou PASS
```

Nao parar em leitura de commit quando a intenção for workflow, CI ou log.

## Gatilhos por pertinência

```text
👑🪬 !CENTRALDARK
→ recuperar CURRENT, owner, escopo, runtime, PR/receipt e estado vivo.

🌅 #ACORDAR
→ medir HEAD/branch/worktree/runtime/PM2/MCP/HUB/Casa/VPS e Capability HUD antes de afirmar ou mutar.

🎯 !CALIBRAR
→ calcular intenção, confiança, autoridade, writer, risco, frequência, capacidade disponível e gatilho mínimo.

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

SE TOOL/ROTA_INCERTA || AGENTE_QUER_DIZER_NAO_CONSIGO
→ .agents/skills/centraldark-capability-hud/SKILL.md
→ PROBE_RELEVANT_TOOL_FIRST

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
OAUTH_CONNECTED != DEVICE_USABLE
SEARCHED != VERIFIED
COMMIT_EXISTS != CI_PASS
PATCHED != ROOT_CAUSE_FIXED
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

## Binding da gramática CentralDark

```text
CENTRALDARK_INVOCATION_GRAMMAR_01=true
CANONICAL_INVOCATION_GRAMMAR=docs/ARQUITETURA/CENTRALDARK-UNIFIED-SURFACE-PARITY-01.invocation-grammar.md
VOICE_CLASSIFIER_OWNER=.claude/skills/synced/voice-semantic-classifier/SKILL.md
UNIFIED_SURFACE_OWNER=.agents/skills/centraldark-unified-surface-parity/SKILL.md
GRAMMAR_DISPATCH_PRECEDES_TOOL_SELECTION=true
NO_SECOND_PARSER=true
SAME_NORMALIZED_INTENT_ACROSS_SURFACES=true
```

Rota:

```text
CentralDark + verbo + payload
→ normalizar intenção
→ se origem=voz, reutilizar voice-semantic-classifier
→ aplicar verb_dispatch canônico
→ selecionar owner/capability pertinente
→ executar somente se autorizado
→ provar
→ receipt
```

visualize permanece observação/renderização; não autoriza mutação. Gatilho é condicional, não ritual.

## Resultado esperado

O agente não escolhe ritual completo. Ele calcula intenção, mede capacidade real da sessão, escolhe o gatilho mínimo pertinente, usa os cristais corretos, executa o menor caminho completo, prova efeito, registra receipt e deixa NEXT_CURSOR.

Se travar, responde somente:

```text
PAREI_EM=
BLOQUEIO_REAL=
JA_TENTEI=
IDENTIFICADOR_MINIMO_PARA_CONTINUAR=
```
