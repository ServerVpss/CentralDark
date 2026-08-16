#!/usr/bin/env bash
set -euo pipefail
TARGET="${1:-scripts/vps-organizacao/005-security-gate-pos-build.sh}"
[ -f "$TARGET" ] || { echo "FAIL: missing $TARGET" >&2; exit 2; }
TARGET="$(cd "$(dirname "$TARGET")" && pwd)/$(basename "$TARGET")"

bash -n "$TARGET"
forbidden='rm[[:space:]]+-rf|clamscan[^\n]*(--remove|--move=)|systemctl[[:space:]]+(start|stop|restart|reload|enable|disable)|apt(-get)?[[:space:]]+(install|remove|purge|upgrade)|pm2[[:space:]]+(start|stop|restart|delete|kill)|docker[[:space:]]+(rm|rmi|stop|restart|kill|prune)|git[[:space:]].*(reset[[:space:]]+--hard|clean[[:space:]]+-f)|shutdown|reboot|poweroff'
if grep -En "$forbidden" "$TARGET"; then
  echo "FAIL: security gate contains destructive remediation" >&2
  exit 1
fi

grep -Fq -- '--scanners vuln,misconfig,secret' "$TARGET"
grep -Fq -- '--severity HIGH,CRITICAL' "$TARGET"
grep -Fq -- '--exit-code 1' "$TARGET"
grep -Fq -- 'clamscan --recursive --infected' "$TARGET"
grep -Fq 'BLOCKED' "$TARGET"
grep -Fq 'SECURITY_GATE" "FAIL' "$TARGET"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/bin" "$TMP/repo" "$TMP/restore" "$TMP/reviews"

cat >"$TMP/bin/trivy" <<'MOCK'
#!/usr/bin/env bash
if [ "${1:-}" = "--version" ]; then echo "Version: mock"; exit 0; fi
out=""
while [ "$#" -gt 0 ]; do
  if [ "$1" = "--output" ]; then out="$2"; shift 2; continue; fi
  shift
done
[ -n "$out" ] && printf '{}\n' >"$out"
exit "${MOCK_TRIVY_RC:-0}"
MOCK
cat >"$TMP/bin/clamscan" <<'MOCK'
#!/usr/bin/env bash
if [ "${1:-}" = "--version" ]; then echo "ClamAV mock"; exit 0; fi
for a in "$@"; do
  case "$a" in --log=*) printf 'mock scan\n' >"${a#--log=}" ;; esac
done
exit "${MOCK_CLAM_RC:-0}"
MOCK
chmod +x "$TMP/bin/trivy" "$TMP/bin/clamscan"

PATH="$TMP/bin:$PATH" CD_REVIEW_ROOT="$TMP/reviews" MOCK_TRIVY_RC=0 MOCK_CLAM_RC=0 \
  bash "$TARGET" "$TMP/repo" "$TMP/restore" >/dev/null

if PATH="$TMP/bin:$PATH" CD_REVIEW_ROOT="$TMP/reviews" MOCK_TRIVY_RC=1 MOCK_CLAM_RC=0 \
  bash "$TARGET" "$TMP/repo" "$TMP/restore" >/dev/null 2>&1; then
  echo "FAIL: Trivy detection did not block gate" >&2
  exit 1
fi

if PATH="$TMP/bin:$PATH" CD_REVIEW_ROOT="$TMP/reviews" MOCK_TRIVY_RC=0 MOCK_CLAM_RC=1 \
  bash "$TARGET" "$TMP/repo" "$TMP/restore" >/dev/null 2>&1; then
  echo "FAIL: ClamAV detection/error did not block gate" >&2
  exit 1
fi

echo "PASS: post-build security gate is detect/block-only, passable when clean, and fail-closed on scanner findings"
