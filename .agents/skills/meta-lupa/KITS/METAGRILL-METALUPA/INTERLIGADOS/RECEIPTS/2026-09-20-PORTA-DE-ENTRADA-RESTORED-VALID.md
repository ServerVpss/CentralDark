# MICRO-HANDOFF — Porta de Entrada restaurada

Data: 2026-09-20

A `.github/workflows/porta-de-entrada.yml` foi restaurada byte-a-byte para o último blob estruturalmente válido conhecido:

```text
SOURCE_REF=0f40d1691070b74d11d3c9499770bb7ae5dff435
SOURCE_BLOB=50d876e684e6d0fe4c4094ff3f318dd6a2dcbe66
MAIN_COMMIT=137ce29b6436680b90ceb309731701bedfe118ea
NEW_BLOB=50d876e684e6d0fe4c4094ff3f318dd6a2dcbe66
```

O gate `validar-continuidade-global.mjs` permanece no workflow, então o contrato global atual continua sendo verificado sem manter a duplicação corrompida.

`NO_PARALLEL_WORKFLOW=true`
`STRUCTURAL_CORRUPTION_REMOVED=true`
`CI_RESULT=UNKNOWN_UNTIL_NEW_RUN`

Próximo cursor: reparar a expressão quebrada do Dependabot preservando os jobs de reconciliação #1599.
