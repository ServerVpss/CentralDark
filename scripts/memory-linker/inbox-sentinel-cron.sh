#!/usr/bin/env bash
set -euo pipefail
cd /root/CentralDark
mkdir -p logs/memory-linker
exec /usr/bin/env node scripts/memory-linker/inbox-sentinel.mjs --kanban --report logs/memory-linker/inbox-sentinel-latest.json
