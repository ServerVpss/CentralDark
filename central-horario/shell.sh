#!/usr/bin/env bash
set -euo pipefail

CENTRALDARK_TIME_ZONE='America/Sao_Paulo'

centraldark_brasilia_now() {
  TZ="$CENTRALDARK_TIME_ZONE" date '+%d/%m/%Y %H:%M:%S BRT'
}

centraldark_utc_iso() {
  date -u '+%Y-%m-%dT%H:%M:%SZ'
}
