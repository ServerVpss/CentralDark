# executor-fanout — CentralDark

```text
#ACORDAR → !CALIBRAR → !MULTIBÚSSOLA → !META_LUPA → !RECONCILIAR → !CONTRAPROVA → !REMEDIÇÃO → !FIXED_POINT → !REGISTRA → !BOOT
```

## Propósito

Um **copiloto único** coordena **N executores isolados** (scopes próprios).  
Não cria segundo cérebro. Não promove `analyze_workflows.py` a dono de terminais.

## Contratos

```text
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
PARALLELIZE_PERCEPTION=true
SERIALIZE_MUTATION=true
ONE_WRITER_PER_SCOPE=true
UNKNOWN_IS_NOT_PASS=true
AUTO_FANOUT=LOCKED   # até multi-instance-probe PASS
```

## Owners

| Função | Owner |
|--------|--------|
| Fanout / scopes | este skill (`runtime/fanout-gate.mjs`) |
| Percepção paralela | workers isolados + opcional `analyze_workflows` READ_ONLY |
| Mutação | writer único **por scope** |
| Rendezvous | `runtime/rendezvous.mjs` |
| Judge | QA SkillMaster / Reality Judge (externo) |
| Workflow scan | `analyze_workflows.py` = **olho**, nunca orchestrator |

## Fluxo

```text
CHEFE → COPILOTO
  → fanout-gate (SERIALIZE | ALLOW_N se probe PASS)
  → H1..HN scopes (stateDir, receiptDir, lockDir, missionId sufixado)
  → percepção em paralelo (read-only)
  → mutação serial por scope
  → rendezvous
  → META_LUPA / REALITY_JUDGE
```

## Não fazer

- Compartilhar checkpoint/lock entre executores  
- Declarar `MULTI_EXECUTOR_REAL` sem probe  
- Usar scanner de workflows como dono de janelas  
- PASS com zero testes ou UNKNOWN como PASS  

## Runtime

- `runtime/scope.mjs` — cria scopes isolados  
- `runtime/fanout-gate.mjs` — SERIALIZE vs ALLOW_N  
- `runtime/worker.mjs` — executor isolado  
- `runtime/rendezvous.mjs` — agrega receipts  
- `runtime/multi-instance-probe.mjs` — H1..H8  
- `runtime/header-guard.mjs` — protocolo obrigatório  
