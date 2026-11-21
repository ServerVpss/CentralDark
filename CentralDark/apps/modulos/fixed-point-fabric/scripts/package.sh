#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$(dirname "$ROOT")"
python -m unittest discover -s "$ROOT/tests" -v
zip -r "centraldark-fixed-point-fabric.zip" "$(basename "$ROOT")" -x '*/.venv/*' '*/__pycache__/*' '*/.centraldark-fp/*'
