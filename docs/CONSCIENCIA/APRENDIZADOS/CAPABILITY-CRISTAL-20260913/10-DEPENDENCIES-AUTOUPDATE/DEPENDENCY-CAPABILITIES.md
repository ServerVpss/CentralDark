# Dependency Intelligence + Auto-update

Delta do Google Drive:

```text
MODULE REQUEST
→ ENVIRONMENT PREFLIGHT
→ OS / ARCH / PYTHON / NODE / RUST / GPU
→ INSTALLED?
→ VERSION COMPATIBLE?
→ SECURITY / INVARIANT CHECK
→ REUSE
   or ISOLATED INSTALL
→ TEST
→ HOT RELOAD
→ HEALTH
→ FAIL ? ROLLBACK : PROMOTE
```

Owner deve ser capacidade existente de dependency intelligence/runtime.
Não criar dependency-manager paralelo se já houver owner.

Feature toggles aplicam-se a:
- agents
- connectors
- executors
- accounts
- optional capabilities
