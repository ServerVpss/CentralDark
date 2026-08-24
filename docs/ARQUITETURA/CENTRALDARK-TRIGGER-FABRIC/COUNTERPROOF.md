# COUNTERPROOF

## Claims rejected or downgraded

1. `#CENTRALDARK` already exists as canonical trigger → **NOT SUPPORTED** in the measured repository.
2. "Create a new GraphRAG cron" → **REJECTED**: Hermes Core already invokes GraphRAG refresh periodically in repository code.
3. "Vector Memory is operational" → **NOT_PROVEN**: contract exists; runtime implementation/callsite not demonstrated.
4. "Session Harvester already runs automatically" → **NOT_PROVEN**: automation is declared in the skill; physical hook not demonstrated.
5. "The same Hermes Core loop is active on Windows `E:\CentralDark`" → **NOT_PROVEN**: observed implementation uses Linux `/root/CentralDark` paths.
6. "All automatic maintenance is safe" → **REJECTED** as blanket claim: legacy GC performs real deletion and must be reconciled against current safety rules.
7. "Package PASS means runtime PASS" → **FALSE**.

## Counterproof law

```text
PROVEN_CLAIM
→ SAME_TARGET
→ SAME_LAYER
→ INDEPENDENT_CHECK WHEN MATERIAL
→ SURVIVES?
   YES → keep PROVEN
   NO  → FAIL
   UNMEASURED → UNKNOWN
```

Any claim that depends on current runtime must remeasure runtime. Repository existence alone is insufficient.
