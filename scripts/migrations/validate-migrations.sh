#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
MIGRATIONS_DIR="${1:-$REPO_ROOT/supabase/migrations}"

fail() {
  printf 'ERRO: %s\n' "$*" >&2
  exit 1
}

[[ -d "$MIGRATIONS_DIR" ]] || fail "diretorio de migrations inexistente: $MIGRATIONS_DIR"

mapfile -d '' migration_files < <(
  find "$MIGRATIONS_DIR" -type f -name '*.sql' -print0 | LC_ALL=C sort -z
)

(( ${#migration_files[@]} > 0 )) || fail "nenhuma migration .sql encontrada"

declare -A seen_versions=()

for migration_file in "${migration_files[@]}"; do
  migration_name="$(basename "$migration_file")"

  [[ -s "$migration_file" ]] || fail "migration vazia: $migration_name"

  if grep -nE '^(<<<<<<<|=======|>>>>>>>)' "$migration_file" >/dev/null; then
    fail "marcador de conflito Git encontrado: $migration_name"
  fi

  if [[ "$migration_name" =~ ^([0-9]{14})_.+\.sql$ ]]; then
    migration_version="${BASH_REMATCH[1]}"
    if [[ -n "${seen_versions[$migration_version]:-}" ]]; then
      fail "timestamp duplicado: $migration_version ($migration_name e ${seen_versions[$migration_version]})"
    fi
    seen_versions[$migration_version]="$migration_name"
  else
    fail "nome invalido; esperado <YYYYMMDDHHMMSS>_<descricao>.sql: $migration_name"
  fi
done

checksum="$({
  cd "$MIGRATIONS_DIR"
  find . -type f -name '*.sql' -print0 \
    | LC_ALL=C sort -z \
    | xargs -0 sha256sum
} | sha256sum | awk '{print $1}')"

printf 'OK: %d migrations validadas\n' "${#migration_files[@]}"
printf 'CHECKSUM=%s\n' "$checksum"
