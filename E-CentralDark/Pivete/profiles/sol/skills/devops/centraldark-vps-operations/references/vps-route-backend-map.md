# VPS Route & Backend Map (2026-08-28)

**Data:** 2026-08-28
**Fonte:** `/etc/caddy/Caddyfile` + `/etc/caddy/*.Caddyfile` + testes de porta

## Domínios Vivos

| Domínio | Porta | Backend | Status |
|---------|-------|---------|--------|
| api.centralldark.com | :8090 | ArsenalAdapter | ✓ vivo |
| grafo.centralldark.com | :3030 | GraphPanel | ✓ vivo |
| hub.centralldark.com | :8098 | OAuthBroker | ✓ vivo |
| centralldark.com | :3000 | UI | ✓ vivo |
| mcp.centralldark.com | :9100 | MCP | ✓ vivo |
| elite.centralldark.com | :8082 | EliteHTTP (uvicorn) | ✓ vivo (corrigido de :8080) |

## Domínios Mortos por Natureza (nunca vão funcionar)

| Domínio | Motivo |
|---------|--------|
| bot.centralldark.com | GuardiaoBot (bot Telegram, sem porta HTTP) |
| bridge.centralldark.com | GuardiaoBridge (bridge, sem porta HTTP) |

## Sem Backend de Produção

| Domínio | Realidade |
|---------|-----------|
| builder.centralldark.com | Site estático (`apps/web/dist/`), sem package.json, sem vite.config. :5174 é Vite dev-server só existe com `npm run dev` |

## Parados por Design

| Domínio | Motivo |
|---------|--------|
| deploy.centralldark.com | WebhookDeploy parado por política |

## Portas em Uso

`:80` Caddy HTTP, `:443` Caddy HTTPS, `:2019` Caddy API, `:3000` UI, `:3030` GraphPanel, `:3090` ArtifactsBuilder, `:3101` Memoria, `:8090` ArsenalAdapter, `:8091` HubBot, `:8098` OAuthBroker, `:9100` MCP, `:9300` WebhookDeploy, `:9500` GuardiaoBot

## Correções Aplicadas

1. **elite.centralldark.com**: `8080 → 8082` (EliteHTTP vivo na :8082, Caddy apontava pra :8080 errado)

## Revertidos

1. **7 declarações mortas removidas** (bridge, builder:5174, status:4189+8790+9400, gateway:3100, bot import) → **REVERTIDO** pelo CHEFE. Benefício funcional zero, risco não-zero.
2. **gateway-centraldark.Caddyfile removido** → **REVERTIDO**. Serviço pode subir sob demanda.

## Padrão de Teste de Rotas

```bash
# 1. Testar backend direto na porta
curl -s -o /dev/null -w '%{http_code}' http://localhost:<port>/health

# 2. Testar se Caddy conhece o domínio (retorna 308 se configurado)
curl -s -o /dev/null -w '%{http_code}' -H 'Host: <domain>' http://localhost:80/

# 3. Testar cadeia completa via HTTPS
curl -sk -o /dev/null -w '%{http_code}' https://<domain>/health
```

**Nota:** `308` = redirect pra HTTPS. Não prova que backend está vivo, só que Caddy conhece o domínio.

## Cuidados

1. **Não apagar rotas mortas sem motivo.** Rota morta não consome recurso, não causa incidente.
2. **Não inventar backend.** Se não tem processo, não aponta Caddy pra porta fantasma.
3. **Backup antes de mudar Caddy.** `cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak-$(date +%Y%m%d-%H%M%S)`
4. **Validar antes de recarregar.** `caddy validate --config /etc/caddy/Caddyfile`
5. **Reload condicional.** Só recarrega se validate passar.
6. **Medir ≠ morto em tudo.** Serviço que sobe sob demanda, cron que liga porta por janela — some do retrato e volta depois.

## Histórico

- 2026-08-28: Mapeamento inicial. Elite corrigido (8080→8082). 7 declarações mortas removidas (REVERTIDO). Gateway removido (REVERTIDO). Estado final: 6 rotas vivas confirmadas.
