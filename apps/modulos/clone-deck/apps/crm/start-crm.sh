#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/crm-env-loader.sh"
cd "$SCRIPT_DIR"
exec npx vite preview --host 0.0.0.0 --port 3010
