#!/usr/bin/env bash
set -euo pipefail
BASE="${1:-https://centralldark.com}"
curl -fsSIL "$BASE/" | sed -n '1,20p'
TMP="$(mktemp)"
curl -fsS "$BASE/" -o "$TMP"
test -s "$TMP"
grep -Eiq '<html|<!doctype' "$TMP"
echo "BASIC_EXTERNAL_SMOKE=PASS"
echo "NOTE=continue authenticated/API/agent vertical tests; HTTP alone is not final proof"
