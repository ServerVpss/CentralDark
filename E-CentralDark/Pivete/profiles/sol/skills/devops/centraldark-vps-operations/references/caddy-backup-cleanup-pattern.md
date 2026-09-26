# Caddy Backup Cleanup Pattern

From 2026-08-28 session. The VPS had 103 Caddy backup files (340KB total).

## The Problem

Every Caddy edit creates a `.bak-*` file. Over months, these accumulate:
- `/etc/caddy/Caddyfile.bak-*` (30+ files)
- `/etc/caddy/Caddyfile.backup-*` (40+ files)
- `/etc/caddy/Caddyfile.bkp-*` (30+ files)

Total: 103 files, 340KB.

## The Pattern

```bash
# 1. Count backups
ls /etc/caddy/ | grep -cE '\.bak|\.bkp|\.backup'

# 2. Total size
du -ch /etc/caddy/*.bak* /etc/caddy/*.bkp* /etc/caddy/*.backup* 2>/dev/null | tail -1

# 3. List oldest first
ls -lt /etc/caddy/*.bak* /etc/caddy/*.bkp* /etc/caddy/*.backup* 2>/dev/null | tail -10

# 4. Remove backups older than 30 days (ONLY with CHEFE order)
find /etc/caddy/ -name '*.bak*' -mtime +30 -delete
find /etc/caddy/ -name '*.bkp*' -mtime +30 -delete
find /etc/caddy/ -name '*.backup*' -mtime +30 -delete
```

## Rule

- Don't delete backups without explicit CHEFE order
- 340KB is trivial — not worth the risk
- If disk becomes an issue, revisit with CHEFE
- Always keep at least one backup of working state

## Anti-Pattern

```
Agent: "Found 103 backup files, cleaning up..."
CHEFE: "Did I ask?"
```

Cleaning without asking = remoção pura = prohibited by infra filter.
