#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
TARGET="$ROOT/scripts/dependabot/sync-all-open-prs.sh"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/bin"
cat > "$TMP/bin/gh" <<'GH'
#!/usr/bin/env bash
set -euo pipefail
args="$*"
if [[ "$args" == "api -i rate_limit" ]]; then
  printf 'HTTP/2 200\nx-ratelimit-remaining: 500\nx-ratelimit-reset: 9999999999\n\n{"resources":{"core":{"remaining":500}}}\n'
  exit 0
fi
if [[ "$args" == *"--paginate repos/ServerVpss/CentralDark/pulls?state=open&per_page=100"* ]]; then
  # Deliberadamente newest-first e sem mergeable_state: o script deve ordenar e remedir individualmente.
  printf '200\tfeature/newer\tsha200\tServerVpss/CentralDark\n'
  printf '100\tfeature/older\tsha100\tServerVpss/CentralDark\n'
  exit 0
fi
if [[ "$args" == "api repos/ServerVpss/CentralDark/pulls/100" ]]; then
  printf '{"head":{"sha":"sha100","repo":{"full_name":"ServerVpss/CentralDark"}},"mergeable_state":"UNKNOWN"}\n'
  exit 0
fi
if [[ "$args" == "api repos/ServerVpss/CentralDark/pulls/200" ]]; then
  printf '{"head":{"sha":"sha200","repo":{"full_name":"ServerVpss/CentralDark"}},"mergeable_state":"clean"}\n'
  exit 0
fi
if [[ "$args" == "api repos/ServerVpss/CentralDark/commits/sha100/check-runs?per_page=100" ]]; then
  printf '{"check_runs":[]}\n'; exit 0
fi
if [[ "$args" == "api repos/ServerVpss/CentralDark/commits/sha100/status" ]]; then
  printf '{"statuses":[]}\n'; exit 0
fi
if [[ "$args" == *"api -X PUT repos/ServerVpss/CentralDark/pulls/100/update-branch"* ]]; then
  printf '{"message":"Updating pull request branch"}\n'; exit 0
fi
if [[ "$args" == *"api -X PUT repos/ServerVpss/CentralDark/pulls/200/update-branch"* ]]; then
  echo 'Validation Failed: branch is not behind the base branch' >&2; exit 1
fi
if [[ "$args" == "run list --repo ServerVpss/CentralDark --commit sha100 --status failure -L 4 --json databaseId --jq .[].databaseId" ]]; then exit 0; fi
if [[ "$args" == "run list --repo ServerVpss/CentralDark --commit sha200 --status failure -L 4 --json databaseId --jq .[].databaseId" ]]; then exit 0; fi
# rerun phase probes activity of clean PR too
if [[ "$args" == "api repos/ServerVpss/CentralDark/commits/sha200/check-runs?per_page=100" ]]; then printf '{"check_runs":[]}\n'; exit 0; fi
if [[ "$args" == "api repos/ServerVpss/CentralDark/commits/sha200/status" ]]; then printf '{"statuses":[]}\n'; exit 0; fi
echo "UNEXPECTED_GH_CALL: $args" >&2
exit 99
GH
chmod +x "$TMP/bin/gh"
CURSOR="$TMP/cursor"
OUT="$TMP/out"
PATH="$TMP/bin:$PATH" CURSOR_FILE="$CURSOR" MAX_PRS=100 SLEEP_BETWEEN_PR=0 REPO=ServerVpss/CentralDark bash "$TARGET" >"$OUT" 2>&1
# Oldest-first must be processed first despite API returning #200 before #100.
line100="$(grep -n -- '---- PR #100 ' "$OUT" | cut -d: -f1)"
line200="$(grep -n -- '---- PR #200 ' "$OUT" | cut -d: -f1)"
[ -n "$line100" ] && [ -n "$line200" ] && [ "$line100" -lt "$line200" ]
grep -q 'UPDATE #100 OK' "$OUT"
! grep -q 'SKIP_NOT_BEHIND #100' "$OUT"
grep -q 'NOOP #200 already_synced' "$OUT"
grep -q 'RESULT=PASS_RADAR_EXECUTION' "$OUT"
# Cursor resume: #100 already done, #200 must still be visited; no starvation of newer/remaining items.
printf '100\n' > "$CURSOR"
PATH="$TMP/bin:$PATH" CURSOR_FILE="$CURSOR" MAX_PRS=100 SLEEP_BETWEEN_PR=0 REPO=ServerVpss/CentralDark bash "$TARGET" >"$OUT" 2>&1
grep -q 'SKIP_BEFORE_CURSOR #100 cursor=100' "$OUT"
grep -q -- '---- PR #200 ' "$OUT"
echo 'SYNC_ALL_OPEN_PRS_FAIRNESS_TEST=PASS'
