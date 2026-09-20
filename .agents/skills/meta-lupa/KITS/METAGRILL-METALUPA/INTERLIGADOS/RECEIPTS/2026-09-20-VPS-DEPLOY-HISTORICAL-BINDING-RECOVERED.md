# MICRO-HANDOFF — binding histórico válido recuperado

Data: 2026-09-20

A última configuração com paths concretos foi localizada em `e4dcaa4df0614e79c64dbcf1edddc08e874060dc`:

```text
REPO_DIR=/root/CentralDark
MCP_DIR=/root/CentralDark/apps/modulos/mcp
AUDIT_DIR=/root/CentralDark/logs
HYDRATE=/root/CentralDark/scripts/vps/hydrate-provider-secrets.sh
REPORT_DIR=/root/CentralDark/logs/housekeeping
HERMES_BACKUP=/root/CentralDark-Recovery/hermes-runtime/<sha>-<timestamp>
```

A lista `RUNTIME_FILES` foi introduzida em `65ff45db...`, porém apareceu dentro do job MCP e não no job Hermes que a consome. Na main viva `7c26e222...` há:

```text
PLACEHOLDERS=<caminho-vps> x9
RUNTIME_FILES_DEFS=0
ONE_DIGIT_PID_REGEX=1
```

Patch permitido pelo TLC23: restaurar os paths históricos comprovados, definir o array no job Hermes e corrigir a regex do PID. Nenhum workflow paralelo.
