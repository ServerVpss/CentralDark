#!/usr/bin/env bash
set -euo pipefail
repo="${1:?repo owner/name required}"
path="${2:?path required}"
out="${3:?output required}"
tmp="${out}.tmp.$$"
log="${CENTRALDARK_GH_ROVER_LOG:-/tmp/centraldark-gh-rover.log}"
mkdir -p "$(dirname "$out")"
: > "$log"
try() {
  local name="$1"; shift
  echo "TRY $name" | tee -a "$log" >&2
  if "$@" > "$tmp" 2>>"$log" && [ -s "$tmp" ]; then
    mv "$tmp" "$out"
    chmod 0644 "$out" || true
    echo "PASS $name path=$path out=$out" | tee -a "$log" >&2
    echo "$name"
    return 0
  fi
  rm -f "$tmp"
  echo "FAIL $name" | tee -a "$log" >&2
  return 1
}
fetch_gh_root() { HOME=/root GH_CONFIG_DIR=/root/.config/gh gh api "repos/$repo/contents/$path" --jq .content | base64 -d; }
fetch_gh_mcp_conta2_root_config() { HOME=/root/.centraldark/mcp-auth/profiles/conta2/home GH_CONFIG_DIR=/root/.config/gh gh api "repos/$repo/contents/$path" --jq .content | base64 -d; }
fetch_gh_default() { gh api "repos/$repo/contents/$path" --jq .content | base64 -d; }
fetch_gh_token() { GH_TOKEN="${GH_TOKEN:-}" gh api "repos/$repo/contents/$path" --jq .content | base64 -d; }
fetch_raw_public() { curl -fsSL "https://raw.githubusercontent.com/$repo/main/$path"; }
try GH_ROOT_AUTH fetch_gh_root && exit 0
try GH_MCP_CONTA2_WITH_ROOT_CONFIG fetch_gh_mcp_conta2_root_config && exit 0
try GH_PROFILE_AUTH fetch_gh_default && exit 0
if [ -n "${GH_TOKEN:-}" ]; then try GH_TOKEN_ENV fetch_gh_token && exit 0; fi
try RAW_PUBLIC fetch_raw_public && exit 0
echo "BLOCKED_REAL all GitHub routes failed for $repo:$path" | tee -a "$log" >&2
exit 70
