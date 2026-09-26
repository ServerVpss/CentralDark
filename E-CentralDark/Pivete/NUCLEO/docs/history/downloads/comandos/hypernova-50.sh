#!/usr/bin/env bash
set -Eeuo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
node "$HERE/../runtime/enxame-runner.mjs" --mode hypernova --allow-large --prompt "${1:-Diagnóstico técnico}"
