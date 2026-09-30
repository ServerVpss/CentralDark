#!/usr/bin/env bash
set -euo pipefail
set +x

VAULT="${CENTRALDARK_SECRET_VAULT:-/root/CentralDark/secrets}"
REPO="${CENTRALDARK_GITHUB_REPO:-ServerVpss/CentralDark}"
PROBE=1
[[ "${1:-}" == "--no-probe" ]] && PROBE=0

GREEN='🟢'; YELLOW='🟡'; RED='🔴'; INFO='🔵'
declare -A SEEN=()
proven=0
candidate=0

echo "$INFO CENTRALDARK_GITHUB_AUTH_DETECTOR"
echo "HOST=$(hostname)"
echo "VAULT=$VAULT"
echo "REPO=$REPO"

probe_http() {
  local token="$1" url="$2" out="$3"
  curl --silent --show-error --output "$out" --write-out '%{http_code}' --config - "$url" <<EOF
header = "Authorization: Bearer $token"
header = "Accept: application/vnd.github+json"
header = "X-GitHub-Api-Version: 2022-11-28"
EOF
}

probe_candidate() {
  local source="$1" token="$2"
  [[ -n "$token" ]] || return 0
  local digest
  digest="$(printf '%s' "$token" | sha256sum | awk '{print $1}')"
  [[ -z "${SEEN[$digest]:-}" ]] || return 0
  SEEN[$digest]=1
  candidate=1
  echo "$YELLOW AUTH_CANDIDATE source=$source value=REDACTED"

  if [[ "$PROBE" -ne 1 ]]; then
    echo "$YELLOW AUTH_PROBE=SKIPPED source=$source"
    return 0
  fi

  local tmp user_code repo_code runners_code
  tmp="$(mktemp)"
  chmod 600 "$tmp"
  trap 'rm -f "$tmp"' RETURN

  user_code="$(probe_http "$token" "https://api.github.com/user" "$tmp" || true)"
  [[ "$user_code" == "200" ]] || {
    echo "$RED AUTHENTICATED=FAIL source=$source http=$user_code"
    return 0
  }
  echo "$GREEN AUTHENTICATED=PASS source=$source"

  repo_code="$(probe_http "$token" "https://api.github.com/repos/$REPO" "$tmp" || true)"
  if [[ "$repo_code" == "200" ]]; then
    echo "$GREEN REPO_ACCESS=PASS source=$source"
  else
    echo "$RED REPO_ACCESS=FAIL source=$source http=$repo_code"
    return 0
  fi

  runners_code="$(probe_http "$token" "https://api.github.com/repos/$REPO/actions/runners?per_page=1" "$tmp" || true)"
  if [[ "$runners_code" == "200" ]]; then
    echo "$GREEN RUNNER_ADMIN_READ=PASS source=$source"
    echo "$YELLOW RUNNER_REGISTRATION_WRITE=UNKNOWN_NOT_PROBED source=$source"
    proven=1
  else
    echo "$YELLOW RUNNER_ADMIN_READ=NOT_PROVEN source=$source http=$runners_code"
  fi
}

if command -v gh >/dev/null 2>&1 && gh auth status -h github.com >/dev/null 2>&1; then
  echo "$GREEN GH_CLI_AUTH=PROVEN"
  if [[ "$PROBE" -eq 1 ]] && gh api /user >/dev/null 2>&1; then
    echo "$GREEN GH_CLI_API=PASS"
    if gh api "/repos/$REPO/actions/runners?per_page=1" >/dev/null 2>&1; then
      echo "$GREEN GH_CLI_RUNNER_ADMIN_READ=PASS"
      echo "$YELLOW GH_CLI_RUNNER_REGISTRATION_WRITE=UNKNOWN_NOT_PROBED"
      proven=1
    else
      echo "$YELLOW GH_CLI_RUNNER_ADMIN_READ=NOT_PROVEN"
    fi
  fi
else
  echo "$RED GH_CLI_AUTH=ABSENT"
fi

for key in GH_TOKEN GITHUB_TOKEN GITHUB_PAT GH_PAT GITHUB_PERSONAL_ACCESS_TOKEN GITHUB_ACCESS_TOKEN; do
  value="${!key:-}"
  [[ -n "$value" ]] && probe_candidate "ENV:$key" "$value"
done

if [[ -d "$VAULT" ]]; then
  while IFS= read -r -d '' file; do
    case "$file" in
      */_backups/*|*/_arquivo-*/*) continue ;;
    esac
    while IFS='=' read -r raw_key raw_value; do
      key="${raw_key#export }"
      key="${key//[[:space:]]/}"
      case "$key" in
        GH_TOKEN|GITHUB_TOKEN|GITHUB_PAT|GH_PAT|GITHUB_PERSONAL_ACCESS_TOKEN|GITHUB_ACCESS_TOKEN)
          value="$raw_value"
          value="${value%$'\r'}"
          value="${value#\"}"; value="${value%\"}"
          value="${value#\'}"; value="${value%\'}"
          probe_candidate "FILE:$file KEY:$key" "$value"
          ;;
      esac
    done < "$file"
  done < <(find "$VAULT" -maxdepth 2 -type f \( -name '*.env' -o -name '.env' -o -name '.env.local' -o -name 'keys.env' \) -print0 2>/dev/null)
else
  echo "$RED SECRET_VAULT=ABSENT"
fi

reg="$VAULT/.runner-reg-token.tmp"
if [[ -f "$reg" ]]; then
  age=$(( $(date +%s) - $(stat -c %Y "$reg") ))
  echo "$YELLOW RUNNER_REG_TOKEN_FILE=PRESENT age_seconds=$age validity=NOT_PROVEN reusable_pat=false"
else
  echo "$INFO RUNNER_REG_TOKEN_FILE=ABSENT"
fi

if [[ "$proven" -eq 1 ]]; then
  echo "$GREEN REUSABLE_GITHUB_AUTH=PROVEN_FOR_AUTH_AND_RUNNER_READ"
  echo "$YELLOW READY_TO_MINT_RUNNER_REGISTRATION_TOKEN=UNKNOWN_UNTIL_WRITE_PROBE"
  exit 0
fi

if [[ "$candidate" -eq 1 ]]; then
  echo "$YELLOW REUSABLE_GITHUB_AUTH=CANDIDATE_NOT_PROVEN"
  exit 3
fi

echo "$RED REUSABLE_GITHUB_AUTH=NOT_FOUND"
exit 4
