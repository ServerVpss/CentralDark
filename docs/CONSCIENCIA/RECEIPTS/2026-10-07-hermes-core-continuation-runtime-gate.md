# Receipt — Gate de continuidade Hermes Core em runtime

Date: 2026-10-07
Status: RUNTIME_GATE_LOADED_PARTIAL_PROOF
Authority: SEGREDO/CHEFE
Parent Goal: `CENTRALDARK_CONTINUOUS_GOAL`

## Intenção

Tornar executável no mesmo Hermes Core a regra de que uma missão contínua não fecha por uma conclusão local, filho concluído, resposta de Oracle ou subagente terminado.

```text
CONTINUE_SAME_GOAL=true
→ Critic valida continuidade antes de CONCLUIDA
→ orchestrator mantém RUNNING quando Critic bloqueia
→ NEXT_CURSOR continua até FIXED_POINT real
```

Nenhum scheduler, segundo Hermes, segundo Oracle, segundo writer ou novo loop foi criado.

## Owner e delta mínimo

```text
LIVE_FINALIZATION_OWNER=apps/modulos/HERMES-CORE/agents/Critic/agent.mjs
LIVE_CONSUMER=apps/modulos/HERMES-CORE/core/orchestrator.mjs
MUTATION_GATE_OWNER=apps/modulos/HERMES-CORE/core/perception-policy.mjs
ORACLE_ADAPTER=scripts/trigger-fabric/oracle_evidence_hook.py
```

Commit aplicado:

```text
8d12ab3b6fcda94b730a501396fb7650900b7def
fix(hermes-core): block continuous goals before fixed point
```

Para missões que declaram `CONTINUE_SAME_GOAL=true` ou `HERMES_PARENT_GOAL_CONTINUOUS_LOOP`, o Critic bloqueia a finalização se faltar receipt de continuidade ou se qualquer condição abaixo não for satisfeita:

```text
NEXT_CURSOR=FIXED_POINT
NEXT_READONLY_PROBE=EMPTY
OPEN_WORK=0
RECOVERABLE_UNKNOWN=0
RECOVERABLE_FAIL=0
WRITER_CONFLICT=false
ORACLE_UNCERTAINTY=false
REALITY_JUDGE=PASS
```

A decisão inclui `continuity`; o receipt v3 registra a declaração e o motivo de continuação. `perception-policy.mjs` permanece o único gate de mutação material. `oracle_evidence_hook.py` permanece adaptador puro de evidência candidata.

## Evidência de código

```text
node --check Critic/agent.mjs=PASS
node --check Critic/finalization-gate.test.mjs=PASS
node --check core/decisor.mjs=PASS
node --test focused Core suite=105 PASS, 0 FAIL
 git diff --check=PASS
```

Contraprova direta da fonte carregável:

```text
CONTINUE_SAME_GOAL=true
NEXT_CURSOR=REMEASURE
→ APPROVED=false
→ STATUS=BLOCKED
→ CONTINUATION_REQUIRED=true
```

## Runtime readback

O mesmo owner de serviço foi reiniciado após o commit:

```text
UNIT=centraldark-hermes-core.service
EXEC=/usr/local/bin/node /root/CentralDark/apps/modulos/HERMES-CORE/core/orchestrator.mjs
PID_BEFORE=2137887
PID_AFTER=2701984
ACTIVE=active
HEALTH=http://127.0.0.1:8899/health=200
WATCHDOG=healthy
MISSIONS_IN_PROGRESS=2
```

Fingerprint do owner carregado no checkout do serviço:

```text
Critic/agent.mjs SHA256=6c2b083526471fd7425bf6ed7862664209ea506bc6909dd50ce85616123cb709
```

O runtime ainda reporta `DRIFT` com duas feridas. Isso preserva:

```text
GLOBAL_FIXED_POINT=NOT_PROVEN
GOAL_DONE=false
```

## Limites de prova

```text
CHAT_GLOBAL_TRANSPORT_AND_CAPTURE=PROVEN_IN_DESKTOP_PREVIEW
ORACLE_OUTPUT=CANDIDATE_ONLY
ORACLE_RUNTIME_CONTROLLER_INTEGRATION=UNKNOWN
THREE_CONSECUTIVE_ORACLE_CYCLES=NOT_YET_PROVEN
```

Uma tentativa de devolver este receipt à mesma superfície `CHAT_GLOBAL` foi feita, mas a Preview não ofereceu uma nova fronteira de resposta após o submit. O estado é `RESPONSE_INCOMPLETE`, não aprovação ou falha do gate.

## Rollback

```text
revert commit 8d12ab3b6
→ restart centraldark-hermes-core.service
→ verify new PID + /health
→ re-run focused Core suite
```

## Next cursor

`RECOVER_SAME_CHAT_GLOBAL_RESPONSE_BOUNDARY_THEN_REMEASURE_TWO_RUNTIME_DRIFT_WOUNDS_UNDER_CONTINUATION_GATE`
