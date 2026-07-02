## Situação atual

Fiz a consolidação **só no repo (Lovable + GitHub)**. A VPS ainda mostra a estrutura antiga porque ela não faz `git pull` sozinha — precisa comando manual ou webhook de deploy.

**Estado dos 4 pontos agora:**

```
1. ✅ Lovable       — projeto-dashboard/ removido, arquivos vivos em modulos/status/
2. 🔄 GitHub        — sincronizando (bidirecional automático com Lovable)
3. 🔴 VPS           — ainda tem apps/projeto-dashboard/ (visível no seu FileZilla)
4. ✅ CLAUDE.md     — atualizado (linhas 142 e 162)
```

## Plano de execução

### Etapa 1 — Verificar o que a VPS serve do `projeto-dashboard/` (SEGURANÇA)

Antes de deixar a VPS puxar a remoção, checar se algum serviço aponta pro caminho antigo:

- Ler `infra/caddy/` (Caddyfile) procurando referências a `projeto-dashboard`
- Ler `dump.pm2` procurando processos apontando pra esse caminho
- Ler qualquer `nginx.conf` ou script de deploy

**Se encontrar referência:** atualizar pro caminho novo (`apps/modulos/status/`) ANTES da sincronia, senão `status.centralldark.com` cai.

**Se não encontrar:** o `projeto-dashboard/` era só arquivo estático não-servido → pode sincronizar direto.

### Etapa 2 — Sincronizar VPS com GitHub

Comando a rodar na VPS (via MCP `execute_command` ou você mesmo por SSH):

```bash
cd /root/CentralDark
git status                    # confirma que não tem edição local não-commitada
git pull origin main          # puxa a consolidação
ls apps/                      # confirma que projeto-dashboard sumiu
ls apps/modulos/status/       # confirma que index.html, app.js, painel-data.json estão lá
```

### Etapa 3 — Watchdog do MCP (parar de cair)

Criar `/root/CentralDark/scripts/mcp-watchdog.sh`:

- Pinga `https://mcp.centralldark.com/health` a cada 1min (via cron)
- Se falhar 2x seguidas → `pm2 restart mcp` + manda alerta no Telegram (@srver1bot)
- Se retornar 401 (sessão expirada) → renova `CENTRALDARK_MCP_SESSION` antes de reiniciar
- Loga tudo em `/root/CentralDark/scripts/logs/mcp-watchdog.log`

Configurar PM2 com auto-restart resiliente:
```bash
pm2 restart mcp --max-memory-restart 500M --exp-backoff-restart-delay=100
pm2 save
```

### Etapa 4 — Feedback visível no painel

Adicionar cartão **"MCP Health (24h)"** no `painel-data.json` puxando os últimos eventos do log do watchdog. Assim você vê em `status.centralldark.com`:
- Uptime %
- Quantas vezes caiu
- Último restart automático
- Sem precisar me perguntar

### Etapa 5 — Fechar o loop

- `pm2 save` na VPS
- `git status` limpo nos 4 pontos
- Atualizar CLAUDE.md marcando "watchdog MCP" como área protegida
- Atualizar painel via `atualizar_painel` do MCP

## Detalhes técnicos

- **Por que a VPS não puxa sozinha:** não existe `git pull` automático configurado. O deploy é sempre manual ou via webhook do GitHub (que também não está ativo pra esse repo hoje).
- **Risco da Etapa 2:** zero, DESDE que a Etapa 1 confirme que nada aponta pro path antigo.
- **Watchdog vs auto-restart do PM2:** PM2 sozinho reinicia se o processo crashar, mas NÃO detecta "processo vivo mas travado" (que é o caso do 401 de sessão). O watchdog HTTP resolve isso.
