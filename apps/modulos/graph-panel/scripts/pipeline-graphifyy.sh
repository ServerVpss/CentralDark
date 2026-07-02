#!/usr/bin/env bash
set -euo pipefail
BASE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$BASE"
if command -v graphifyy >/dev/null 2>&1; then
  graphifyy --ignore scripts/.graphifyignore --output data/graph.json || python3 scripts/fallback-parser.py
else
  python3 scripts/fallback-parser.py
fi
python3 scripts/audit.py
