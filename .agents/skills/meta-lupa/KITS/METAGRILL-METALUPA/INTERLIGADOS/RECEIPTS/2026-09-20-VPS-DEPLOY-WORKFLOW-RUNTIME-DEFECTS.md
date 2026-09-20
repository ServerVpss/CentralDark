# MICRO-HANDOFF — defeitos operacionais no workflow VPS Deploy

Data: 2026-09-20

Leitura do workflow atual revelou:

```text
REPO_DIR=<caminho-vps>
MCP_DIR=<caminho-vps>
AUDIT_DIR=<caminho-vps>
hydrate script=bash <caminho-vps>
REPORT_DIR=<caminho-vps>
HERMES REPO_DIR=<caminho-vps>
BACKUP_DIR=<caminho-vps>...
RUNTIME_FILES referenced but no definition visible
PID gate contains ^[0-9]$ in stability loop
```

Classificação:
`SOURCE_SYNTAX=PASS`
`OPERATIONAL_BINDING=FAIL`
`DEPLOY_WOULD_BE_SAFE_TO_CALL_PASS=false`

Próximo cursor: recuperar paths/array canônicos de uma versão válida anterior e aplicar patch atômico antes de novo deploy.
