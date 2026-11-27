#!/usr/bin/env bash
# #OBSERVACOES#
# @owner: apps/modulos/fixed-point-fabric/scripts/package.sh
# @doc_ref: docs/CONSCIENCIA/RECEIPTS/2026-11-03-branches-891-funil-hud.md
# @last_updated: 2026-11-03T18:16:50.564Z
# @implementado: testes da fonte importam o pacote via PYTHONPATH local explícito.
# @pendente: CI e revisão source SAME_HEAD; runtime fora do escopo.
# @estado: SOURCE_CORRECTED; STATIC_GATES=PENDING; RUNTIME=NOT_TESTED_BY_SCOPE
# @next_cursor: confrontar gates e review debts de #1381 no PR #1977.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$(dirname "$ROOT")"
PYTHONPATH="$ROOT/src${PYTHONPATH:+:$PYTHONPATH}" python -m unittest discover -s "$ROOT/tests" -v
zip -r "centraldark-fixed-point-fabric.zip" "$(basename "$ROOT")" -x '*/.venv/*' '*/__pycache__/*' '*/.centraldark-fp/*'
