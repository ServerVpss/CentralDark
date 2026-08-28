# CentralDark — scripts de deploy na VPS

Scripts que mantêm a Casa sincronizada e segura.

## Scripts

### `centraldark-deploy.sh` — sincronização repo-wide

Sincroniza `/root/CentralDark` com `origin/main`, reinicia serviços afetados e verifica health do MCP.

- **Escopo:** repo inteiro + MCP (não substitui deploy-operational-guards.sh)
- **Leis:** MERGED != DEPLOYED, AÇÃO != PROVA, NO_FORCE_PUSH, NO_BLIND_OVERWRITE
- **Uso:**
  ```bash
  ./scripts/vps/centraldark-deploy.sh          # dry-run: mede e diz o que faria
  ./scripts/vps/centraldark-deploy.sh --apply  # executa na VPS
  ```
- **Guards:** detecta chattr +i antes de mutar; falha alto se arquivos estiverem imutáveis
- **Códigos de saída:** 0 ok | 10 repo inválido | 11 sem rede/fetch | 12 chattr +i | 13 árvore divergente | 14 health falhou

### `deploy-operational-guards.sh` — guards estreitos (mapeamento + Log-Verificador)

Deploy atômico e específico para mapeamento e Hermes-Verificador. Usa TARGET_SHA e BACKUP_ROOT, com rollback automático em caso de falha.

- **Escopo:** apps/modulos/mapeamento + apps/modulos/HERMES-CORE/agents/Log-Verificador
- **Entradas:** TARGET_SHA, BACKUP_ROOT (variáveis de ambiente)
- **Feature:** rollback automático + tag de referring (vps-pre-deploy-<ts>)
- **Códigos de saída:** múltiplos (ver script para detalhes)

## Relação entre os scripts

Dois corpos, uma Casa:
- `centraldark-deploy.sh` → sincroniza repo inteiro + MCP (geral)
- `deploy-operational-guards.sh` → promove só mapeamento/Log-Verificador com teste+backup+rollback (específico)

Um deployment pode acionar ambos em sequência; cada um tem escopo separado e não sobrepõe mutações.

## Segurança

- Dry-run é o padrão; `--apply` é explícito
- Nunca force-push (NO_FORCE_PUSH)
- Nunca reset --hard cego (NO_BLIND_OVERWRITE)
- Falha alto em vez de sobrescrever no escuro
