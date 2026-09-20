# MICRO-HANDOFF — deploy canônico pendente sem jobs

Data: 2026-09-20

Run observado:

```text
RUN_ID=35535725884
WORKFLOW=VPS Deploy canônico (self-hosted)
HEAD=6a748d8d61f0acab0101a6bc1f4bfe0cfea4ee7f
STATUS=pending
JOBS=[]
```

Isso não é deploy executado. Pode ser concorrência, proteção/approval ou scheduling pré-job; causa ainda não provada.

`DEPLOY_EXECUTED=false`
`DEPLOY_RESULT=UNKNOWN`
`FIXED_POINT=false`

Próximo cursor: ler o workflow canônico de deploy atual e identificar a condição que mantém o run em pending.
