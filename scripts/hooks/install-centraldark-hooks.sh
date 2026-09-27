#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
HOOKS="$ROOT/.git/hooks"
mkdir -p "$HOOKS"
cp "$ROOT/scripts/hooks/pre-commit.centraldark-execution-contract.sh" "$HOOKS/pre-commit"
cp "$ROOT/scripts/hooks/pre-push.main-pinned-runtime-fast-path.sh" "$HOOKS/pre-push"
chmod +x "$HOOKS/pre-commit" "$HOOKS/pre-push"
echo "CENTRALDARK_HOOKS_INSTALLED=PASS"
