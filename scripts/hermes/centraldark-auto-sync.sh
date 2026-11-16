#!/usr/bin/env bash
# Keep a clean CentralDark main worktree aligned and prove its boot gates.
set -euo pipefail

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)"
ROOT="${CENTRALDARK_SOURCE_ROOT:-$(git -C "$SCRIPT_DIR/../.." rev-parse --show-toplevel)}"
ROOT="$(realpath "$ROOT")"
REMOTE="${CENTRALDARK_REMOTE:-origin}"
BRANCH="${CENTRALDARK_BRANCH:-main}"
SYNC_ROOT_INPUT="${CENTRALDARK_SYNC_ROOT:-${ROOT%/*}/CentralDark-auto-sync}"
if [[ "$SYNC_ROOT_INPUT" = /* ]]; then
  SYNC_ROOT="$(realpath -m "$SYNC_ROOT_INPUT")"
else
  SYNC_ROOT="$(realpath -m "$ROOT/$SYNC_ROOT_INPUT")"
fi
SYNC_OWNER_MARKER="${SYNC_ROOT}.centraldark-auto-sync-owner"
RECEIPT_DIR="${CENTRALDARK_RECEIPT_DIR:-${ROOT%/*}/centraldark-auto-sync}"
TLC23="${ROOT}/docs/CONSCIENCIA/04-MCP-E-CONECTORES/tlc23.pdf"
TLC23_SHA="b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1"
BOOT="scripts/trigger-fabric/centraldark_full_trigger_boot.py"

say() { printf '%s\n' "$*"; }
fail() { say "CENTRALDARK_AUTO_SYNC=BLOCKED"; say "REASON=$*"; exit 2; }

[ -e "$ROOT/.git" ] || fail "CANONICAL_REPO_NOT_FOUND"
[ -f "$ROOT/$BOOT" ] || fail "BOOT_LOADER_NOT_FOUND"
[ -f "$TLC23" ] || fail "TLC23_NOT_FOUND"
command -v git >/dev/null 2>&1 || fail "GIT_NOT_FOUND"
command -v python3 >/dev/null 2>&1 || fail "PYTHON3_NOT_FOUND"

actual_tlc23="$(sha256sum "$TLC23" | awk '{print $1}')"
[ "$actual_tlc23" = "$TLC23_SHA" ] || fail "TLC23_HASH_MISMATCH"

main_sha="$(git -C "$ROOT" ls-remote "$REMOTE" "refs/heads/$BRANCH" | awk 'NR==1 {print $1}')"
[ -n "$main_sha" ] || fail "REMOTE_MAIN_NOT_FOUND"

# --- GitHub API cross-check (optional, never blocking) ---
# Confirms the canonical main HEAD through the official GitHub REST API and
# records the verification result. Git remains the only transport: the API only
# identifies state. No token is ever printed, logged, or written to the receipt.
GITHUB_API_MAIN_SHA=""
API_VERIFY="SKIPPED_NO_TOKEN"
gh_token="${GITHUB_TOKEN:-}"
if [ -z "$gh_token" ] && [ -r /data/.env ]; then
  gh_token="$(sed -n 's/^GITHUB_TOKEN=//p' /data/.env | head -n1)"
fi
if [ -n "$gh_token" ] && command -v curl >/dev/null 2>&1; then
  api_url="https://api.github.com/repos/ServerVpss/CentralDark/branches/main"
  http_code="$(curl -sS --max-time 10 -o /tmp/.cd-api-main.json -w '%{http_code}' \
    -H "Authorization: token ${gh_token}" \
    -H "Accept: application/vnd.github+json" \
    "$api_url" 2>/dev/null || echo "000")"
  if [ "$http_code" = "200" ]; then
    GITHUB_API_MAIN_SHA="$(python3 -c "import json,sys;print(json.load(open('/tmp/.cd-api-main.json')).get('commit',{}).get('sha',''))" 2>/dev/null || echo "")"
    if [ -z "$GITHUB_API_MAIN_SHA" ]; then
      API_VERIFY="UNKNOWN_PARSE"
    elif [ "$GITHUB_API_MAIN_SHA" = "$main_sha" ]; then
      API_VERIFY="MATCH"
    else
      API_VERIFY="MISMATCH"
      say "WARNING: GitHub API main SHA differs from git remote main"
    fi
  else
    API_VERIFY="UNKNOWN_API_HTTP_${http_code}"
  fi
  rm -f /tmp/.cd-api-main.json
fi
unset gh_token
# -------------------------------------------------------
git -C "$ROOT" fetch "$REMOTE" "$BRANCH" >/dev/null

if [ "$SYNC_ROOT" = "$ROOT" ]; then
  fail "SYNC_ROOT_MUST_NOT_BE_SOURCE_CHECKOUT"
fi

created_sync_root=false
if [ -e "$SYNC_ROOT" ]; then
  [ -e "$SYNC_ROOT/.git" ] || fail "SYNC_ROOT_EXISTS_BUT_IS_NOT_GIT_WORKTREE"
  [ -f "$SYNC_OWNER_MARKER" ] || fail "SYNC_ROOT_OWNERSHIP_NOT_PROVEN"
  common_root="$(git -C "$ROOT" rev-parse --path-format=absolute --git-common-dir)"
  common_sync="$(git -C "$SYNC_ROOT" rev-parse --path-format=absolute --git-common-dir)"
  [ "$common_root" = "$common_sync" ] || fail "SYNC_ROOT_BELONGS_TO_ANOTHER_REPOSITORY"
else
  git -C "$ROOT" worktree add --detach "$SYNC_ROOT" "$REMOTE/$BRANCH" >/dev/null
  printf 'owner=centraldark-auto-sync\nroot=%s\ncommon_git=%s\n' \
    "$ROOT" "$(git -C "$ROOT" rev-parse --path-format=absolute --git-common-dir)" >"$SYNC_OWNER_MARKER"
  created_sync_root=true
fi

# This is the script-owned clean mirror. Never clean the operator's worktree.
git -C "$SYNC_ROOT" fetch "$REMOTE" "$BRANCH" >/dev/null
# Idempotence gate: when the mirror already sits exactly on canonical main and is
# clean, skip the destructive reset/clean. Local operator worktrees are never touched.
already_synced=false
if [ "$(git -C "$SYNC_ROOT" rev-parse HEAD 2>/dev/null || echo '')" = "$main_sha" ] \
   && [ -z "$(git -C "$SYNC_ROOT" status --porcelain 2>/dev/null || echo dirty)" ]; then
  already_synced=true
  say "SYNC_MODE=NOOP_ALREADY_AT_MAIN_SHA"
else
  git -C "$SYNC_ROOT" reset --hard "$REMOTE/$BRANCH" >/dev/null
  git -C "$SYNC_ROOT" clean -fd >/dev/null
  say "SYNC_MODE=UPDATED_TO_MAIN_SHA"
fi

# --- housekeeping: prune stale clean worktrees inside the scratch root ---
# Only checked-out files are removed; branch refs and commits stay in the repo, so
# nothing is lost. Dirty worktrees, the canonical checkout and the sync mirror are
# never touched. A failed removal (dirty, locked) is skipped, never forced.
WORKTREE_TTL_HOURS="${CENTRALDARK_WORKTREE_TTL_HOURS:-24}"
WORKTREE_PRUNE_MAX="${CENTRALDARK_WORKTREE_PRUNE_MAX:-10}"
PRUNE_REMOVED=0
PRUNE_SKIPPED=0
scratch_root="$(dirname "$ROOT")"
now_epoch="$(date +%s)"
while IFS= read -r wt_path; do
  [ -n "$wt_path" ] || continue
  [ "$wt_path" = "$ROOT" ] && continue
  [ "$wt_path" = "$SYNC_ROOT" ] && continue
  case "$wt_path" in
    "$scratch_root"/*) ;;
    *) PRUNE_SKIPPED=$((PRUNE_SKIPPED + 1)); continue ;;
  esac
  [ -d "$wt_path" ] || continue
  if [ -n "$(git -C "$wt_path" status --porcelain 2>/dev/null)" ]; then
    PRUNE_SKIPPED=$((PRUNE_SKIPPED + 1)); continue
  fi
  wt_age_s=$(( now_epoch - $(stat -c %Y "$wt_path" 2>/dev/null || echo "$now_epoch") ))
  if [ "$wt_age_s" -lt $(( WORKTREE_TTL_HOURS * 3600 )) ]; then
    PRUNE_SKIPPED=$((PRUNE_SKIPPED + 1)); continue
  fi
  if [ "$PRUNE_REMOVED" -ge "$WORKTREE_PRUNE_MAX" ]; then
    PRUNE_SKIPPED=$((PRUNE_SKIPPED + 1)); continue
  fi
  if git -C "$ROOT" worktree remove "$wt_path" >/dev/null 2>&1; then
    PRUNE_REMOVED=$((PRUNE_REMOVED + 1))
    say "WORKTREE_PRUNED=$wt_path"
  else
    PRUNE_SKIPPED=$((PRUNE_SKIPPED + 1))
  fi
done < <(git -C "$ROOT" worktree list --porcelain | awk '/^worktree /{print $2}')
git -C "$ROOT" worktree prune >/dev/null 2>&1 || true
say "WORKTREE_PRUNE_REMOVED=$PRUNE_REMOVED"
say "WORKTREE_PRUNE_SKIPPED=$PRUNE_SKIPPED"
say "WORKTREE_PRUNE_TTL_HOURS=$WORKTREE_TTL_HOURS"

# --- retenção de áudio: arquivos antigos saem, recentes ficam ---
# Só remove mídia gerada sob o diretório de áudio. Qualquer outro arquivo, ou
# mídia dentro da janela de retenção, é preservado. Sem --force, sem wildcard solto.
AUDIO_DIR="${CENTRALDARK_AUDIO_DIR:-/data/audio}"
AUDIO_TTL_DAYS="${CENTRALDARK_AUDIO_TTL_DAYS:-7}"
AUDIO_PRUNED=0
AUDIO_PRUNED_BYTES=0
if [ -d "$AUDIO_DIR" ]; then
  audio_cutoff=$(( now_epoch - AUDIO_TTL_DAYS * 86400 ))
  while IFS= read -r audio_path; do
    [ -n "$audio_path" ] || continue
    [ -f "$audio_path" ] || continue
    audio_mtime="$(stat -c %Y "$audio_path" 2>/dev/null || echo "$now_epoch")"
    [ "$audio_mtime" -lt "$audio_cutoff" ] || continue
    audio_size="$(stat -c %s "$audio_path" 2>/dev/null || echo 0)"
    if rm -f -- "$audio_path"; then
      AUDIO_PRUNED=$((AUDIO_PRUNED + 1))
      AUDIO_PRUNED_BYTES=$((AUDIO_PRUNED_BYTES + audio_size))
    fi
  done < <(find "$AUDIO_DIR" -type f \( -name '*.mp3' -o -name '*.wav' -o -name '*.ogg' -o -name '*.m4a' -o -name '*.opus' \) 2>/dev/null)
fi
say "AUDIO_RETENTION_DAYS=$AUDIO_TTL_DAYS"
say "AUDIO_PRUNED=$AUDIO_PRUNED"
say "AUDIO_PRUNED_BYTES=$AUDIO_PRUNED_BYTES"

sync_head="$(git -C "$SYNC_ROOT" rev-parse HEAD)"
[ "$sync_head" = "$main_sha" ] || fail "SYNC_HEAD_DOES_NOT_MATCH_REMOTE_MAIN"
[ -z "$(git -C "$SYNC_ROOT" status --porcelain)" ] || fail "SYNC_WORKTREE_DIRTY_AFTER_CLEAN"

boot_output="$(mktemp "${TMPDIR:-/tmp}/centraldark-auto-sync.XXXXXX")"
trap 'rm -f "$boot_output"' EXIT
set +e
python3 "$SYNC_ROOT/$BOOT" boot --input '{}' >"$boot_output"
boot_rc=$?
set -e
# The loader returns 4 for a clean main read with no active mission. The JSON
# result is authoritative for the gates; other non-zero exits are real errors.
[ "$boot_rc" = 0 ] || [ "$boot_rc" = 4 ] || fail "BOOT_COMMAND_FAILED_RC_$boot_rc"

# Reuse the single CentralDark skill-sync owner after the same main SHA is proven.
# This never overwrites independently changed runtime skills: the checker owns
# locks, backups, hash seals, and ORACLE_REQUIRED_RUNTIME_DRIFT classification.
SKILL_SYNC_CHECKER="$SYNC_ROOT/scripts/skill-sync-check.sh"
SKILL_SYNC_OUTPUT=""
SKILL_SYNC_RC=0
if [[ -x "$SKILL_SYNC_CHECKER" ]]; then
  SKILL_SYNC_OUTPUT="$(CENTRALDARK_ROOT="$SYNC_ROOT" CENTRALDARK_SKILL_SYNC_REF="$main_sha" bash "$SKILL_SYNC_CHECKER" --apply 2>&1)" || SKILL_SYNC_RC=$?
else
  SKILL_SYNC_OUTPUT="SKILL_SYNC=BLOCKED_OWNER_MISSING"
  SKILL_SYNC_RC=69
fi
printf '%s\n' "$SKILL_SYNC_OUTPUT"

python3 - "$boot_output" "$SYNC_ROOT" "$main_sha" "$RECEIPT_DIR" "$SKILL_SYNC_RC" "$SKILL_SYNC_OUTPUT" "$API_VERIFY" "$GITHUB_API_MAIN_SHA" "$already_synced" "$PRUNE_REMOVED" "$PRUNE_SKIPPED" "$WORKTREE_TTL_HOURS" "$AUDIO_PRUNED" "$AUDIO_PRUNED_BYTES" "$AUDIO_TTL_DAYS" <<'PY'
import json
import sys
from pathlib import Path

output, sync_root, main_sha, receipt_dir, skill_sync_rc, skill_sync_output, api_verify, api_main_sha, already_synced, prune_removed, prune_skipped, prune_ttl, audio_pruned, audio_pruned_bytes, audio_ttl_days = sys.argv[1:]
text = Path(output).read_text(encoding="utf-8", errors="replace")
start = text.find("{")
if start < 0:
    raise SystemExit("BOOT_OUTPUT_NOT_JSON")
data = json.loads(text[start:])
status = data.get("status", "UNKNOWN")
hud = data.get("hud_first", {})
if status != "CANONICAL_MAIN_LOADED" or hud.get("status") != "PASS":
    raise SystemExit(f"BOOT_GATE_NOT_PASS status={status} hud={hud.get('status', 'UNKNOWN')}")
skill_status = "PASS" if int(skill_sync_rc) == 0 and "MAIN_RUNTIME_LOCK=PASS" in skill_sync_output else "BLOCKED_OR_UNKNOWN"
overall_status = "PASS" if skill_status == "PASS" else "PARTIAL"
receipt = {
    "status": overall_status,
    "sync_root": sync_root,
    "main_sha": main_sha,
    "sync_mode": "NOOP_ALREADY_AT_MAIN_SHA" if already_synced == "true" else "UPDATED_TO_MAIN_SHA",
    "api_verify": api_verify,
    "api_main_sha": api_main_sha or None,
    "worktrees_pruned": int(prune_removed),
    "worktrees_skipped": int(prune_skipped),
    "worktree_ttl_hours": int(prune_ttl),
    "audio_pruned": int(audio_pruned),
    "audio_pruned_bytes": int(audio_pruned_bytes),
    "audio_retention_days": int(audio_ttl_days),
    "boot_status": status,
    "hud_status": hud.get("status"),
    "hud_reason": hud.get("reason"),
    "runtime_preflight": data.get("canonical_boot", {}).get("runtime_preflight_contract", {}).get("status"),
    "canonical_consumption": data.get("canonical_boot", {}).get("canonical_consumption", {}).get("status"),
    "skill_sync_rc": int(skill_sync_rc),
    "skill_sync_status": skill_status,
}
path = Path(receipt_dir)
path.mkdir(parents=True, exist_ok=True)
(path / "last.json").write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"CENTRALDARK_AUTO_SYNC={overall_status}")
for key, value in receipt.items():
    print(f"{key.upper()}={value}")
PY

say "SYNC_ROOT=$SYNC_ROOT"
say "MAIN_SHA=$main_sha"
say "WORKTREE_CLEAN=true"
say "RECEIPT=$RECEIPT_DIR/last.json"
