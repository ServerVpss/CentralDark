set -eu
echo "OBSERVED_AT=$(date -Is)"
echo "HOST=$(hostname)"
echo "WHOAMI=$(whoami)"
echo "=== GIT ==="
if [ -d /root/CentralDark/.git ]; then
  echo "VPS_HEAD=$(git -C /root/CentralDark rev-parse HEAD)"
  echo "VPS_BRANCH=$(git -C /root/CentralDark branch --show-current)"
  echo "VPS_DIRTY_COUNT=$(git -C /root/CentralDark status --porcelain=v1 | wc -l)"
  echo "REMOTE_MAIN=$(git -C /root/CentralDark ls-remote origin refs/heads/main | awk '{print $1}')"
else
  echo "VPS_GIT=NOT_FOUND"
fi
echo "=== RUNTIME ==="
command -v hermes >/dev/null 2>&1 && hermes --version 2>/dev/null | head -4 || true
pgrep -af 'desktop-commander|centraldark-mcp-auth|hermes|screenpipe' || true
echo "=== SYSTEMD ==="
systemctl --no-pager --type=service --all | grep -Ei 'centraldark|hermes|desktop|mcp' || true
echo "=== RESTART ==="
test -f /var/run/reboot-required && echo "REBOOT_REQUIRED=true" || echo "REBOOT_REQUIRED=false"
