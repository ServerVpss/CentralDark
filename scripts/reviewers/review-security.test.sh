#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=review-security.sh
source "$ROOT/review-security.sh"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

printf '%s\n' 'apps/api/server.mjs' > "$WORK/paths-safe"
printf '%s\n' 'apps/api/.env.production' > "$WORK/paths-bad"
printf '%s\n' '+ const value = process.env.API_KEY;' > "$WORK/diff-safe"
bad_token="x""ai-1234567890abcdefghijklmnop"
printf '%s\n' "+ token = ${bad_token}" > "$WORK/diff-bad"

review_check_sensitive_paths "$WORK/paths-safe"
! review_check_sensitive_paths "$WORK/paths-bad"
review_scan_diff "$WORK/diff-safe"
! review_scan_diff "$WORK/diff-bad"

redacted="$(printf 'Bearer abc.def.ghi %s\n' "$bad_token" | review_redact)"
case "$redacted" in
  *1234567890abcdefghijklmnop*) echo 'ERRO: redaction falhou' >&2; exit 1 ;;
esac

REVIEW_DIFF_MAX_BYTES=4
! review_scan_diff "$WORK/diff-safe"

echo 'OK: paths, secret patterns, limite e redaction validados'
