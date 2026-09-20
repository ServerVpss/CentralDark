# MICRO-HANDOFF — Actions atuais da main

Data: 2026-09-20

## Medição

A main avançou durante a trajetória. Nos runs atuais:

```text
VPS Deploy canônico (self-hosted) = PENDING
porta-de-entrada.yml = FAILURE imediato em pushes recentes
dependabot-auto-merge.yml = FAILURE imediato em pushes recentes
CodeQL/lupa/farm = queued/pending/cancelled conforme concorrência
```

Um run de deploy canônico já existe e está pendente, portanto não inventar segundo mecanismo de deploy em paralelo.

`DEPLOY_REQUEST_EXISTS=true`
`DEPLOY_COMPLETED=false`
`PORTA_DE_ENTRADA_GREEN=false`
`FIXED_POINT=false`

Próximo cursor: inspecionar o failure imediato da Porta de Entrada e o job do deploy pendente; corrigir causa material antes de declarar verde.
