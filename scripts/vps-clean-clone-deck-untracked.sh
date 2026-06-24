#!/bin/bash
# Limpeza segura de arquivos untracked do clone-deck na VPS.
# - Nao apaga definitivamente: move para quarentena.
# - Roda somente em /root/Multizap/apps/clone-deck.
# - Nao toca Recargas, Gateway, WuzAPI, Supabase, PM2 ou secrets.
set -uo pipefail

CLONE_DECK="${CLONE_DECK:-/root/Multizap/apps/clone-deck}"
QUARANTINE_ROOT="${CLONE_DECK_QUARANTINE_ROOT:-/root/Multizap/quarantine}"
LOG="${CLONE_DECK_CLEAN_LOG:-/var/log/clone-deck-cleanup.log}"

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1" >> "$LOG" 2>/dev/null || true
}

abort() {
  log "[ABORT] $1"
  echo "[ABORT] $1"
  exit 1
}

cd "$CLONE_DECK" 2>/dev/null || abort "nao consegui entrar em $CLONE_DECK"

CURRENT_DIR="$(pwd -P)"
if [ "$CURRENT_DIR" != "/root/Multizap/apps/clone-deck" ]; then
  abort "pasta inesperada: $CURRENT_DIR"
fi

case "$CURRENT_DIR" in
  /root/whatsapp-server*|/root/Multizap/gateway*|/root/clone-deck-webhook*|/root/Multizap/secrets*)
    abort "pasta protegida: $CURRENT_DIR"
    ;;
esac

if [ ! -d .git ]; then
  abort "nao e repositorio git: $CURRENT_DIR"
fi

BRANCH="$(git branch --show-current 2>/dev/null || true)"
if [ "$BRANCH" != "main" ]; then
  abort "branch inesperada: ${BRANCH:-vazia}; esperado main"
fi

mapfile -d '' UNTRACKED < <(git ls-files --others --exclude-standard -z)
if [ "${#UNTRACKED[@]}" -eq 0 ]; then
  log "[OK] nenhum untracked para mover"
  echo "[OK] nenhum untracked para mover"
  exit 0
fi

STAMP="$(date +%Y%m%d%H%M%S)"
Q="$QUARANTINE_ROOT/clone-deck-untracked-$STAMP"
mkdir -p "$Q" || abort "nao consegui criar quarentena $Q"
chmod 700 "$Q" 2>/dev/null || true

log "[START] movendo ${#UNTRACKED[@]} untracked(s) para $Q"
echo "[START] movendo ${#UNTRACKED[@]} untracked(s) para $Q"

MOVED=0
SKIPPED=0
for f in "${UNTRACKED[@]}"; do
  case "$f" in
    .env|.env.*|*.env|*.pem|*.key|*.cert|*.crt|id_rsa|id_ed25519|.ssh/*|*/.env|*/.env.*|*/*secret*|*/*credential*)
      log "[SKIP] arquivo sensivel preservado: $f"
      echo "[SKIP] arquivo sensivel preservado: $f"
      SKIPPED=$((SKIPPED + 1))
      continue
      ;;
  esac

  if [ ! -e "$f" ]; then
    log "[SKIP] nao existe mais: $f"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  mkdir -p "$Q/$(dirname "$f")" || abort "falha criando destino para $f"
  mv -- "$f" "$Q/$f" || abort "falha movendo $f"
  log "[MOVED] $f -> $Q/$f"
  echo "[MOVED] $f -> $Q/$f"
  MOVED=$((MOVED + 1))
done

log "[DONE] moved=$MOVED skipped=$SKIPPED quarantine=$Q"
echo "[DONE] moved=$MOVED skipped=$SKIPPED quarantine=$Q"
