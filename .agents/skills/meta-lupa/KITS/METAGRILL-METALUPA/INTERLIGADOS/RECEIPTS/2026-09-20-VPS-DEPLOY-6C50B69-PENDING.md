# MICRO-HANDOFF — deploy disparado pelo patch de binding

Data: 2026-09-20

A própria mudança do workflow disparou o deploy canônico:

```text
RUN_ID=35536173740
HEAD=6c50b694532e94a657f288dadaa4e084a63ab2b1
EVENT=push
STATUS=pending
CONCLUSION=null
```

Também a Porta de Entrada do mesmo HEAD foi aceita e está `pending`, não failure pré-job.

`WORKFLOW_TRIGGER=PASS`
`WORKFLOW_PARSE=PASS`
`RUNNER_EXECUTION=UNKNOWN`
`DEPLOYED=FALSE_UNTIL_PROOF`

Próximo cursor: grillar scheduling/runner + device reconnect e só então runtime.
