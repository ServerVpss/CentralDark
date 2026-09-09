#!/usr/bin/env bash
set -euo pipefail

ROOT="$(mktemp -d)"
trap 'rm -rf "$ROOT"' EXIT
mkdir -p "$ROOT/revisoes" "$ROOT/secrets"

cat > "$ROOT/install.sh" <<'EOF'
#!/usr/bin/env bash
printf '%s\n' "$*" >> "${CENTRALDARK_TEST_LOG:?}"
exit 0
EOF
chmod +x "$ROOT/install.sh"

SCRIPT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/centraldark-installer-deterministic-beta1.sh"
LOG="$ROOT/calls.log"
export CENTRALDARK_ROOT="$ROOT"
export CENTRALDARK_CANONICAL_INSTALLER="$ROOT/install.sh"
export CENTRALDARK_TEST_LOG="$LOG"
unset OPENAI_API_KEY ANTHROPIC_API_KEY OPENROUTER_API_KEY NVIDIA_API_KEY || true

out="$(bash "$SCRIPT" --self-test)"
grep -q 'SELF_TEST=PASS' <<<"$out"
grep -q 'PROVIDER_STATE=OPTIONAL' <<<"$out"
grep -q 'CLOUDFLARE_STATE=SETUP' <<<"$out"

out="$(printf '11\n\n0\n' | bash "$SCRIPT")"
grep -q 'Provider IA' <<<"$out"
grep -q 'OPTIONAL' <<<"$out"

: > "$LOG"
out="$(printf '8\n\n0\n' | bash "$SCRIPT")"
grep -q 'DNS wildcard' <<<"$out"
grep -q 'SETUP' <<<"$out"
if grep -q -- '--domains' "$LOG"; then
  echo 'FAIL: DNS executou sem Cloudflare configurado' >&2
  exit 1
fi

echo 'DETERMINISTIC_INSTALLER_TEST=PASS'
