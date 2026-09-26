#!/usr/bin/env sh
exec node "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)/bin/uai.mjs" "$@"
