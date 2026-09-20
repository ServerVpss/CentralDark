# MICRO-HANDOFF — self-hosted runner vivo e executando

Data: 2026-09-20

Contraprova direta na VPS:

```text
runsvc.sh=present
Runner.Listener=present
Runner.Worker=present
latest worker log=2026-09-20T20:43Z
actions/checkout@v7 started in runner workspace
results log uploads succeeding
```

Logo, fila `pending/queued` não significa runner morto. Há pelo menos um worker ocupado executando job real.

`SELF_HOSTED_RUNNER_LIVE=PASS`
`RUNNER_CAPACITY_FREE=UNKNOWN`
`DEPLOY_JOB_CURRENTLY_EXECUTING=UNKNOWN`

Próximo cursor: correlacionar Worker atual com run/job do GitHub e observar o deploy 6c50b69 até conclusão ou primeiro erro material.
