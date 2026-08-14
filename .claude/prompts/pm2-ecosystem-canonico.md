# PM2 Ecosystem — registro histórico

> **HISTÓRICO / NÃO OPERACIONAL. NÃO EXECUTAR ESTE DOCUMENTO NA VPS.**

Este arquivo preserva a existência de uma tentativa de padronização PM2 auditada em **02/07/2026**. O conteúdo operacional anterior permanece disponível no histórico Git, mas foi removido da superfície ativa porque continha comandos de mutação e referências de configuração que não correspondem ao estado comprovado atual.

## Estado canônico

```text
PM2_RUNTIME_STATE=UNKNOWN_UNTIL_LIVE_MEASUREMENT
ROOT_ECOSYSTEM_CONFIG=UNKNOWN_UNTIL_VPS_PROVES
DESTRUCTIVE_PM2_COMMANDS_FROM_THIS_DOCUMENT=BLOCKED
THIS_FILE_IS_NOT_A_RUNBOOK=true
```

Os snapshots de 05/07/2026 em:

- `docs/CONSCIENCIA/INVENTARIO-PM2-VPS.md`
- `mem/architecture/inventario-pm2-vps.md`

também divergem entre si e não governam o runtime atual sem remedição.

## Única ação permitida a partir deste registro

**Read-only:** medir o runtime real da VPS por mecanismo autorizado, produzir uma projeção sanitizada dos campos necessários, reconciliar processo/nome/script/cwd/configuração contra o HEAD atual e somente então abrir uma correção causal separada.

Não publicar dump bruto de `pm2_env`, secrets, tokens ou ambiente completo em logs, receipts, comentários ou artefatos.

```text
NO_LIVE_MEASUREMENT=BLOCKED
UNKNOWN_IS_NOT_PASS=true
SKIPPED_IS_NOT_PASS=true
SEGREDO_CHEFE_AUTHORITY_REQUIRED_FOR_MUTATION=true
```

Qualquer mutação PM2, restart, rename, save, resurrect ou aplicação de ecosystem está fora deste documento histórico e exige fluxo operacional atual, backup/rollback aplicável e evidência do alvo real.
