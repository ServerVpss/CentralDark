#!/usr/bin/env bash
set -Eeuo pipefail

MCP_PORT="${MCP_PORT:-9100}"
MCP_HEALTH="${MCP_HEALTH:-http://127.0.0.1:${MCP_PORT}/health}"
ENABLE_TS_SSH=0
[[ "${1:-}" == "--enable-ts-ssh" ]] && ENABLE_TS_SSH=1

log(){ printf '%s [TAILSCALE_MCP] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
die(){ log "FAIL $*"; exit "${2:-1}"; }

command -v tailscale >/dev/null 2>&1 || die "tailscale_cli_missing" 10
command -v curl >/dev/null 2>&1 || die "curl_missing" 11
command -v ss >/dev/null 2>&1 || die "ss_missing" 12

log "T0 measure"
TS_IP="$(tailscale ip -4 2>/dev/null | head -n1 || true)"
[[ "$TS_IP" =~ ^100\. ]] || die "tailscale_ipv4_missing" 13

tailscale status >/dev/null 2>&1 || die "tailscale_not_connected" 14
curl -fsS --max-time 5 "$MCP_HEALTH" >/dev/null || die "mcp_local_health_failed" 15

LISTENERS="$(ss -lntp "sport = :${MCP_PORT}" 2>/dev/null || true)"
printf '%s\n' "$LISTENERS" | grep -q "127.0.0.1:${MCP_PORT}" || die "mcp_not_bound_to_loopback" 16
if printf '%s\n' "$LISTENERS" | grep -Eq "(^|[[:space:]])(0\.0\.0\.0|\[::\]|\*):${MCP_PORT}([[:space:]]|$)"; then
  die "public_mcp_bind_detected" 17
fi

log "apply private tailnet forward ${TS_IP}:${MCP_PORT} -> 127.0.0.1:${MCP_PORT}"
tailscale serve --bg --yes --tcp="${MCP_PORT}" "tcp://127.0.0.1:${MCP_PORT}" >/dev/null

if [[ "$ENABLE_TS_SSH" -eq 1 ]]; then
  log "explicit flag received: enabling Tailscale SSH"
  tailscale set --ssh
fi

log "T1 counterproof"
tailscale serve status >/dev/null 2>&1 || die "tailscale_serve_status_failed" 18
curl -fsS --max-time 5 "$MCP_HEALTH" >/dev/null || die "mcp_health_regressed" 19
LISTENERS_AFTER="$(ss -lntp "sport = :${MCP_PORT}" 2>/dev/null || true)"
if printf '%s\n' "$LISTENERS_AFTER" | grep -Eq "(^|[[:space:]])(0\.0\.0\.0|\[::\]|\*):${MCP_PORT}([[:space:]]|$)"; then
  die "public_mcp_bind_after_apply" 20
fi

log "TAILSCALE_PRIVATE_MCP=PASS"
log "MCP_LOCALHOST_ONLY=PASS"
log "TAILSCALE_IP=${TS_IP}"
log "PRIVATE_ENDPOINT=http://${TS_IP}:${MCP_PORT}/mcp"
log "PUBLIC_9100_BIND=ABSENT"
