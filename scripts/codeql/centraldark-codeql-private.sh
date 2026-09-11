#!/usr/bin/env bash
set -euo pipefail

ROOT="${CENTRALDARK_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
REPO="${GITHUB_REPOSITORY:-ServerVpss/CentralDark}"
RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)"
RUN_DIR="${CENTRALDARK_CODEQL_RUN_DIR:-$ROOT/.centraldark/codeql-runs/$RUN_ID}"
LICENSED="${CENTRALDARK_CODEQL_PRIVATE_LICENSED:-false}"
VISIBILITY="${CENTRALDARK_REPO_VISIBILITY:-unknown}"

log() { printf '%s\n' "$*"; }
fail() { log "CODEQL_STATUS=BLOCKED"; log "CODEQL_CAUSE=$1"; exit "${2:-3}"; }

cd "$ROOT"

if [ ! -d .git ]; then
  fail NOT_GIT_REPOSITORY
fi

if [ "$VISIBILITY" = "unknown" ] && command -v gh >/dev/null 2>&1; then
  VISIBILITY="$(gh repo view "$REPO" --json visibility --jq '.visibility' 2>/dev/null | tr '[:upper:]' '[:lower:]' || true)"
  [ -n "$VISIBILITY" ] || VISIBILITY=unknown
fi

log "CODEQL_REPO=$REPO"
log "CODEQL_VISIBILITY=$VISIBILITY"

if [ "$VISIBILITY" != "public" ] && [ "$LICENSED" != "true" ]; then
  fail PRIVATE_REPOSITORY_REQUIRES_GITHUB_CODE_SECURITY_LICENSE
fi

if ! command -v codeql >/dev/null 2>&1; then
  fail CODEQL_CLI_NOT_INSTALLED 4
fi

mkdir -p "$RUN_DIR"

LANGS=()
if find "$ROOT" -type f \( -name '*.js' -o -name '*.jsx' -o -name '*.ts' -o -name '*.tsx' -o -name '*.mjs' -o -name '*.cjs' \) \
  -not -path '*/node_modules/*' -not -path '*/dist/*' -not -path '*/build/*' -print -quit | grep -q .; then
  LANGS+=(javascript-typescript)
fi
if find "$ROOT" -type f -name '*.py' -not -path '*/.venv/*' -not -path '*/venv/*' -print -quit | grep -q .; then
  LANGS+=(python)
fi

if [ "${#LANGS[@]}" -eq 0 ]; then
  fail NO_SUPPORTED_SOURCE_DETECTED 5
fi

analyze_language() {
  local lang="$1"
  local db="$RUN_DIR/db-$lang"
  local sarif="$RUN_DIR/$lang.sarif"
  local suite

  case "$lang" in
    javascript-typescript)
      suite="codeql/javascript-queries:codeql-suites/javascript-security-and-quality.qls"
      ;;
    python)
      suite="codeql/python-queries:codeql-suites/python-security-and-quality.qls"
      ;;
    *)
      fail "UNSUPPORTED_LANGUAGE_$lang" 6
      ;;
  esac

  log "CODEQL_DATABASE_CREATE=$lang"
  codeql database create "$db" \
    --language="$lang" \
    --source-root="$ROOT"

  log "CODEQL_ANALYZE=$lang"
  codeql database analyze "$db" "$suite" \
    --format=sarif-latest \
    --output="$sarif" \
    --sarif-add-query-help \
    --download

  test -s "$sarif" || fail "SARIF_EMPTY_$lang" 7
  log "CODEQL_SARIF_$lang=$sarif"
}

for lang in "${LANGS[@]}"; do
  analyze_language "$lang"
done

python3 - "$RUN_DIR" "${LANGS[*]}" <<'PY'
import json, sys
from pathlib import Path
run_dir = Path(sys.argv[1])
langs = sys.argv[2].split()
summary = {
    "schema": "centraldark.codeql.private.v1",
    "status": "PASS",
    "languages": langs,
    "sarif": [str(run_dir / f"{lang}.sarif") for lang in langs],
    "unknown_is_not_pass": True,
    "documented_is_not_executed": True,
}
(run_dir / "receipt.json").write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
print(f"CODEQL_RECEIPT={run_dir / 'receipt.json'}")
PY

log "CODEQL_STATUS=PASS"
log "CODEQL_RUN_DIR=$RUN_DIR"
