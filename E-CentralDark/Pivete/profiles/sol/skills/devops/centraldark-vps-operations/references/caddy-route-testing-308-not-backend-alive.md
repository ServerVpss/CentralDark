# Caddy Route Testing — 308 ≠ Backend Alive (2026-08-28)

## The trap

When testing Caddy routes with `curl -H 'Host: <domain>' http://localhost:80/`, a `308` response only proves Caddy knows the domain — NOT that the backend is alive.

## Correct testing pattern

```bash
# 1. Test backend directly on its port
curl -s -o /dev/null -w '%{http_code}' http://localhost:<port>/health

# 2. Test if Caddy knows the domain (returns 308 if configured)
curl -s -o /dev/null -w '%{http_code}' -H 'Host: <domain>' http://localhost:80/

# 3. Test full chain via HTTPS (if Cloudflare proxy is off)
curl -sk -o /dev/null -w '%{http_code}' https://<domain>/health
```

## Domain → Backend Map (2026-08-28)

| Domain | Caddy Port | Real Backend | Status |
|---|---|---|---|
| api.centralldark.com | :8090 | ArsenalAdapter | ✓ |
| grafo.centralldark.com | :3030 | GraphPanel | ✓ |
| hub.centralldark.com | :8098 | OAuthBroker | ✓ |
| centralldark.com | :3000 | UI | ✓ |
| mcp.centralldark.com | :9100 | MCP | ✓ |
| elite.centralldark.com | :8082 | EliteHTTP (uvicorn) | ✓ |
| bridge.centralldark.com | - | Cloudflare Origin | ✓ |
| builder.centralldark.com | :5174 | (static) | ✗ |
| ui.centralldark.com | :3000 | (conflito?) | ✗ |
| deploy.centralldark.com | :9300 | WebhookDeploy | ✗ |
| gateway.centralldark.com | :3100 | MultiZap | ✗ |
| install.centralldark.com | :9200 | Install-Callback | ✗ |
| status.centralldark.com | :8082+ | EliteProxy + ghosts | ✗ |
| telepainel.centralldark.com | :9310 | TelePanel | ✗ |

## Domains dead by nature (never going to work)

- `bot.centralldark.com` → GuardiaoBot (bot Telegram, no HTTP port)
- `bridge.centralldark.com` → GuardiaoBridge (bridge, no HTTP port)

## Ghost ports (declared but not responding)

- `status.centralldark.com`: 6 ports declared (4189, 8082, 8083, 8790, 9400, 9500), only 2 respond
- `gateway.centralldark.com`: 2 ports declared, only 1 alive
- `builder.centralldark.com`: 2 ports declared, only 1 alive
