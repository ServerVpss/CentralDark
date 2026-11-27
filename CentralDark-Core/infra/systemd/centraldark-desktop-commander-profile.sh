#!/usr/bin/env bash
set -euo pipefail

PROFILE="${1:?profile id required}"
HOME_DIR="${2:?isolated HOME required}"
PACKAGE='@wonderwhy-er/desktop-commander@0.2.48'

if [[ ! "$PROFILE" =~ ^[A-Za-z0-9._-]+$ ]]; then
  echo "[ERRO] profile id invalido: $PROFILE" >&2
  exit 64
fi

case "$HOME_DIR" in
  /root|/root/.desktop-commander-profiles/*) ;;
  *)
    echo "[ERRO] HOME fora do corredor canonico: $HOME_DIR" >&2
    exit 64
    ;;
esac

install -d -m 0700 "$HOME_DIR"
LOCK="/run/centraldark-desktop-commander-${PROFILE}.lock"
exec 9>"$LOCK"
if ! flock -n 9; then
  echo "[ERRO] profile ja possui processo canonico ativo: $PROFILE" >&2
  exit 73
fi

export HOME="$HOME_DIR"
export NODE_OPTIONS="${NODE_OPTIONS:---dns-result-order=ipv4first}"

echo "[INFO] Desktop Commander profile=$PROFILE home=$HOME_DIR package=$PACKAGE"
exec /usr/bin/npx -y "$PACKAGE" remote
