# Contrato de Deploy Dual — CentralDark

## Visão Geral

A Casa opera com dois scripts de deploy na VPS, cada um com escopo distinto. Eles são complementares, não substitutos.

## `centraldark-deploy.sh` — Sincronização Repo-Wide

**Localização:** `scripts/vps/centraldark-deploy.sh`  
**Escopo:** Repositório inteiro + MCP  
**Modo:** Dry-run por padrão; `--apply` para execução real  
**Guards:** Detecta `chattr +i` e falha alto se encontrar arquivos imutáveis

### Fluxo:
1. **T0:** Mede HEAD atual, alvo (origin/main), diferença atrás/frente, arquivos rastreados sujos
2. **Guarda de imutabilidade:** Verifica `chattr +i` antes de qualquer mutação
3. **Aplicação (se --apply):** `git checkout origin/main -- .` (preserva untracked como .env, logs)
4. **Restart:** Reinicia PM2 com verificação de troca de PID
5. **T1:** Health 200 + porta 9100 LISTENING. Falha se não comprovado.

### Códigos de saída:
- 0: sucesso
- 10: repo inválido
- 11: sem rede/fetch
- 12: chattr +i detectado
- 13: árvore divergente
- 14: health falhou

## `deploy-operational-guards.sh` — Guards Estreitos

**Localização:** `scripts/vps/deploy-operational-guards.sh`  
**Escopo:** Apenas `apps/modulos/mapeamento` + `apps/modulos/HERMES-CORE/agents/Log-Verificador`  
**Entradas:** `TARGET_SHA` (obrigatório) + `BACKUP_ROOT` (padrão: `/root/CentralDark-Recovery/operational-guards`)

### Fluxo:
1. Validação de TARGET_SHA e BACKUP_ROOT
2. Build isolado do alvo em worktree temporário
3. Testes unitários + syntax check dos arquivos promovidos
4. Backup atômico dos diretórios afetados
5. Promoção dos arquivos do build para o repo
6. Restart do PM2 com verificação de estabilidade (PID estável por 20s)
7. **Rollback automático** via `trap cleanup` se qualquer passo falhar

### Diferenças chave:

| Aspecto | centraldark-deploy.sh | deploy-operational-guards.sh |
|---|---|---|
| Escopo | Repo-wide + MCP | Só mapeamento + Log-Verificador |
| Entrada | `--apply` (flag) | `TARGET_SHA` + `BACKUP_ROOT` (env) |
| Rollback | Manual via T1 health | Automático (trap cleanup) |
| Validação pós | Health + porta | PID estável + diff pós-deploy |
| Uso típico | VPS manual | CI (workflow_dispatch / push) |

## Quando usar cada um

- **`centraldark-deploy.sh`:** Sincronização geral do repositório, atualização de MCP, deploys manuais na VPS
- **`deploy-operational-guards.sh`:** Deploy específico de mapeamento/Log-Verificador com garantias de teste e rollback automático, normalmente via CI

## Princípios compartilhados

- Dry-run primeiro; ação real requer explicitação (`--apply` ou env TARGET_SHA)
- Fail-high: falham com código não-zero e mensagem clara, nunca sobrescrevem no escuro
- NO_FORCE_PUSH: nenhum escreve no remoto
- NO_BLIND_OVERWRITE: nenhum faz reset --hard cego
- T0 mede antes, T1 comprova depois

## Relação

Um deploy completo pode usar ambos em sequência:
1. `centraldark-deploy.sh --apply` para sincronização geral
2. `deploy-operational-guards.sh` (via CI) para validar e promover mapeamento/Log-Verificador com guards rigorosos

Cada script opera em seu escopo sem sobreposição de mutações.
