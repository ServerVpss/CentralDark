#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
# Git worktrees keep .git as a file; use their common hooks directory.
HOOKS="$(git rev-parse --git-path hooks)"
if command -v cygpath >/dev/null 2>&1; then
  HOOKS="$(cygpath -u "$HOOKS")"
fi
mkdir -p "$HOOKS"
for name in pre-commit pre-push; do
  if [ -e "$HOOKS/$name" ]; then
    case "$name" in
      pre-commit) tracked="scripts/hooks/pre-commit.centraldark-execution-contract.sh" ;;
      pre-push)   tracked="scripts/hooks/pre-push.main-pinned-runtime-fast-path.sh" ;;
    esac
    source_hook="$ROOT/$tracked"
    if ! cmp -s "$source_hook" "$HOOKS/$name"; then
      tracked_sha="$(git rev-parse "HEAD:$tracked")"
      installed_sha="$(git hash-object --path="$tracked" "$HOOKS/$name")"
      if [ "$tracked_sha" != "$installed_sha" ]; then
        echo "BLOCKED: existing $name is not the last tracked CentralDark hook; refusing overwrite." >&2
        exit 1
      fi
    fi
  fi
done
cp "$ROOT/scripts/hooks/pre-commit.centraldark-execution-contract.sh" "$HOOKS/pre-commit"
cp "$ROOT/scripts/hooks/pre-push.main-pinned-runtime-fast-path.sh" "$HOOKS/pre-push"
chmod +x "$HOOKS/pre-commit" "$HOOKS/pre-push"
cmp -s "$ROOT/scripts/hooks/pre-commit.centraldark-execution-contract.sh" "$HOOKS/pre-commit"
cmp -s "$ROOT/scripts/hooks/pre-push.main-pinned-runtime-fast-path.sh" "$HOOKS/pre-push"
echo "CENTRALDARK_HOOKS_INSTALLED=PASS"
