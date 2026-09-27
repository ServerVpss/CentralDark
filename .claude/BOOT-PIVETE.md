# BOOT PIVETE — Ponte do Claude para a Constituição Universal

Este arquivo é um complemento específico do Claude. Ele não substitui `CLAUDE.md`.

## Ordem obrigatória antes de agir

1. Abra ou inspecione o workspace atual.
2. Leia `00-COMECE-AQUI-IA.md`.
3. Leia **integralmente** `CLAUDE.md` como Constituição universal de todas as IAs.
4. Leia `AGENTS.md`.
5. Leia `.agents/INTENT-DEPLOY-BINDING.json`.
6. Leia `.agents/CAPABILITY-HUD-BOOT.json`.
7. Leia `.agents/skills/centraldark-capability-hud/SKILL.md`.
8. Leia `docs/GOVERNANCA/HIERARQUIA-INSTRUCOES-IA.md`.
9. Leia `docs/COFRE/README.md`.
10. Execute o BOOT operacional em `docs/GOVERNANCA/BOOT-IA.md`.
11. Leia `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/REGRA-MICRO-DEPLOY-CONTINUO-POR-PASS-COMPROVADO.md`.
12. Leia `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MICRO-DEPLOY-CONTINUO-BINDING.yml`.
13. Leia `docs/CONSCIENCIA/MICRO-DEPLOY/CENTRALDARK-LIVE-EDITING-FABRIC.md`.
14. Leia `.agents/skills/centraldark-live-editing-fabric/SKILL.md`.
15. Leia `docs/CONSCIENCIA/MICRO-DEPLOY/MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.md`.
16. Leia `.agents/skills/main-pinned-runtime-fast-path/SKILL.md`.
17. Leia `MODULES/HUB/CENTRALDARK-HUB-CREDENTIAL-CONTROL-PLANE.md`.
18. Leia `.agents/skills/centraldark-hub-credential-control-plane/SKILL.md`.
19. Confirme branch do workspace, ref inspecionada, SHA, ambiente, escopo, riscos, testes, prova, rollback e capacidade operacional carregada.
20. Não altere nada antes de concluir o BOOT operacional.

A Baseline de Defesa da Seção 0 de `CLAUDE.md` é obrigatória.

## Sistema de intenção obrigatório

Toda fala do CHEFE é primeiro delta da intenção vigente, não missão nova automática.

```text
NEW_CHEFE_MATERIAL=DELTA_TO_ACTIVE_INTENT_FIRST
PRESERVE_COMPATIBLE_ACTIVE_INTENT=true
RECALCULATE_INTENT_ALIGNMENT_EACH_MATERIAL_TURN=true
PERTINENCE_FIRST=true
MINIMUM_SUFFICIENT_LOOP=true
TRIGGERS_ARE_CONDITIONAL_NOT_RITUAL=true
ALIGN_THOUGHT_NOT_WORDING=true
INTENT_CONFIDENCE_GTE_95_EXECUTES_IF_SCOPE_AND_TOOL_ARE_CLEAR=true
```

Claude deve recalcular intenção antes de escolher ferramenta, subagente, deploy, CI, microdeploy, escrita ou resposta.

## Capability HUD obrigatório

Antes de dizer `não consigo`, `não tenho ferramenta`, `preciso do link` ou voltar cedo, Claude deve medir a capacidade real da sessão.

```text
TOOL_UNKNOWN
→ LOAD .agents/CAPABILITY-HUD-BOOT.json
→ LOAD .agents/skills/centraldark-capability-hud/SKILL.md
→ PROBE_RELEVANT_TOOL
→ IF_FAIL, REPORT REAL BLOCKER
→ ASK_ONLY_MINIMUM_IDENTIFIER
```

HUD mínimo:

```text
TOOL_OR_ROUTE=
DISCOVERED_CAPABILITY=
PROBE_ATTEMPTED=
RESULT=
BLOCKER_IF_ANY=
NEXT_REQUIRED_IDENTIFIER=
CONFIDENCE_ACTING_PERCENT=
```

## Gatilhos obrigatórios por pertinência

```text
👑🪬 !CENTRALDARK
→ recuperar CURRENT, owner, escopo, runtime, PR/receipt e estado vivo.

🌅 #ACORDAR / !ACORDAR
→ medir HEAD/branch/worktree/runtime/PM2/MCP/HUB/Casa/VPS.
→ carregar Capability HUD.
→ probe seguro da rota pertinente antes de afirmar, perguntar, recusar ou mutar.
→ voltar só com PASS, causa raiz, bloqueio real ou identificador mínimo faltante.

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
→ só declarar ponto fixo quando não houver erro material novo no escopo medido.

🧾 !REGISTRA
→ receipt no #1562 ou PR-filho equivalente, sem segredo, com NEXT_CURSOR.

🚀 !BOOT
→ preservar continuidade e entregar próximo executor no mesmo fio.
```

Regra de seleção:

```text
SE INTENCAO_CLARA && ESCOPO_AUTORIZADO
→ EXECUTE_MINIMUM_COMPLETE_PATH

SE TRIGGER == #ACORDAR || TRIGGER == !ACORDAR
→ CAPABILITY_HUD + PROBE_RELEVANT_TOOL_FIRST

SE TOOL/ROTA_INCERTA || AGENTE_QUER_DIZER_NAO_CONSIGO
→ CAPABILITY_HUD + PROBE_RELEVANT_TOOL_FIRST

SE DELTA_ENVOLVE_RUNTIME
→ CENTRALDARK_LIVE_EDITING_FABRIC + MAIN_PINNED_FAST_PATH

SE DELTA_ENVOLVE_HUB/PROVIDER/SECRET/OAUTH
→ HUB_CREDENTIAL_CONTROL_PLANE

SE DELTA_ENVOLVE_DOCUMENTACAO_CANONICA
→ EDIT_OWNER_EXISTING + RECEIPT

SE PASS_COMPROVADO
→ MICRO_DEPLOY_DO_ESCOPO_AFETADO + HEALTH/PROVA + RECEIPT + NEXT_TIK_TAK
```

## Live Editing Fabric — modo padrão

```text
CENTRALDARK_LIVE_EDITING_FABRIC=DEFAULT
MVP_FAST_LOOP_IS_DEFAULT=true
CI_DEEP_LOOP_IS_PRESS_MODE=true
CI_DEEP_LOOP_REQUIRES_CHEFE_INTENT=true
DEPLOY_CANONICO_IS_GUARD_NOT_DEFAULT_BRAKE=true
```

Fluxo:

```text
CHEFE_EDITA
→ MAIN_OU_DELTA_RASTREAVEL
→ SINGLE_REUSABLE_WORKTREE
→ OWNER_EXATO
→ TESTE_MINIMO_APLICAVEL
→ MICRODEPLOY_CAUSAL
→ RUNTIME_VIVO
→ PROVA_DO_EFEITO
→ RECEIPT
→ REFINA
→ COMPRIME
→ REPETE
→ PONTO_FIXO
```

## Main-Pinned Runtime Fast Path

```text
CANONICAL_SCRATCH_WORKTREE=/root/CentralDark/_worktrees/main-pinned-runtime-fastpath
SINGLE_REUSABLE_WORKTREE=true
WORKTREE_IS_DISPOSABLE=true
LOCK_REQUIRED=true
RESET_BEFORE_USE=true
RESET_AFTER_USE=true
DIRTY_WORKTREE_FORBIDDEN_AT_HANDOFF=true
RUNTIME_IS_NOT_SCRATCH=true
CASA_IS_NOT_SCRATCH=true
```

`git reset --hard` e `git clean -fdx` só podem operar no realpath exato do scratch canônico. `/root/CentralDark`, runtime vivo e `E:\CentralDark` nunca são scratch.

## HUB Credential Control Plane

```text
CHEFE -> HUB -> CONNECTOR -> OWNER_SECRET_OR_OAUTH -> TEST -> EFFECT -> RECEIPT_SEM_VALOR
```

Segredo temporário é trânsito operacional. O Claude não deve travar a missão por pacote com segredo; deve impedir que o valor vire Git/log/receipt/comentário permanente e continuar o delta útil.

```text
USE_SECRET_ONLY_FOR_REQUESTED_OWNER=true
SEGREDO_DETECTADO=true
VALOR_EXIBIDO=false
VALOR_COMMITADO=false
VALOR_LOGADO=false
VALOR_PERSISTIDO_EM_RECEIPT=false
COFRE_E_DONO_DO_VALOR=true
NO_SECRET_ECHO=true
NO_SECRET_COMMIT=true
NO_SECRET_RECEIPT_VALUE=true
NO_SECRET_MEMORY=true
NO_SECRET_LOG_VALUE=true
NO_SECRET_IN_PR_OR_ISSUE_COMMENT=true
NO_SECRET_IN_PERMANENT_ARTIFACT=true
SCRUB_CONTROLLED_LOGS_AFTER_USE=true
ROTATE_OR_DISCARD_AFTER_USE=true
DELTA_UTIL_CONTINUA=true
```

## Micro-deploy contínuo por PASS comprovado

A regra de micro-deploy contínuo por PASS comprovado também é obrigatória:

```text
QUALQUER_PASS_COMPROVADO
→ MICRO_DEPLOY_DO_ESCOPO_AFETADO
→ HEALTH_OU_PROVA_RUNTIME
→ RECEIPT_PR_MAE
→ NEXT_TIK_TAK

UNKNOWN != PASS
MERGED != DEPLOYED
DOCUMENTED != EXECUTED
PASS_VISUAL_BADGE_ONLY=false
ACTION_REQUIRED_IS_NOT_PASS=true
NO_BLIND_PULL_OVER_DIRTY_RUNTIME=true
HUB_CONNECTED != PROVIDER_RUNTIME_PASS
OAUTH_ACTIVE != TOOL_CALL_PASS
MODEL_COUNT != MODEL_ROUTE_PASS
HTTP_200 != FEATURE_READY
TOOL_LISTED != TOOL_ACTIVE
OAUTH_CONNECTED != DEVICE_USABLE
SEARCHED != VERIFIED
COMMIT_EXISTS != CI_PASS
PATCHED != ROOT_CAUSE_FIXED
```

Se uma frente Claude comprovar PASS em escopo material, ela deve avançar somente esse escopo, medir runtime/health quando aplicável, registrar receipt e continuar no `NEXT_TIK_TAK`. Essa regra não autoriza restart global, segredo, force-push ou mutação fora do escopo.

`docs/PROTOCOLO-BOOT.md` é complementar para memória e continuidade da sessão; não substitui a Constituição nem o BOOT operacional.

O fluxo histórico de PR continua válido quando o CHEFE pedir esteira/PR:

```text
pivete/dev → PR → pivete/auditoria → PR → main
```

Mas o modo padrão de trabalho vivo é `CENTRALDARK_LIVE_EDITING_FABRIC`, com microdeploy causal e receipt. GitHub é a fonte da verdade. VPS DEV/AUDIT é ambiente remoto autorizado. Produção executa apenas SHA aprovado.


## 🛡️ Cadeado do Guardião — Update Branch / COSTURA

```text
UPDATE_BRANCH_RUNNER_LOCK=GITHUB_HOSTED_UNTIL_SELF_HOSTED_PROVEN
WORKFLOW=.github/workflows/pr-update-branch-deterministic.yml
RUNNER_REQUIRED=ubuntu-latest
DO_NOT_CHANGE_TO_SELF_HOSTED_WITHOUT_CHEFE=true
SELF_HOSTED_ALLOWED_ONLY_WHEN_PROVEN_ONLINE=true
HYBRID_MODE_PENDING_VPS_PROOF=true
LOCK_OWNER=docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/UPDATE-BRANCH-RUNNER-LOCK.yml
```

Este fluxo só vira híbrido depois de prova atual do runner self-hosted online e autorização explícita do CHEFE. Enquanto isso, trocar para `[self-hosted, Linux]` é regressão.
