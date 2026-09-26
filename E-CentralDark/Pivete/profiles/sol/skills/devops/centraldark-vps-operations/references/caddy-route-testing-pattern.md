# Caddy Route Testing Pattern (2026-08-28)

Caddy returns 308 (redirect to HTTPS) for any configured domain — this ONLY proves
Caddy knows the domain, NOT that the backend is alive.

## Correct testing pattern

```bash
# 1. Test backend directly on its port (proof of life)
curl -s -o /dev/null -w '%{http_code}' http://localhost:<port>/health

# 2. Test Caddy knows the domain (returns 308 if configured)
curl -s -o /dev/null -w '%{http_code}' -H 'Host: <domain>' http://localhost:80/

# 3. Test full chain via HTTPS (only if Cloudflare proxy is off / gray DNS)
curl -sk -o /dev/null -w '%{http_code}' https://<domain>/health
```

## Finding Real Port for a Service

When Caddy points to a dead port but the service is alive elsewhere:

```bash
# 1. Get PM2 PID
pm2 pid <service-name>

# 2. Find what port that PID is listening on
ss -tlnp | grep <PID>

# 3. Compare with Caddy config
grep -A5 'domain.centralldark.com' /etc/caddy/*.Caddyfile
```

**Real example (2026-08-28):**
- `elite.centralldark.com` → Caddy pointed to :8080 (dead)
- `pm2 pid CentralDark-EliteHTTP` → 14676
- `ss -tlnp | grep 14676` → :8082 (alive)
- Fix: `sed -i 's/127.0.0.1:8080/127.0.0.1:8082/g'` in elite Caddyfile

## Domain → Backend Map (2026-08-28, atualizado)

| Domain | Caddy → Port | Backend | Status | Notes |
|---|---|---|---|---|
| api.centralldark.com | :8090 | ArsenalAdapter | ✓ | OpenAI-compat |
| grafo.centralldark.com | :3030 | GraphPanel | ✓ | Grafo vivo |
| hub.centralldark.com | :8098 | OAuthBroker | ✓ | |
| centralldark.com | :3000 | UI | ✓ | |
| mcp.centralldark.com | :9100 | MCP | ✓ | |
| elite.centralldark.com | :8082 | EliteHTTP (uvicorn) | ✓ | Was :8080, fixed |
| builder.centralldark.com | - | Static site | ✗ | No backend |
| deploy.centralldark.com | :9300 | WebhookDeploy | ✗ | Stopped by design |
| bot.centralldark.com | - | GuardiaoBot | ✗ | Dead by nature |
| bridge.centralldark.com | - | GuardiaoBridge | ✗ | Dead by nature |

## Builder is a Static Site (2026-08-28)

`apps/web/dist/` contains HTML/assets only. No package.json, no vite.config.
:5174 is Vite dev-server port (only exists with `npm run dev`).

**Don't invent a backend for it.** Don't point Caddy to ghost ports.

## Domains Dead by Nature (NEVER will work)

These services are bots/bridges, not HTTP servers. They don't open ports:

- `bot.centralldark.com` → GuardiaoBot (Telegram bot, PID 14925, zero ports)
- `bridge.centralldark.com` → GuardiaoBridge (bridge, PID 14942, zero ports)

Do NOT try to "fix" these by starting a service. The domain was born dead.

## Ghost Ports (declared but not responding)

- `status.centralldark.com`: 4189, 8790, 9400 (declared, nobody listening)
- `gateway.centralldark.com`: 3100 (declared, nobody listening)
- `builder.centralldark.com`: 5174 (declared, nobody listening)

## Fixing a Wrong Port (example: elite.centralldark.com)

```bash
# 1. Find the real port
ss -tlnp | grep <PID>

# 2. Fix Caddyfile
sed -i 's/127.0.0.1:8080/127.0.0.1:8082/g' /etc/caddy/.../elite.centralldark.com.Caddyfile

# 3. Validate BEFORE reloading
caddy validate --config /etc/caddy/Caddyfile

# 4. Reload Caddy
caddy reload --config /etc/caddy/Caddyfile

# 5. Verify
curl -s -o /dev/null -w '%{http_code}' -H 'Host: elite.centralldark.com' http://localhost:80/
# Expected: 308 (redirect to HTTPS = backend alive)
```

## Caddy Backup + Validate + Reload Pattern (2026-08-28)

When editing Caddy configs on a live VPS, NEVER edit directly without backup + validation:

```bash
# 1. Backup ALL Caddy configs
cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak-<timestamp>
cp /etc/caddy/<subconfig>.Caddyfile /etc/caddy/<subconfig>.Caddyfile.bak-<timestamp>

# 2. Edit the configs (remove dead routes, fix ports)
sed -i '/dead-route/,/}/d' /etc/caddy/<config>.Caddyfile

# 3. Validate BEFORE reloading
caddy validate --config /etc/caddy/Caddyfile
# If validation fails → restore from backup, fix the error, retry

# 4. Only reload if validation passed
caddy reload --config /etc/caddy/Caddyfile

# 5. Verify the fix
curl -s -o /dev/null -w '%{http_code}' -H 'Host: <domain>' http://localhost:80/
```
