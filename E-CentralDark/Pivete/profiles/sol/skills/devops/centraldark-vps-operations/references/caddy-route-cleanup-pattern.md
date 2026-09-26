# Caddy Route Cleanup Pattern (2026-08-28)

When Caddy routes accumulate dead/wrong declarations, follow this pattern.

## Problem

Over time, Caddy configs accumulate:
- Routes to services that are dead by nature (bots, bridges — never had HTTP ports)
- Routes to wrong ports (service moved, Caddy wasn't updated)
- Ghost ports (multiple ports declared, only some respond)
- Conflicting port claims (two domains pointing to same port)

## Investigation

### 1. Map all domains
```bash
grep -r '{' /etc/caddy/Caddyfile /etc/caddy/*.Caddyfile | grep -v '#\|import'
```

### 2. Test each backend
```bash
# Test backend directly
curl -s -o /dev/null -w '%{http_code}' http://localhost:<port>/

# Test Caddy knows the domain
curl -s -o /dev/null -w '%{http_code}' -H 'Host: <domain>' http://localhost:80/
```

### 3. Classify each route

| Category | Action |
|---|---|
| Backend alive, Caddy correct | Keep |
| Backend alive, Caddy wrong port | Fix port number |
| Backend dead by nature (bot/bridge) | Remove declaration |
| Backend dead (service down) | Don't touch — out of scope |
| Ghost ports (multiple declared) | Remove dead ones |

### 4. Check for port conflicts
```bash
ss -tlnp | grep <port>
pm2 describe <service> | grep cwd
```

## Cleanup Execution

### 1. Backup ALL configs
```bash
cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak-<timestamp>
cp /etc/caddy/<subconfig>.Caddyfile /etc/caddy/<subconfig>.Caddyfile.bak-<timestamp>
```

### 2. Remove dead declarations
```bash
# Remove a block (from declaration to closing brace)
sed -i '/^bridge\.centralldark\.com {/,/^}/d' /etc/caddy/Caddyfile

# Remove specific port declarations
sed -i '/reverse_proxy 127.0.0.1:4189/,/}/d' /etc/caddy/status-centraldark.Caddyfile
```

### 3. Fix wrong ports
```bash
sed -i 's/127.0.0.1:8080/127.0.0.1:8082/g' /etc/caddy/<config>.Caddyfile
```

### 4. Validate BEFORE reloading
```bash
caddy validate --config /etc/caddy/Caddyfile
# If fails → restore from backup, fix error, retry
```

### 5. Reload only if validation passed
```bash
caddy reload --config /etc/caddy/Caddyfile
```

### 6. Verify
```bash
curl -s -o /dev/null -w '%{http_code}' -H 'Host: <domain>' http://localhost:80/
```

## Real Example (2026-08-28)

**Removed 7 dead declarations:**
- `bridge.centralldark.com` → respond 503
- `builder.centralldark.com` → :5174 (Vite dead)
- `status.centralldark.com` → :4189, :8790, :9400 (ghost ports)
- `gateway.centralldark.com` → :3100 (MultiZap dead)
- `bot` import → bot.Caddyfile

**Fixed 1 wrong port:**
- `elite.centralldark.com` → :8080 → :8082

**Result:**
- `caddy validate` → "Valid configuration"
- `caddy reload` → ok
- `elite.centralldark.com` → 308 ✓

## Domains Dead by Nature (NEVER remove these from the "to fix" list — they're unfixable)

- `bot.centralldark.com` → GuardiaoBot (Telegram bot, no HTTP port)
- `bridge.centralldark.com` → GuardiaoBridge (bridge, no HTTP port)

These services will NEVER open an HTTP port. The domain declaration in Caddy is wrong — the service was never meant to be exposed via HTTP.
