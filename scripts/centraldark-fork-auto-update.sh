#!/usr/bin/env bash
# Native Hermes cron adapter: update the canonical CentralDark checkout.
# Silent when synced; no independent daemon, git reset, stash or upstream push.
set -euo pipefail

root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
hermes_home="$(cd -- "$root/.." && pwd -P)"

# Git for Windows accepts native C:/ paths, not Git Bash /c/ paths when
# invoked by Hermes Cron's sanitized subprocess environment.
git_root="$root"
if [[ "$root" =~ ^/([A-Za-z])/(.*)$ ]]; then
  git_root="${BASH_REMATCH[1]}:/${BASH_REMATCH[2]}"
fi

fail() {
  printf 'CENTRALDARK_FORK_UPDATE_BLOCKED: %s\n' "$1" >&2
  exit 2
}

case "${1:-}" in ''|--check-only) ;; *) fail 'invalid option' ;; esac
[[ -e "$root/.git" && -f "$root/hermes" && -d "$root/CentralDark" ]] || fail 'unexpected CentralDark checkout layout'
[[ ! -e "$root/.git/index.lock" ]] || fail 'git operation in progress'
[[ "$(git -C "$git_root" branch --show-current 2>/dev/null)" == main ]] || fail 'not on main'

origin="$(git -C "$git_root" remote get-url origin 2>/dev/null)" || fail 'origin missing'
case "${origin,,}" in
  https://github.com/servervpss/centraldark|https://github.com/servervpss/centraldark.git|git@github.com:servervpss/centraldark|git@github.com:servervpss/centraldark.git|ssh://git@github.com/servervpss/centraldark|ssh://git@github.com/servervpss/centraldark.git) ;;
  *) fail 'origin is not ServerVpss/CentralDark' ;;
esac

tracked_changes="$(git -C "$git_root" status --porcelain=v1 --untracked-files=no 2>/dev/null)" || fail 'cannot read worktree'
[[ -z "$tracked_changes" ]] || fail 'tracked local changes preserved'

export GIT_TERMINAL_PROMPT=0 GCM_INTERACTIVE=never
if ! git -C "$git_root" fetch --no-tags origin 'refs/heads/main:refs/remotes/origin/main' >/dev/null 2>&1; then
  fail 'fetch unavailable; local files unchanged'
fi
local_sha="$(git -C "$git_root" rev-parse HEAD 2>/dev/null)" || fail 'cannot read local SHA'
target_sha="$(git -C "$git_root" rev-parse refs/remotes/origin/main 2>/dev/null)" || fail 'cannot read CentralDark main SHA'
if [[ "$local_sha" == "$target_sha" ]]; then
  [[ "${1:-}" != --check-only ]] || printf 'IN_SYNC %s\n' "$local_sha"
  exit 0
fi
if ! git -C "$git_root" merge-base --is-ancestor "$local_sha" "$target_sha"; then
  fail 'non-fast-forward history; no automatic reset or merge'
fi
if [[ "${1:-}" == --check-only ]]; then
  printf 'UPDATE_READY %s -> %s\n' "$local_sha" "$target_sha"
  exit 0
fi

if [[ -x "$hermes_home/bin/hermes.exe" ]]; then
  hermes_bin="$hermes_home/bin/hermes.exe"
elif [[ -x "$hermes_home/bin/hermes" ]]; then
  hermes_bin="$hermes_home/bin/hermes"
else
  hermes_bin="$(command -v hermes || true)"
fi
[[ -n "$hermes_bin" ]] || fail 'native Hermes updater not found'

# Hermes owns the backups, dependency sync, service drain and gateway recovery.
# Never force, bypass venv holders, or copy code into a running installation.
if ! "$hermes_bin" update --yes --channel main >/dev/null 2>&1; then
  fail 'native Hermes update refused or failed; see Hermes update logs'
fi
readback="$(git -C "$git_root" rev-parse HEAD 2>/dev/null)" || fail 'update readback unavailable'
if [[ "$readback" != "$target_sha" ]]; then
  printf 'CENTRALDARK_FORK_UPDATE_PENDING: target=%s observed=%s\n' "$target_sha" "$readback"
  exit 1
fi
printf 'CENTRALDARK_FORK_SYNCED: %s\n' "$readback"
