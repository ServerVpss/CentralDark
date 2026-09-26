#!/bin/sh
set -eu
exec python -m runtime.cli "${1:-/mission/mission.json}"
