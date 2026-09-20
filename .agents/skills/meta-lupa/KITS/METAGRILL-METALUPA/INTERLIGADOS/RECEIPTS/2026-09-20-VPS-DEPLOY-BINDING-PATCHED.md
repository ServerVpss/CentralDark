# MICRO-HANDOFF — deploy VPS reamarrado

Data: 2026-09-20

Patch aplicado no workflow canônico existente:

```text
MAIN_COMMIT=6c50b694532e94a657f288dadaa4e084a63ab2b1
PLACEHOLDERS_REMAINING=0
RUNTIME_FILES_DEFS=1
ONE_DIGIT_PID_REGEXES=0
REPO_DIR=/root/CentralDark
MCP_DIR=/root/CentralDark/apps/modulos/mcp
AUDIT_DIR=/root/CentralDark/logs
REPORT_DIR=/root/CentralDark/logs/housekeeping
HYDRATE_SCRIPT=/root/CentralDark/scripts/vps/hydrate-provider-secrets.sh
HERMES_BACKUP_ROOT=/root/CentralDark-Recovery/hermes-runtime
```

O array de 9 arquivos do runtime Hermes agora é definido no próprio job que o consome.

`PATCH_ATOMICO=PASS`
`WORKFLOW_PARALLEL_CREATED=false`
`DEPLOY_RESULT=UNKNOWN_UNTIL_RUN`

Próximo cursor: observar o run disparado por esta própria mudança e grillar o primeiro elo que não fechar.
