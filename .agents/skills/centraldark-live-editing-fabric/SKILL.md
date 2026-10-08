---
name: centraldark-live-editing-fabric
description: Modo padrão da CentralDark para edição viva determinística. Use quando o CHEFE quiser editar/refinar e ver no runtime rápido, sem transformar CI profundo em freio de MVP.
metadata:
  type: operational
  version: "1.2"
  owner: SEGREDO/CHEFE
centraldark_autosync: true
centraldark_autosync_policy: main-runtime-lock
oracle_review_on_change: true
---

# CENTRALDARK LIVE EDITING FABRIC

## Quando usar

Use por padrão quando a intenção for construir, ajustar, refinar, publicar no site/runtime, ver vivo e repetir.

Não trate como emergência. `main-pinned-runtime-fast-path` é o mecanismo de execução runtime do modo vivo quando houver delta rastreável para promover; deploy canônico profundo fica como guarda/esteira maior ou prensa quando o CHEFE mandar.

## Fluxo

```text
CHEFE_EDITA
→ INTENT_DELTA
→ LOCK
→ ASSERT_SCRATCH
→ FETCH MAIN
→ RESET/CLEAN SCRATCH
→ DELTA
→ TESTE_MINIMO
→ MICRODEPLOY_OWNER
→ PROVA_RUNTIME
→ RECEIPT
→ CLEAN_SCRATCH
→ NEXT_TIK_TAK
```

## Prensa profunda

```text
MVP_FAST_LOOP = default
CI_DEEP_LOOP = somente quando CHEFE mandar torcer a uva / ponto fixo profundo
DEPLOY_CANONICO = guarda, não freio padrão do MVP
```

## Seleção de gatilhos

```text
NEW_CHEFE_MATERIAL=DELTA_TO_ACTIVE_INTENT_FIRST
PERTINENCE_FIRST=true
MINIMUM_SUFFICIENT_LOOP=true
TRIGGERS_ARE_CONDITIONAL_NOT_RITUAL=true

runtime/site/painel/feature → LIVE_EDITING_FABRIC + MAIN_PINNED_FAST_PATH
hub/provider/secret/oauth → HUB_CREDENTIAL_CONTROL_PLANE
doc/canon → EDIT_OWNER_EXISTING + RECEIPT
pass material → MICRO_DEPLOY_DO_ESCOPO_AFETADO + HEALTH/PROVA + RECEIPT
```

## 🔙 Avanço + backcheck adaptativo

Este é o modo de edição da Casa: avançar sem perder a trilha anterior.

```text
PROGRESSO != ESQUECIMENTO
FORWARD_WINDOW_DEFAULT=20
BACKCHECK_WINDOW_DEFAULT=5
REWIND_ON_LOCAL_ERROR_DEFAULT=1
WINDOWS_ARE_ADAPTIVE=true
```

```text
⚙️ EDITA
→ ⏩ AVANÇA N
→ 🔙 AUDITA K anteriores
   ├─ sem delta material → continua
   └─ erro/drift → ↩️ menor ponto causal
                 → 🪡 COSTURA
                 → 🧪 RETESTA
                 → 🔙 BACKCHECK
                 → ⏩ REENTRA NO MESMO TRILHO
```

`N` e `K` são adaptativos. O padrão 20/5 é referência operacional, não lei fixa.

```text
BACKCHECK_IS_AUDIT_NOT_REWORK=true
LOCAL_REPAIR_BEFORE_FULL_ROLLBACK=true
REJOIN_SAME_TRAIL=true
NO_SILENT_REROUTE=true
```

Quando delegação/healing existir, reutilizar `scripts/agent-call.md` com revisão ida/volta e checkpoints antes/depois; não criar protocolo paralelo.

## 🪝 Gatilhos visuais

Use símbolos como âncoras semânticas consistentes para recuperação rápida de contexto:

```text
👑 CHEFE/autoridade
🎯 intenção
🖥️ sistema
🧠 cognição/agente
⚙️ execução
⏩ avanço
🔙 backcheck
🪡 costura
🧪 teste/contraprova
🪬 Reality Judge
🧾 receipt
🗝️ cristal/NEXT_CURSOR
```

```text
TITLE_HAS_SEMANTIC_TRIGGER=true
TRIGGER_MUST_MATCH_CONCEPT=true
VISUAL_TRIGGER != AUTHORITY
VISUAL_TRIGGER != PROOF
CALLBACK_RECONNECTS_PRIOR_CONTEXT=true
CALLBACK_DOES_NOT_REPEAT_WHOLE_HISTORY=true
```

## Segredos temporários

Trate segredo temporário como trânsito:

```text
USE
→ APPLY_TO_OWNER
→ DO_NOT_ECHO
→ DO_NOT_COMMIT
→ DO_NOT_WRITE_VALUE_TO_RECEIPT
→ SCRUB_CONTROLLED_LOGS
→ DISCARD_OR_ROTATE
```

Se precisar registrar, registre apenas nome lógico, owner, destino e resultado. Nunca o valor.

## Cadeados

```text
UNKNOWN != PASS
ACTION != PROOF
MERGED != DEPLOYED
DOCUMENTED != EXECUTED
NO_SECRET_ECHO
NO_SECRET_COMMIT
NO_SECRET_RECEIPT_VALUE
RUNTIME_EFFECT_REQUIRED
REPLAY_BEFORE_REDISCOVERY
RUNTIME_IS_NOT_SCRATCH
CASA_IS_NOT_SCRATCH
```

## Dono

- humano: `docs/CONSCIENCIA/MICRO-DEPLOY/CENTRALDARK-LIVE-EDITING-FABRIC.md`
- máquina: `docs/CONSCIENCIA/MICRO-DEPLOY/CENTRALDARK-LIVE-EDITING-FABRIC.json`
- binding: `docs/CONSCIENCIA/MICRO-DEPLOY/CENTRALDARK-LIVE-EDITING-FABRIC.yml`
- fast path: `.agents/skills/main-pinned-runtime-fast-path/SKILL.md`
- hub/credenciais: `.agents/skills/centraldark-hub-credential-control-plane/SKILL.md`
- bot: `apps/bot-telegram/CENTRALDARK-MANDATORY-RULES.yml`
- trigger fabric: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MICRO-DEPLOY-CONTINUO-BINDING.yml`
