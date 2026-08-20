#!/usr/bin/env bash
set -u
echo '=== CENTRALDARK VPS READ-ONLY SECURITY AUDIT ==='
uname -a||true; test -f /etc/os-release&&cat /etc/os-release||true
command -v ss>/dev/null 2>&1&&ss -lntup||true
command -v nft>/dev/null 2>&1&&nft list ruleset 2>/dev/null||true
if command -v sshd>/dev/null 2>&1;then sshd -T 2>/dev/null|grep -E '^(permitrootlogin|passwordauthentication|pubkeyauthentication|maxauthtries|x11forwarding)'||true;fi
if command -v docker>/dev/null 2>&1;then docker ps --format 'table {{.Names}}	{{.Image}}	{{.Ports}}'||true;stat -c '%a %U:%G %n' /var/run/docker.sock 2>/dev/null||true;fi
echo '=== END ==='
