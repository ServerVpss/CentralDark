# State-Driven Narration — binding do Trigger Fabric

Este documento registra o binding da narração operacional ao Trigger Fabric existente. Não define novo hook engine.

## Eventos reutilizados

Aplicar o guard de narração nos eventos de continuidade já existentes quando materialmente aplicáveis:

```text
MISSION_START
TOOL_CALL_START
TOOL_CALL_END
STATE_CHANGED
EVIDENCE_FOUND
HYPOTHESIS_CHANGED
WAIT_STARTED
WAIT_FINISHED
BLOCKER_CHANGED
OWNER_CHANGED
NEXT_CURSOR_CHANGED
PRE_HUMAN_RETURN
SESSION_END
```

Quando o Trigger Fabric não possuir um nome literal equivalente, mapear para o evento/etapa canônica já existente; não criar segunda malha de hooks.

## Regra

```text
TRIGGER_EVENT
→ BUILD_ROLLING_HANDOFF_STATE
→ STATE_FINGERPRINT
→ COMPARE_WITH_LAST_EMITTED_STATE

CHANGED
→ NARRATE_DELTA_ONCE
→ UPDATE_HANDOFF
→ CONTINUE

UNCHANGED
→ DROP_DUPLICATE_NARRATION
→ PRESERVE_GOAL
→ PRESERVE_NEXT_CURSOR
→ CONTINUE
```

## Enforcement e projeção

```text
HERMES_CORE / CONTINUITY_GUARD = enforcement
TRIGGER_FABRIC                = event source / continuity binding
OUTPUT_GUARD                  = evidence/final-output guard
REALITY_JUDGE                 = final judge
PLUGIN/HUD                    = projection only
```

`PLUGIN_OFF` não pode desligar a proteção anti-loop.

## Runtime frontier

Contrato em source não prova binding físico ativo. O runtime deve demonstrar:

1. duas emissões com fingerprint idêntico resultam em uma única narração;
2. mudança de `LAST_EVIDENCE`, `CURRENT_STATE` ou `NEXT_CURSOR` libera nova narração;
3. GOAL e NEXT_CURSOR sobrevivem durante espera silenciosa;
4. receipt registra contadores de mudança/supressão sem transformar silêncio em PASS.
