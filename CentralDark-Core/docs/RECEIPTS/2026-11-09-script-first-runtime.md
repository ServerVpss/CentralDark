---
title: "Script-first autonomous runtime — Hermes + CentralDark"
status: "PARTIAL_FIXED_POINT"
date: 2026-11-09
category: "RECEIPT"
sensitivity: INTERNAL
owner: "ServerVpss/CentralDark@main"
writer: "HERMES"
source_rule: "SCRIPT_FIRST_AI_ON_VERIFIED_FAILURE_ONLY"
---

# Script-first autonomous runtime

## Owner map

```text
METHOD=.agents/skills/centraldark-operational-method/SKILL.md
BOOT=scripts/trigger-fabric/centraldark_full_trigger_boot.py
DELEGATOR=scripts/trigger-fabric/proven_script_delegate.py
SENTINEL=scripts/trigger-fabric/system_sentinel.py
HERMES_GUARD=apps/modulos/HERMES-CORE/plugins/centraldark-runtime-guard/
CHECKPOINT=scripts/hermes/verified-checkpoint.py
```

## Runtime activation

```text
PLUGIN_PATH=/data/plugins/centraldark-runtime-guard
PLUGIN_SOURCE=/data/cache/scratch/CentralDark/apps/modulos/HERMES-CORE/plugins/centraldark-runtime-guard
PLUGIN_STATUS=ENABLED
GATEWAY_RELOAD=PASS
PLUGIN_DOCTOR=PASS
HOOKS_REGISTERED=6
TOOL_OVERRIDE=DISABLED
```

The active plugin is a symlinked projection of the canonical repository owner.
No second orchestrator, scheduler, router or memory system was created.

## Test A — healthy script

```text
CLAIM=PROVEN_REPLAY_EXECUTOR_PATH
FINGERPRINT=74c7c98d6fee33d967f2dd016dbdc7d0ef1af16f76a584295bbc95925c10a356
PRECHECK=SCRIPT_REPLAY_ELIGIBLE
EXECUTION=REUSE_CRYSTAL
EXECUTION_PASS=true
PROOF_PASS=true
EXPECTED_EFFECT_MATCH=true
MODEL_CALLS=0
SUBAGENT_CALLS=0
NEXT_CURSOR=FIXED_POINT
```

Receipt de replay:

```text
docs/RECEIPTS/2026-11-09-script-first-runtime-smoke.json
```

## Test B — falha controlada

A falha controlada foi enviada ao hook Hermes `post_tool_call` com status
`error`. O guard produziu um sinal sanitizado para a próxima chamada Hermes:

```text
SCRIPT_FIRST_FAILURE=true
RECOVERY_ROUTE=TRIGGER_FABRIC_SYSTEM_SENTINEL_THEN_HERMES
MODEL_INVOCATION=ONLY_AFTER_DETERMINISTIC_RECOVERY_FAILS
RAW_ERROR_LEAKED=false
```

O hook não chama modelo diretamente. Ele entrega o contexto ao Hermes, que deve
executar a recuperação determinística existente antes de qualquer especialista.

O System Sentinel existente também recebeu uma falha controlada e fez readback:

```text
SENTINEL_EVENT=PASS
SIGNATURE=UNKNOWN_ERROR
STATE=FAILURE
ROUTE=TOOL_ERROR → META_LUPA → RECONCILIAR
AUTO_MUTATION_AUTHORITY=false
STATE_READBACK=.artifacts/system-sentinel/state.json
LAST_CURSOR=sha256:092ed47b39241a5552e64635bb466cd3206622e562dab20e608208223de382c6
```

## Provas executadas

```text
proven_script_delegate tests: 7/7 PASS
centraldark_full_trigger_boot self-test: 20/20 PASS
centraldark_full_trigger_boot regression: 36 PASS
system_sentinel self-test: PASS
runtime-guard self-test: PASS
plugin doctor: PASS
plugin validation: PASS
git diff --check: PASS
```

## Limites atuais

```text
HERMES_PLUGIN_RUNTIME=PROVED
SCRIPT_SUCCESS_WITH_ZERO_LLM=PROVED
FAILURE_SIGNAL_TO_HERMES=PROVED
AUTOMATIC_SPECIALIST_REPAIR_AFTER_DETERMINISTIC_FAILURE=NOT_PROVED
CRON_PERSISTENT_TICK=NOT_ACTIVE
KANBAN=DISABLED
```

A ativação persistente de uma rotina recorrente não foi inventada: o perfil não
tem cron agendado e o Kanban está desabilitado. O runtime existente foi ligado
por plugin e o fluxo de falha foi preparado sem criar outro relógio.

## NEXT_CURSOR

```text
EXECUTE_CONTROLLED_DETERMINISTIC_FAILURE
VERIFY_EXISTING_SYSTEM_SENTINEL_EVENT_READBACK
VERIFY_HERMES_NEXT_TURN_REPLIES_WITH_RECOVERY_CONTEXT
ONLY_IF_RECOVERY_FAILS_PROVE_FREE_SPECIALIST_DELEGATION
THEN_UPDATE_EXISTING_RECEIPT_AND_CLOSE_FIXED_POINT
```
