#!/usr/bin/env bash
# CentralDark-OS Bootstrap Restore — validador e restaurador
# Owner: scripts/vps/ | PR-mãe: #1562
# Modo padrão: READONLY (valida sem aplicar)
# Uso:
#   bash scripts/vps/centraldark-os-bootstrap-restore.sh                          # readonly
#   CENTRALDARK_BOOTSTRAP_APPLY=1 bash scripts/vps/centraldark-os-bootstrap-restore.sh  # valida install.sh
#   CENTRALDARK_RESTORE_APPLY=1  bash scripts/vps/centraldark-os-bootstrap-restore.sh  # restaura vault
# Nunca imprime valor de segredo.
set -euo pipefail
umask 077

BOOTSTRAP_APPLY="${CENTRALDARK_BOOTSTRAP_APPLY:-0}"
RESTORE_APPLY="${CENTRALDARK_RESTORE_APPLY:-0}"
VAULT_PATH="${CENTRALDARK_VAULT_PATH:-}"
BOOTSTRAP_ENV="${CENTRALDARK_BOOTSTRAP_ENV:-}"
REPO_ROOT="${CENTRALDARK_REPO_ROOT:-/root/CentralDark}"

CANONICAL_FILES=(
  "install.sh"
  "CENTRALDARK_AI_BOOT.yaml"
  "LEIA-ME-IA.md"
  "AGENTS.md"
)

err() { echo "ERROR: $*" >&2; }
ok()  { echo "OK: $*"; }
warn(){ echo "WARN: $*"; }

resolve_vault() {
  if [ -n "$VAULT_PATH" ] && [ -e "$VAULT_PATH" ]; then
    return 0
  fi

  if [ -n "$BOOTSTRAP_ENV" ] && [ -f "$BOOTSTRAP_ENV" ]; then
    VAULT_PATH="$(grep -oP '(?<=CENTRALDARK_VAULT_ARCHIVE=).*' "$BOOTSTRAP_ENV" || true)"
    [ -n "$VAULT_PATH" ] && [ -e "$VAULT_PATH" ] && return 0
  fi

  local latest
  latest="$(find /root/ -maxdepth 1 -name 'Vault-Cofre-CentralDark-*.tar.gz' -type f 2>/dev/null | sort -r | head -1)"
  if [ -n "$latest" ]; then
    VAULT_PATH="$latest"
    return 0
  fi

  return 1
}

validate_archive() {
  local archive="$1"
  local sha_file="${archive}.sha256"

  if [ ! -f "$archive" ]; then
    err "Archive not found: $archive"
    return 1
  fi

  if [ -f "$sha_file" ]; then
    local expected actual
    expected="$(cut -d' ' -f1 "$sha_file")"
    actual="$(sha256sum "$archive" | awk '{print $1}')"
    if [ "$expected" = "$actual" ]; then
      ok "SHA256 match: $actual"
    else
      err "SHA256 mismatch: expected=$expected actual=$actual"
      return 1
    fi
  else
    warn "SHA256 file not found: $sha_file (skipping integrity check)"
  fi

  if ! tar -tzf "$archive" >/dev/null 2>&1; then
    err "Archive corrupt or not a valid tar.gz"
    return 1
  fi

  ok "Archive valid: $archive"
  return 0
}

validate_canonical() {
  local source="$1"
  local missing=0

  for f in "${CANONICAL_FILES[@]}"; do
    if [ -f "$source/$f" ]; then
      ok "Canonical found: $f"
    else
      err "Canonical missing: $f"
      missing=$((missing + 1))
    fi
  done

  return "$missing"
}

validate_bootstrap_env() {
  local env_dir="$1"
  local env_file

  env_file="$(find "$env_dir" -name 'BOOTSTRAP-NEXT.env' -type f 2>/dev/null | head -1)"
  if [ -z "$env_file" ]; then
    warn "BOOTSTRAP-NEXT.env not found in vault"
    return 1
  fi

  ok "BOOTSTRAP-NEXT.env found: $env_file"
  grep -v '=' "$env_file" >/dev/null 2>&1 || true
  grep -c '=' "$env_file" | xargs -I{} echo "  entries: {}"
  return 0
}

main() {
  echo "=== CentralDark-OS Bootstrap Restore ==="
  echo "MODE=$([ "$RESTORE_APPLY" = "1" ] && echo "RESTORE_APPLY" || ([ "$BOOTSTRAP_APPLY" = "1" ] && echo "BOOTSTRAP_APPLY" || echo "READONLY"))"
  echo "TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)"
  echo ""

  local vault_ok=0
  local canonical_ok=0
  local installer_found="NO"
  local archive_info="NONE"
  local archive_sha="NONE"

  if resolve_vault; then
    archive_info="$VAULT_PATH"
    if validate_archive "$VAULT_PATH"; then
      vault_ok=1
      archive_sha="$(sha256sum "$VAULT_PATH" | awk '{print $1}')"

      local tmp_dir
      tmp_dir="$(mktemp -d)"
      tar -xzf "$VAULT_PATH" -C "$tmp_dir" 2>/dev/null || true
      local extracted
      extracted="$(find "$tmp_dir" -maxdepth 1 -type d ! -path "$tmp_dir" | head -1)"

      if [ -n "$extracted" ]; then
        validate_bootstrap_env "$extracted" || true

        local manifest
        manifest="$(find "$extracted" -name 'MANIFEST.tsv' -type f | head -1)"
        if [ -n "$manifest" ]; then
          local count
          count="$(($(wc -l < "$manifest") - 1))"
          ok "Manifest entries: $count"
        fi
      fi

      rm -rf "$tmp_dir"
    fi
  else
    warn "No vault archive found"
  fi

  echo ""
  echo "--- Canonical files check (repo: $REPO_ROOT) ---"
  if validate_canonical "$REPO_ROOT"; then
    canonical_ok=1
  fi

  if [ -x "$REPO_ROOT/install.sh" ]; then
    installer_found="YES"
    ok "install.sh is executable"
  elif [ -f "$REPO_ROOT/install.sh" ]; then
    installer_found="YES_NOT_EXECUTABLE"
    warn "install.sh exists but not executable"
  fi

  if [ "$BOOTSTRAP_APPLY" = "1" ] && [ "$installer_found" = "YES" ]; then
    echo ""
    echo "--- Running install.sh --check ---"
    bash "$REPO_ROOT/install.sh" --check 2>&1 || true
  fi

  if [ "$RESTORE_APPLY" = "1" ] && [ "$vault_ok" = "1" ]; then
    echo ""
    echo "--- Restore from vault (NOT IMPLEMENTED — future) ---"
    warn "Full restore requires manual validation. Vault validated, not applied."
  fi

  echo ""
  echo "=== RECEIPT ==="
  echo "BOOTSTRAP_VALIDATE=$([ "$canonical_ok" = "1" ] && echo "PASS" || echo "FAIL")"
  echo "VAULT_ARCHIVE=$archive_info"
  echo "VAULT_SHA256=$archive_sha"
  echo "INSTALLER_FOUND=$installer_found"
  echo "RESTORE_MODE=$([ "$RESTORE_APPLY" = "1" ] && echo "APPLY" || echo "READONLY")"
  echo "CANONICAL_FILES_OK=$canonical_ok"
  echo "VAULT_OK=$vault_ok"
  echo "NEXT_STEP=$(
    if [ "$vault_ok" = "0" ]; then
      echo "RUN_VAULT_INVENTORY_FIRST"
    elif [ "$canonical_ok" = "0" ]; then
      echo "FIX_MISSING_CANONICAL_FILES"
    elif [ "$RESTORE_APPLY" = "0" ]; then
      echo "SET_CENTRALDARK_RESTORE_APPLY=1_TO_RESTORE"
    else
      echo "RESTORE_COMPLETE_VERIFY_RUNTIME"
    fi
  )"
}

main "$@"
