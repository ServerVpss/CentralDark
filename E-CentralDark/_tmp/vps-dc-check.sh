#!/usr/bin/env bash
set -u
printf 'observed_at='; date -Is
printf 'host='; hostname
printf 'whoami='; whoami
printf 'pwd='; pwd

echo '=== DESKTOP_COMMANDER_PROCESSES ==='
pgrep -af 'desktop-commander|@wonderwhy-er|centraldark-mcp-auth|npx.*remote' || true

echo '=== DEVICE_CONFIG ==='
if [ -f /root/.desktop-commander-device/device.json ]; then
  echo 'DEVICE_CONFIG=PRESENT'
else
  echo 'DEVICE_CONFIG=ABSENT'
fi

echo '=== CENTRALDARK_AUTH ==='
if command -v centraldark-mcp-auth >/dev/null 2>&1; then
  centraldark-mcp-auth service-status conta1 || true
  centraldark-mcp-auth receipt-last || true
else
  echo 'centraldark-mcp-auth=ABSENT'
fi

echo '=== SYSTEMD_MATCHING ==='
systemctl --no-pager --type=service --all | grep -Ei 'desktop|centraldark|hermes|mcp' || true
