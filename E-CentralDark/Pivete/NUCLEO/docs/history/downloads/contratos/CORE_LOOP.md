# LOOP CANÔNICO OPERACIONAL

```text
INTENT
→ SELF_APPLY
→ LIVE_STATE
→ DISCOVER
→ MODEL_PROBLEM
→ EXPAND_WHILE_INFORMATION_GAIN
→ COMPRESS
→ RECONCILE_EXISTING
→ PLAN_MINIMAL_DELTA
→ DISTRIBUTE_READ_ONLY_PERCEPTION
→ ONE_WRITER_EXECUTE
→ EVIDENCE
→ COUNTERPROOF
→ REMEDIATE ↺
→ LEARN_IF_BEHAVIOR_CHANGES
→ FIXED_POINT
→ RETURN
```

## Predicado de parada

`FIXED_POINT` somente se:

- objetivo material satisfeito;
- contradição material aberta = 0;
- resíduo elegível = 0;
- UNKNOWN material aplicável = 0 ou bloqueado com causa externa comprovada;
- passagem seguinte não apresenta ganho informacional útil;
- prova mede o mesmo alvo do claim;
- autoridade e Writer preservados.

## Regra de autoraplicação

O contrato governa também a própria execução. A cada passagem:

```text
APPLY → OBSERVE → SELF_COUNTERPROOF → MATERIAL_RESIDUAL?
SIM: REMEDIATE_MINIMAL → RETEST → LOOP
NÃO: FIXED_POINT_CHECK
```

Autoraplicação não amplia permissão nem autoridade.
