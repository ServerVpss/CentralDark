@echo off
set OUT=C:\Users\Administrador\AppData\Local\CentralDark\Remote-Tray\vps-public-mcp-probe.txt
echo === PROBE %DATE% %TIME% === > "%OUT%"
ssh segredo-vpss "hostname; whoami; cd /root/CentralDark && printf 'HEAD=' && git rev-parse --short HEAD; echo '=== PM2 ==='; pm2 ls --no-color; echo '=== MCP LOCAL ==='; curl -fsS http://127.0.0.1:9100/health || true; echo; echo '=== PORTS ==='; ss -ltnp | grep -E ':80 |:443 |:9100 ' || true; echo '=== CADDY ==='; systemctl is-active caddy || true; caddy validate --config /etc/caddy/Caddyfile 2>&1 || true; echo '=== PUBLIC ==='; curl -sS -D - -o /tmp/cd-mcp-health.body https://mcp.centralldark.com/health | head -20; cat /tmp/cd-mcp-health.body; echo; echo '=== DNS ==='; getent hosts mcp.centralldark.com || true" >> "%OUT%" 2>&1
echo EXIT=%ERRORLEVEL%>>"%OUT%"
