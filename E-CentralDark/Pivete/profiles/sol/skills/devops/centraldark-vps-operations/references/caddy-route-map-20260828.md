# Caddy Route Map — 2026-08-28

## Domain → Backend Map

| Domain | Port | Backend | Status |
|---|---|---|---|
| api.centralldark.com | :8090 | ArsenalAdapter | ✓ |
| grafo.centralldark.com | :3030 | GraphPanel | ✓ |
| hub.centralldark.com | :8098 | OAuthBroker | ✓ |
| centralldark.com | :3000 | UI | ✓ |
| mcp.centralldark.com | :9100 | MCP | ✓ |
| elite.centralldark.com | :8082 | EliteHTTP (uvicorn) | ✓ |
| builder.centralldark.com | :5174 | (static dist/) | ✗ |
| ui.centralldark.com | :3000 | (conflito?) | ✗ |
| deploy.centralldark.com | :9300 | WebhookDeploy | ✗ |
| gateway.centralldark.com | :3100 | MultiZap | ✗ |
| install.centralldark.com | :9200 | Install-Callback | ✗ |
| status.centralldark.com | :8082+9500 | EliteProxy + Bot | parcial |
| telepainel.centralldark.com | :9310 | TelePanel | ✗ |

## Domains Dead by Nature (never going to work)

- `bot.centralldark.com` → GuardiaoBot (bot Telegram, no HTTP port)
- `bridge.centralldark.com` → GuardiaoBridge (bridge, no HTTP port)

## Ghost Ports (declared but not responding)

- `status.centralldark.com`: 6 ports declared (4189, 8082, 8083, 8790, 9400, 9500), only 2 respond
- `gateway.centralldark.com`: 2 ports declared, only 1 alive
- `builder.centralldark.com`: 2 ports declared, only 1 alive

## Builder Investigation

- `apps/web/dist/` exists (HTML, JS, CSS, favicon, manifest, robots)
- No `package.json`, no `vite.config.*` — static site, no build system
- No process listening on :5174 (Vite dev server dead)
- `builder.centralldark.com` → should be `file_server` of `apps/web/dist/`

## Elite Swap Detection

- `:8082` = uvicorn PID 14676 (elite-anthropic-proxy, alive)
- `elite.centralldark.com` → Caddy points to :8080 (dead)
- Fix: `8080 → 8082` in `/etc/caddy/centraldark-managed/root-imports/elite.centralldark.com.Caddyfile`

## Caddy Backup + Validate + Reload Pattern

```bash
# 1. Backup ALL Caddy configs
cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak-<timestamp>
cp /etc/caddy/<subconfig>.Caddyfile /etc/caddy/<subconfig>.Caddyfile.bak-<timestamp>

# 2. Edit configs
sed -i '/dead-route/,/}/d' /etc/caddy/<config>.Caddyfile

# 3. Validate BEFORE reloading
caddy validate --config /etc/caddy/Caddyfile
# If validation fails → restore from backup, fix error, retry

# 4. Only reload if validation passed
caddy reload --config /etc/caddy/Caddyfile

# 5. Verify
curl -s -o /dev/null -w '%{http_code}' -H 'Host: <domain>' http://localhost:80/
```

## Lesson: Zero Functional Benefit = Don't Touch

Even if `caddy validate` passes and reload works, removing dead declarations is **removal, not extension**. Dead routes consume no resources, cause no incidents. The gain is purely cosmetic. Under the CHEFE's infra filter, this is **reproven** — don't do it.

The elite fix (8080→8082) IS valid because it fixes a real regression (traffic going to wrong port).
