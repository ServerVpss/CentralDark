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
grep -q 'HORN_METHOD=HORN_FORWARD_CHAINING_TO_FIXED_POINT' <<<"$out"
grep -q 'REUSE_BEFORE_CREATE=true' <<<"$out"
grep -q 'OWNER_DECISION=EXTEND_EXISTING' <<<"$out"
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

# Contraprova: sem owner canônico o wrapper não fabrica install.sh paralelo.
export CENTRALDARK_CANONICAL_INSTALLER="$ROOT/ausente-install.sh"
out="$(bash "$SCRIPT" --self-test)"
grep -q 'OWNER_DECISION=BLOCKED_OWNER_GAP' <<<"$out"

export CENTRALDARK_CANONICAL_INSTALLER="$ROOT/install.sh"
# Fase Linux opcional do owner raiz: leitura/dry-run sem instalar ou registrar.
CANONICAL_INSTALLER="$(cd "$(dirname "$SCRIPT")/../.." && pwd)/install.sh"
if [ -f "$CANONICAL_INSTALLER" ]; then
  RUNNER_TEST_HOME="$ROOT/runner-linux-dry-run"
  rc=0
  out="$(CENTRALDARK_RUNNER_HOME="$RUNNER_TEST_HOME" bash "$CANONICAL_INSTALLER" --runner-linux-check 2>&1)" || rc=$?
  case "$(uname -s)" in
    Linux)
      [ "$rc" -eq 0 ]
      grep -q 'RUNNER_REGISTERED_LOCAL=NO' <<<"$out"
      ;;
    *)
      [ "$rc" -eq 2 ]
      grep -q 'BLOCKED_NOT_LINUX' <<<"$out"
      ;;
  esac
  rc=0
  out="$(CENTRALDARK_RUNNER_HOME="$RUNNER_TEST_HOME" bash "$CANONICAL_INSTALLER" --runner-linux-install --dry-run 2>&1)" || rc=$?
  case "$(uname -s)" in
    Linux) [ "$rc" -eq 0 ]; grep -q 'RUNNER_install_DRY_RUN=PASS' <<<"$out" ;;
    *) [ "$rc" -eq 2 ]; grep -q 'BLOCKED_NOT_LINUX' <<<"$out" ;;
  esac
  rc=0
  out="$(CENTRALDARK_RUNNER_HOME="$RUNNER_TEST_HOME" bash "$CANONICAL_INSTALLER" --runner-linux-activate --dry-run 2>&1)" || rc=$?
  case "$(uname -s)" in
    Linux) [ "$rc" -eq 0 ]; grep -q 'RUNNER_activate_DRY_RUN=PASS' <<<"$out" ;;
    *) [ "$rc" -eq 2 ]; grep -q 'BLOCKED_NOT_LINUX' <<<"$out" ;;
  esac
  [ ! -e "$RUNNER_TEST_HOME" ]
  echo 'RUNNER_LINUX_PHASE_DRY_RUN_TEST=PASS'
fi

echo 'DETERMINISTIC_INSTALLER_TEST=PASS'
