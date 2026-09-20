# MICRO-HANDOFF — ancestrais válidos para reparar workflows

Data: 2026-09-20

Histórico material medido:

```text
porta-de-entrada.yml
  último ancestral anterior à corrupção #1597:
  0f40d1691070b74d11d3c9499770bb7ae5dff435

dependabot-auto-merge.yml
  versão imediatamente anterior ao reconciliador #1599:
  21172de98eab947bd525b99bae585444a3225502
  commit #1599 que introduziu jobs úteis:
  bba82aba7b5bceec92796024109867b43611616d
```

Decisão:
- Porta: restaurar corpo estruturalmente válido de `0f40d169...`; o contrato global continua sendo exigido pelo `validar-continuidade-global.mjs` já presente nesse workflow.
- Dependabot: NÃO jogar fora #1599; corrigir somente a expressão multiline quebrada no arquivo atual.

`REUSE_BEFORE_CREATE=true`
`NO_PARALLEL_WORKFLOW=true`
`TLC23_READ_BEFORE_MUTATION=true`
