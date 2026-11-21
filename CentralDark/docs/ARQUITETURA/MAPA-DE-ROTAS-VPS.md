# Mapa de Rotas — CentralDark VPS

> Este documento registra o mapeamento real de domínios → backends na VPS.
> Se o Caddy ou os PM2 forem reconstruídos, este mapa é a fonte de verdade.

## Domínios Vivos

| Domínio | Backend | Porta | Processo |
|---------|---------|-------|----------|
| api.centralldark.com | ArsenalAdapter | :8090 | CentralDark-ArsenalAdapter |
| grafo.centralldark.com | GraphPanel | :3030 | CentralDark-GraphPanel |
| hub.centralldark.com | OAuthBroker | :8098 | CentralDark-OAuthBroker |
| centralldark.com | UI | :3000 | CentralDark-UI |
| mcp.centralldark.com | MCP | :9100 | CentralDark-MCP |
| elite.centralldark.com | EliteHTTP (Anthropic Proxy) | :8082 | CentralDark-EliteHTTP |

## Domínios Mortos (intencional)

| Domínio | Motivo |
|---------|--------|
| deploy.centralldark.com | WebhookDeploy parado por design |
| bot.centralldark.com | GuardiaoBot é bot Telegram, não servidor HTTP |
| bridge.centralldark.com | GuardiaoBridge é bridge, não servidor HTTP |
| gateway.centralldark.com | MultiZap Gateway removido |

## Domínios Sem Backend de Produção

| Domínio | Motivo |
|---------|--------|
| builder.centralldark.com | Site estático (apps/web/dist/), sem backend de produção. :5174 é Vite dev-server (só existe com npm run dev) |

## Portas em Uso

| Porta | Serviço | Tipo |
|-------|---------|------|
| :80 | Caddy (HTTP) | Proxy reverso |
| :443 | Caddy (HTTPS) | Proxy reverso |
| :2019 | Caddy API | Admin |
| :3000 | UI | Web |
| :3030 | GraphPanel | Web |
| :3090 | ArtifactsBuilder | Orquestrador |
| :3101 | Memoria | API |
| :8090 | ArsenalAdapter | OpenAI-compat |
| :8091 | HubBot | Bot |
| :8098 | OAuthBroker | API |
| :9100 | MCP | API |
| :9300 | WebhookDeploy | Webhook |
| :9500 | GuardiaoBot | Bot Telegram |

## Cuidados

1. **Não apagar rotas mortas sem motivo.** Rota morta não consome recurso, não causa incidente.
2. **Não inventar backend.** Se não tem processo, não aponta Caddy pra porta fantasma.
3. **Backup antes de mudar Caddy.** `cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak-$(date +%Y%m%d-%H%M%S)`
4. **Validar antes de recarregar.** `caddy validate --config /etc/caddy/Caddyfile`
5. **Reload condicional.** Só recarrega se validate passar.

## Histórico

- 2026-08-28: Mapeamento inicial. Removidas 7 declarações mortas (bridge, builder:5174, status:4189+8790+9400, gateway:3100, bot import). Corrigido elite: 8080 → 8082.
