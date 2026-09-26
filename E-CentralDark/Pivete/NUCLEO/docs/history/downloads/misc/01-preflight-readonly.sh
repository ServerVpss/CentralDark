#!/usr/bin/env bash
set -euo pipefail
date -u +"TIME_UTC=%Y-%m-%dT%H:%M:%SZ"
echo "HOST=$(hostname)"
echo "USER=$(id -un)"
echo "=== GIT ==="
git rev-parse --show-toplevel 2>/dev/null || true
git branch --show-current 2>/dev/null || true
git rev-parse HEAD 2>/dev/null || true
git status --short 2>/dev/null || true
echo "=== CAPACITY ==="
df -h
free -h 2>/dev/null || true
uptime || true
echo "=== PORTS ==="
ss -ltnp 2>/dev/null || netstat -ltnp 2>/dev/null || true
echo "=== DOCKER ==="
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}' 2>/dev/null || true
docker system df 2>/dev/null || true
echo "=== PM2 ==="
pm2 ls 2>/dev/null || true
echo "=== SYSTEMD FAILED ==="
systemctl --failed --no-pager 2>/dev/null || true
echo "=== CADDY ==="
caddy version 2>/dev/null || true
systemctl status caddy --no-pager 2>/dev/null | head -80 || true
echo "READ_ONLY_PREFLIGHT_DONE=1"
