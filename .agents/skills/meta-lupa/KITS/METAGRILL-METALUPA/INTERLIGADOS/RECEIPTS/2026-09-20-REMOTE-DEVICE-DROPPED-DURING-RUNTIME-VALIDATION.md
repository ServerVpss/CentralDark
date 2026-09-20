# MICRO-HANDOFF — Remote Desktop indisponível durante validação runtime

Data: 2026-09-20

Após a VPS ser limpa/fast-forward, a tentativa seguinte de executar TLC23/runtime recebeu:

```text
No devices available ... please connect a device to use remote tools
```

Classificação:

`TOOL_RUNTIME_CONNECTIVITY_FAILURE=true`
`TARGET_RUNTIME_FAILURE=UNKNOWN`
`VPS_OFFLINE_NOT_PROVED=true`
`FIXED_POINT=false`

Não converter perda do canal remoto em queda da VPS.

Próximo cursor: remedir lista de devices e, em paralelo lógico, acompanhar o deploy self-hosted/Actions já existente.
