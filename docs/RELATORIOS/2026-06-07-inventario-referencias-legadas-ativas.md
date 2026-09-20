# Inventário de referências legadas ativas — 2026-06-07

## Contexto

Após a migração de apps para `/root/CentralDark/apps`, foi executado um inventário somente leitura para classificar referências remanescentes a caminhos antigos.

Relatório local gerado na VPS:

```txt
/root/CentralDark/revisoes/20260607-175433/inventario-referencias-legadas-ativas/RELATORIO-REFERENCIAS-LEGADAS-ATIVAS.md
```

## Resultado observado

```txt
Total: 211
Críticos: 4
Altos: 1
Caddy ativo: 1
PM2 ativo: 3
```

## Resumo por risco

```txt
ALTO    1
BAIXO   62
CRITICO 4
MEDIO   144
```

## Resumo por categoria

```txt
BUILD_ARTEFATO  1
CADDY_ATIVO     1
CADDY_BACKUP    8
CODIGO          13
CRON            1
DOCUMENTACAO    53
OUTRO           7
PM2_ATIVO       3
SCRIPT          124
```

## Itens críticos/altos observados

### 1. Caddy ativo

O Caddy ativo ainda aponta o frontend/site para caminho legado:

```txt
/etc/caddy/Caddyfile
root * /root/Multizap/apps/clone-deck/apps/bot/dist
```

**Risco:** crítico. Se a pasta antiga for movida/apagada antes de corrigir e validar o Caddy, o site pode cair.

**Regra:** não alterar Caddy sem confirmação explícita.

### 2. PM2 ativo — CloneDeck-CRM

O PM2 mostra `CloneDeck-CRM` com `pm_cwd` apontando para caminho legado:

```txt
/root/Multizap/apps/clone-deck/apps/crm
```

**Risco:** crítico.

**Regra:** não mexer no CRM sem confirmação explícita.

### 3. PM2 ativo — CloneDeck-Supabase-Sync

O PM2 mostra `CloneDeck-Supabase-Sync` com `pm_cwd` e `pm_exec_path` apontando para caminho legado:

```txt
/root/Multizap/apps/clone-deck/apps/bot/server/src/bridge
/root/Multizap/apps/clone-deck/apps/bot/server/src/bridge/supabase-sync.cjs
```

**Risco:** crítico.

### 4. Cron/script alto

Foi encontrada referência alta em rotina/script relacionado a `guarda-instalar-cron.sh`, com `REPO_DIR` apontando para caminho legado.

**Risco:** alto.

## Ordem correta para resolver

1. Confirmar se o build novo existe em `/root/CentralDark/apps/bot/dist`.
2. Preparar plano para Caddy ativo, mas alterar Caddy somente com confirmação explícita.
3. Inventariar PM2 ativo e decidir migração de cwd/script por serviço.
4. Não mexer no CRM sem confirmação explícita.
5. Corrigir Supabase-Sync se for seguro e validável.
6. Verificar cron alto.
7. Só depois corrigir scripts/docs/builds.
8. Só mover/apagar pastas antigas após validação PM2/HTTP.

## Decisão operacional

Enquanto existir Caddy ativo ou PM2 ativo apontando para caminho legado, `/root/Multizap/apps` deve ser tratada como dependência viva, não como lixo.
