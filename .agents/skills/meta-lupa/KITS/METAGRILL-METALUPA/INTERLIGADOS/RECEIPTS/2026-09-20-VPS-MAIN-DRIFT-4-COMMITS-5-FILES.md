# MICRO-HANDOFF — drift VPS→main reduzido e medido

Data: 2026-09-20

Comparação:

```text
VPS_HEAD=137ce29b6436680b90ceb309731701bedfe118ea
MAIN_HEAD=6c50b694532e94a657f288dadaa4e084a63ab2b1
STATUS=ahead(main)
COMMITS=4
FILES=5
```

Arquivos:
- `.github/workflows/dependabot-auto-merge.yml`
- `.github/workflows/vps-exec-selfhosted.yml`
- `.pm2/contracts/hermes-operational-lock.json`
- `.pm2/contracts/pm2-authorization-wrapper.sh`
- `.pm2/policies/PM2-OPERATIONAL-POLICY.md`

Nenhum desses cinco altera o site estático diretamente.

Próximo cursor: verificar se o clone de trabalho do self-hosted runner já contém o objeto da main e reutilizá-lo como ponte Git local, sem token.
